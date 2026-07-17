import type { Agent, Dependencia } from "@/types/agent"

// Column definition: which Agent field, the header shown in Excel, and whether
// the values should be written as numbers so Excel treats them as numeric.
type ExportColumn = {
  key: string
  header: string
  numeric?: boolean
}

// All columns we receive from the API, in a sensible reading order. The
// dependencia is exported as its resolved name instead of the raw id.
const COLUMNS: ExportColumn[] = [
  { key: "id", header: "ID", numeric: true },
  { key: "legajo", header: "Legajo", numeric: true },
  { key: "dni", header: "DNI", numeric: true },
  { key: "nombre", header: "Nombre" },
  { key: "apellido", header: "Apellido" },
  { key: "puesto", header: "Puesto" },
  { key: "dependencia", header: "Dependencia" },
  { key: "domicilio", header: "Domicilio" },
  { key: "localidad", header: "Localidad" },
  { key: "sexo", header: "Sexo" },
  { key: "fecha_nacimiento", header: "Fecha de nacimiento" },
  { key: "fecha_ingreso", header: "Fecha de ingreso" },
  { key: "nro_celular", header: "Celular" },
  { key: "nivel_estudios", header: "Nivel de estudios" },
  { key: "cantidad_hijos", header: "Cantidad de hijos", numeric: true },
  { key: "es_jerarquico", header: "Jerárquico" },
  { key: "fecha_baja", header: "Fecha de baja" },
  { key: "motivo_baja", header: "Motivo de baja" },
]

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function buildCell(value: unknown, numeric?: boolean): string {
  if (value === null || value === undefined || value === "") {
    return "<Cell><Data ss:Type=\"String\"></Data></Cell>"
  }

  if (numeric && typeof value === "number" && Number.isFinite(value)) {
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`
  }

  return `<Cell><Data ss:Type="String">${escapeXml(String(value))}</Data></Cell>`
}

/**
 * Builds a SpreadsheetML 2003 (.xls) document — a self-contained XML format
 * that Excel, LibreOffice and Google Sheets open natively as a real
 * spreadsheet, with no third-party dependency required.
 */
function buildWorkbook(rows: Agent[], dependenciaNameById: Map<number, string>): string {
  const headerRow =
    "<Row>" +
    COLUMNS.map(
      (col) => `<Cell><Data ss:Type="String">${escapeXml(col.header)}</Data></Cell>`
    ).join("") +
    "</Row>"

  const bodyRows = rows
    .map((row) => {
      const cells = COLUMNS.map((col) => {
        if (col.key === "dependencia") {
          const name = dependenciaNameById.get(row.dependencia_id) ?? ""
          return buildCell(name)
        }
        const value = (row as unknown as Record<string, unknown>)[col.key]
        return buildCell(value, col.numeric)
      }).join("")
      return `<Row>${cells}</Row>`
    })
    .join("")

  return (
    '<?xml version="1.0"?>\n' +
    '<?mso-application progid="Excel.Sheet"?>\n' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"' +
    ' xmlns:o="urn:schemas-microsoft-com:office:office"' +
    ' xmlns:x="urn:schemas-microsoft-com:office:excel"' +
    ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"' +
    ' xmlns:html="http://www.w3.org/TR/REC-html40">' +
    '<Worksheet ss:Name="Agentes"><Table>' +
    headerRow +
    bodyRows +
    "</Table></Worksheet></Workbook>"
  )
}

/**
 * Exports the given agents to an Excel file and triggers a browser download.
 * `dependencias` is used to map each agent's dependencia_id to its name.
 */
export function exportAgentesToExcel(
  rows: Agent[],
  dependencias: Dependencia[],
  fileName = "agentes.xls"
): void {
  const dependenciaNameById = new Map<number, string>(
    dependencias.map((dep) => [dep.id, dep.nombre])
  )

  const xml = buildWorkbook(rows, dependenciaNameById)
  const blob = new Blob([xml], {
    type: "application/vnd.ms-excel;charset=utf-8",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
