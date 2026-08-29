import * as React from "react"
import { apiFetch } from "@/lib/api"
import { exportAgentesToExcel } from "@/lib/export-excel"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import type { Agent, Dependencia } from "@/types/agent"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import TableCellViewer from "@/components/TableCellViewer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  EllipsisVerticalIcon,
  Columns3Icon,
  DownloadIcon,
  SearchIcon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronsUpDownIcon,
  UserRoundXIcon,
} from "lucide-react"

// These columns exist so their data can be viewed/filtered, but stay
// hidden by default to keep the table from being overwhelming - toggle
// them on via the "Columnas" dropdown.
const DEFAULT_COLUMN_VISIBILITY = {
  dependencia: false,
  domicilio: false,
  nro_celular: false,
  fecha_nacimiento: false,
  nivel_estudios: false,
  cantidad_hijos: false,
  es_jerarquico: false,
  fecha_baja: false,
  motivo_baja: false,
  tipo_contratacion: false,
  categoria: false,
  nro: false,
  fecha_promocion: false,
  decreto_nro: false,
  observaciones: false,
}

// Human labels for columns toggled via the "Columnas" dropdown, since
// several ids (nro_celular, es_jerarquico, ...) don't read well raw.
const COLUMN_LABELS: Record<string, string> = {
  legajo: "Legajo",
  dni: "DNI",
  puesto: "Puesto",
  localidad: "Localidad",
  fecha_ingreso: "Ingreso",
  sexo: "Sexo",
  dependencia: "Dependencia",
  domicilio: "Domicilio",
  nro_celular: "Celular",
  fecha_nacimiento: "Nacimiento",
  nivel_estudios: "Nivel",
  cantidad_hijos: "Hijos",
  es_jerarquico: "Jerárquico",
  fecha_baja: "Baja",
  motivo_baja: "Motivo baja",
  tipo_contratacion: "Tipo de contratación",
  categoria: "Categoría",
  nro: "Nro.",
  fecha_promocion: "Fecha de promoción",
  decreto_nro: "Decreto Nro.",
  observaciones: "Observaciones",
}

const ENUM_FILTER_COLUMNS: { id: string; label: string; options: string[] }[] = [
  {
    id: "localidad",
    label: "Localidad",
    options: [
      "AMERICA",
      "GONZALEZ MORENO",
      "FORTIN OLAVARRIA",
      "SANSINENA",
      "ROOSEVELT",
      "SUNDBLAD",
      "MIRA PAMPA",
      "SAN MAURICIO",
      "BADANO",
      "CERRITO",
      "CONDARCO",
      "VALENTIN GOMEZ",
      "VILLA SENA",
      "COLONIA EL BALDE",
      "OTRO",
    ],
  },
  { id: "sexo", label: "Sexo", options: ["M", "F"] },
  { id: "es_jerarquico", label: "Jerárquico", options: ["SI", "NO"] },
  {
    id: "tipo_contratacion",
    label: "Tipo de contratación",
    options: ["PLANTA PERMANENTE", "JORNALIZADO", "CONTRATADO", "PLANES"],
  },
]

// Clickable column header that toggles ascending/descending/no sort.
function SortableHeader({
  column,
  label,
}: {
  column: Column<Agent, unknown>
  label: string
}) {
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUpIcon className="ml-2 size-4" />
      ) : sorted === "desc" ? (
        <ArrowDownIcon className="ml-2 size-4" />
      ) : (
        <ChevronsUpDownIcon className="ml-2 size-4 text-muted-foreground/50" />
      )}
    </Button>
  )
}


// `schema` is imported from `src/types/agent.ts`

function ActionsCell({
  item,
  open,
  onOpenChange,
  dependencias,
  onSave,
  onReingresar,
}: {
  item: Agent
  open: boolean
  onOpenChange: (open: boolean) => void
  dependencias: Dependencia[]
  onSave?: (updatedItem: Agent) => void
  onReingresar?: (item: Agent) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
        >
          <EllipsisVerticalIcon />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            onOpenChange(true)
          }}
        >
          Ver detalle
        </DropdownMenuItem>
        {onReingresar && item.fecha_baja ? (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              onReingresar(item)
            }}
          >
            Reingresar
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Eliminar</DropdownMenuItem>
      </DropdownMenuContent>

      <TableCellViewer
        item={item}
        open={open}
        onOpenChange={onOpenChange}
        dependencias={dependencias}
        onSave={onSave}
      />
    </DropdownMenu>
  )
}

export function DataTable({
  data: initialData,
  onReingresar,
  creatingOpen,
  onCreatingOpenChange,
  vistaBajas,
  onToggleVistaBajas,
}: {
  data: Agent[]
  onReingresar?: (item: Agent) => void
  creatingOpen?: boolean
  onCreatingOpenChange?: (open: boolean) => void
  vistaBajas?: boolean
  onToggleVistaBajas?: () => void
}) {
  const [data, setData] = React.useState(() => initialData)
  const [activeDrawerId, setActiveDrawerId] = React.useState<number | null>(null)
  const [columnasOpen, setColumnasOpen] = React.useState(false)
  const [dependencias, setDependencias] = React.useState<Dependencia[]>([])

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // Dependencias rarely change, so fetch the catalog once on mount.
  React.useEffect(() => {
    const fetchDependencias = async () => {
      try {
        const response = await apiFetch("/dependencias")
        if (!response.ok) throw new Error("Error al obtener las dependencias")
        setDependencias(await response.json())
      } catch (error) {
        console.error("Error al obtener las dependencias:", error)
      }
    }

    fetchDependencias()
  }, [])
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(DEFAULT_COLUMN_VISIBILITY)
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const columns = React.useMemo<ColumnDef<Agent>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Seleccionar todo"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Seleccionar fila"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "apellido",
        header: ({ column }) => <SortableHeader column={column} label="Agente" />,
        cell: ({ row }) => (
          <TableCellViewer
            item={row.original}
            dependencias={dependencias}
            onSave={(updatedItem) => {
              setData((prev) =>
                prev.map((current) =>
                  current.id === updatedItem.id ? updatedItem : current
                )
              )
            }}
          />
        ),
        enableHiding: false,
        enableGlobalFilter: true,
      },
      {
        accessorKey: "legajo",
        header: ({ column }) => <SortableHeader column={column} label="Legajo" />,
        cell: ({ row }) => <div className="font-medium">{row.original.legajo}</div>,
        enableGlobalFilter: true,
      },
      {
        accessorKey: "dni",
        header: ({ column }) => <SortableHeader column={column} label="DNI" />,
        cell: ({ row }) => <div>{row.original.dni}</div>,
      },
      {
        accessorKey: "puesto",
        header: ({ column }) => <SortableHeader column={column} label="Puesto" />,
        cell: ({ row }) => (
          <div className="max-w-[260px] truncate text-sm">{row.original.puesto}</div>
        ),
      },
      {
        accessorKey: "localidad",
        header: ({ column }) => <SortableHeader column={column} label="Localidad" />,
        cell: ({ row }) => <div>{row.original.localidad}</div>,
        filterFn: "equalsString",
      },
      {
        accessorKey: "fecha_ingreso",
        header: ({ column }) => <SortableHeader column={column} label="Ingreso" />,
        cell: ({ row }) => <div>{row.original.fecha_ingreso}</div>,
      },
      {
        accessorKey: "sexo",
        header: ({ column }) => <SortableHeader column={column} label="Sexo" />,
        cell: ({ row }) => (
          <Badge variant="outline" className="px-1.5 text-muted-foreground">
            {row.original.sexo}
          </Badge>
        ),
        filterFn: "equalsString",
      },
      {
        id: "dependencia",
        accessorFn: (row) =>
          dependencias.find((dep) => dep.id === row.dependencia_id)?.nombre ?? "",
        header: ({ column }) => <SortableHeader column={column} label="Dependencia" />,
        cell: ({ getValue }) => <div>{(getValue() as string) || "—"}</div>,
        filterFn: "equalsString",
      },
      {
        accessorKey: "domicilio",
        header: ({ column }) => <SortableHeader column={column} label="Domicilio" />,
        cell: ({ row }) => <div>{row.original.domicilio || "—"}</div>,
      },
      {
        accessorKey: "nro_celular",
        header: ({ column }) => <SortableHeader column={column} label="Celular" />,
        cell: ({ row }) => <div>{row.original.nro_celular || "—"}</div>,
      },
      {
        accessorKey: "fecha_nacimiento",
        header: ({ column }) => <SortableHeader column={column} label="Nacimiento" />,
        cell: ({ row }) => <div>{row.original.fecha_nacimiento || "—"}</div>,
      },
      {
        accessorKey: "nivel_estudios",
        header: ({ column }) => <SortableHeader column={column} label="Nivel" />,
        cell: ({ row }) => <div>{row.original.nivel_estudios || "—"}</div>,
        filterFn: "equalsString",
      },
      {
        accessorKey: "cantidad_hijos",
        header: ({ column }) => <SortableHeader column={column} label="Hijos" />,
        cell: ({ row }) => <div>{row.original.cantidad_hijos ?? "—"}</div>,
      },
      {
        accessorKey: "es_jerarquico",
        header: ({ column }) => <SortableHeader column={column} label="Jerárquico" />,
        cell: ({ row }) => <div>{row.original.es_jerarquico || "—"}</div>,
        filterFn: "equalsString",
      },
      {
        accessorKey: "fecha_baja",
        header: ({ column }) => <SortableHeader column={column} label="Baja" />,
        cell: ({ row }) => <div>{row.original.fecha_baja || "—"}</div>,
      },
      {
        accessorKey: "motivo_baja",
        header: ({ column }) => <SortableHeader column={column} label="Motivo baja" />,
        cell: ({ row }) => <div>{row.original.motivo_baja || "—"}</div>,
      },
      {
        accessorKey: "tipo_contratacion",
        header: ({ column }) => <SortableHeader column={column} label="Tipo de contratación" />,
        cell: ({ row }) => <div>{row.original.tipo_contratacion || "—"}</div>,
        filterFn: "equalsString",
      },
      {
        accessorKey: "categoria",
        header: ({ column }) => <SortableHeader column={column} label="Categoría" />,
        cell: ({ row }) => <div>{row.original.categoria || "—"}</div>,
      },
      {
        accessorKey: "nro",
        header: ({ column }) => <SortableHeader column={column} label="Nro." />,
        cell: ({ row }) => <div>{row.original.nro ?? "—"}</div>,
      },
      {
        accessorKey: "fecha_promocion",
        header: ({ column }) => <SortableHeader column={column} label="Fecha de promoción" />,
        cell: ({ row }) => <div>{row.original.fecha_promocion || "—"}</div>,
      },
      {
        accessorKey: "decreto_nro",
        header: ({ column }) => <SortableHeader column={column} label="Decreto Nro." />,
        cell: ({ row }) => <div>{row.original.decreto_nro || "—"}</div>,
      },
      {
        accessorKey: "observaciones",
        header: ({ column }) => <SortableHeader column={column} label="Observaciones" />,
        cell: ({ row }) => (
          <div className="max-w-[260px] truncate text-sm">{row.original.observaciones || "—"}</div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <ActionsCell
            item={row.original}
            open={activeDrawerId === row.original.id}
            onOpenChange={(nextOpen) => {
              setActiveDrawerId(nextOpen ? row.original.id : null)
            }}
            dependencias={dependencias}
            onSave={(updatedItem) => {
              setData((prev) =>
                prev.map((current) =>
                  current.id === updatedItem.id ? updatedItem : current
                )
              )
            }}
            onReingresar={onReingresar}
          />
        ),
      },
    ],
    [activeDrawerId, dependencias, onReingresar]
  )
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    globalFilterFn: (row, _, filterValue) => {
      const search = String(filterValue).toLowerCase().trim()
      if (!search) return true

      const nombre = String(row.original.nombre ?? "").toLowerCase()
      const apellido = String(row.original.apellido ?? "").toLowerCase()
      const legajo = String(row.original.legajo ?? "").toLowerCase()

      return (
        nombre.includes(search) ||
        apellido.includes(search) ||
        legajo.includes(search)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const selectedRows = React.useMemo(() => {
    const selection = rowSelection as Record<string, boolean>
    return data.filter((row) => selection[row.id.toString()])
  }, [data, rowSelection])

  return (
    <div className="w-full flex flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-[360px] lg:max-w-[420px]">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={globalFilter}
              onChange={(event) => {
                setGlobalFilter(event.target.value)
                table.setPageIndex(0)
              }}
              placeholder="Buscar por nombre, apellido o legajo"
              className="h-10 w-full pl-10"
            />
          </div>

          <DropdownMenu open={columnasOpen} onOpenChange={setColumnasOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3Icon data-icon="inline-start" />
                Columnas
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="max-h-72 overflow-y-auto">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        onSelect={(event) => event.preventDefault()}
                      >
                        {COLUMN_LABELS[column.id] ?? column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </div>
              <DropdownMenuSeparator />
              <div className="p-1">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setColumnasOpen(false)}
                >
                  Listo
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {onToggleVistaBajas ? (
            <Button
              variant="outline"
              size="sm"
              className={
                vistaBajas
                  ? "ml-2 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
                  : "ml-2"
              }
              onClick={onToggleVistaBajas}
            >
              <UserRoundXIcon data-icon="inline-start" />
              {vistaBajas ? "Ver activos" : "Ver bajas"}
            </Button>
          ) : null}
          {creatingOpen !== undefined ? (
            <TableCellViewer
              mode="create"
              dependencias={dependencias}
              open={creatingOpen}
              onOpenChange={onCreatingOpenChange}
              onCreate={(agente) => {
                setData((prev) => [...prev, agente])
              }}
            />
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2 shrink-0">
              <DownloadIcon data-icon="inline-start" />
              Exportar a Excel
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onSelect={() =>
                exportAgentesToExcel(data, dependencias, "agentes.xls")
              }
            >
              Todos los registros ({data.length})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={selectedRows.length === 0}
              onSelect={() =>
                exportAgentesToExcel(
                  selectedRows,
                  dependencias,
                  "agentes-seleccionados.xls"
                )
              }
            >
              Registros seleccionados ({selectedRows.length})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 lg:px-6">
        <span className="text-sm text-muted-foreground">Filtrar por:</span>
        {ENUM_FILTER_COLUMNS.map(({ id, label, options }) => {
          const column = table.getColumn(id)
          if (!column) return null
          const value = (column.getFilterValue() as string | undefined) ?? "__all__"
          return (
            <Select
              key={id}
              value={value}
              onValueChange={(next) =>
                column.setFilterValue(next === "__all__" ? undefined : next)
              }
            >
              <SelectTrigger size="sm" className="w-[170px]">
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{label} (todos)</SelectItem>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        })}
        {(() => {
          const dependenciaColumn = table.getColumn("dependencia")
          if (!dependenciaColumn) return null
          const value = (dependenciaColumn.getFilterValue() as string | undefined) ?? "__all__"
          return (
            <Select
              value={value}
              onValueChange={(next) =>
                dependenciaColumn.setFilterValue(next === "__all__" ? undefined : next)
              }
            >
              <SelectTrigger size="sm" className="w-[200px]">
                <SelectValue placeholder="Dependencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Dependencia (todas)</SelectItem>
                {dependencias.map((dep) => (
                  <SelectItem key={dep.id} value={dep.nombre}>
                    {dep.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        })()}
        {columnFilters.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => setColumnFilters([])}>
            Limpiar filtros
          </Button>
        ) : null}
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Sin resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Filas por página
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la primera página</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la página anterior</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la página siguiente</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la última página</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

