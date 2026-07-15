import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
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
import AgentForm from "@/AgentForm"
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
  GripVerticalIcon,
  EllipsisVerticalIcon,
  Columns3Icon,
  PlusIcon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
} from "lucide-react"

const API_BASE = "https://presentismo-backend.vercel.app/api"

export const schema = z.object({
  id: z.number(),
  legajo: z.number(),
  dni: z.number(),
  apellido: z.string(),
  nombre: z.string(),
  puesto: z.string(),
  dependencia_id: z.number(),
  domicilio: z.string(),
  localidad: z.string(),
  sexo: z.string(),
  fecha_nacimiento: z.string(),
  fecha_ingreso: z.string(),
  nro_celular: z.string(),
  nivel_estudios: z.string(),
  cantidad_hijos: z.number(),
  fecha_baja: z.string().nullable().optional(),
  motivo_baja: z.string().nullable().optional(),
  es_jerarquico: z.string().nullable().optional(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

function ActionsCell({
  item,
  open,
  onOpenChange,
}: {
  item: z.infer<typeof schema>
  open: boolean
  onOpenChange: (open: boolean) => void
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
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Eliminar</DropdownMenuItem>
      </DropdownMenuContent>

      <TableCellViewer item={item} open={open} onOpenChange={onOpenChange} />
    </DropdownMenu>
  )
}

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [activeDrawerId, setActiveDrawerId] = React.useState<number | null>(null)

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [addOpen, setAddOpen] = React.useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()

  const columns = React.useMemo<ColumnDef<z.infer<typeof schema>>[]>(
    () => [
      {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
      },
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
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "apellido",
        header: "Agente",
        cell: ({ row }) => (
          <TableCellViewer
            item={row.original}
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
      },
      {
        accessorKey: "legajo",
        header: "Legajo",
        cell: ({ row }) => <div className="font-medium">{row.original.legajo}</div>,
      },
      {
        accessorKey: "dni",
        header: "DNI",
        cell: ({ row }) => <div>{row.original.dni}</div>,
      },
      {
        accessorKey: "puesto",
        header: "Puesto",
        cell: ({ row }) => (
          <div className="max-w-[260px] truncate text-sm">{row.original.puesto}</div>
        ),
      },
      {
        accessorKey: "localidad",
        header: "Localidad",
        cell: ({ row }) => <div>{row.original.localidad}</div>,
      },
      {
        accessorKey: "fecha_ingreso",
        header: "Ingreso",
        cell: ({ row }) => <div>{row.original.fecha_ingreso}</div>,
      },
      {
        accessorKey: "sexo",
        header: "Sexo",
        cell: ({ row }) => (
          <Badge variant="outline" className="px-1.5 text-muted-foreground">
            {row.original.sexo}
          </Badge>
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
          />
        ),
      },
    ],
    [activeDrawerId]
  )
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="w-full flex flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3Icon data-icon="inline-start" />
                Columnas
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
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
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Drawer open={addOpen} onOpenChange={setAddOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                <PlusIcon data-icon="inline-start" />
                Agregar agente
              </Button>
            </DrawerTrigger>

            <DrawerContent className="inset-0 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-[680px] rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 ring-1 ring-white/5">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-300 shadow-md shadow-emerald-500/10">
                      <PlusIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <DrawerTitle className="text-2xl text-white">Agregar agente</DrawerTitle>
                      <DrawerDescription className="text-sm text-slate-400">
                        Complete los datos y presione Cargar Agente.
                      </DrawerDescription>
                    </div>
                  </div>

                  <div className="mt-6">
                    <AgentForm
                      onAdd={(agente) => {
                        setData((prev) => [...prev, agente])
                      }}
                      onClose={() => setAddOpen(false)}
                    />
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
          {/* <Button variant="outline" size="sm">
            <PlusIcon
            />
            <span className="hidden lg:inline">Add Section</span>
          </Button> */}
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
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
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
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
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TableCellViewer({
  item,
  trigger,
  open,
  onOpenChange,
  onSave,
}: {
  item: z.infer<typeof schema>
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (updatedItem: z.infer<typeof schema>) => void
}) {
  const isMobile = useIsMobile()
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [currentItem, setCurrentItem] = React.useState(item)
  const firstInputRef = React.useRef<HTMLInputElement | null>(null)
  const [formData, setFormData] = React.useState({
    nombre: item.nombre,
    apellido: item.apellido,
    puesto: item.puesto,
    legajo: String(item.legajo),
    dni: String(item.dni),
    localidad: item.localidad,
    domicilio: item.domicilio,
    nro_celular: item.nro_celular,
    fecha_nacimiento: item.fecha_nacimiento,
    fecha_ingreso: item.fecha_ingreso,
    nivel_estudios: item.nivel_estudios,
    cantidad_hijos: String(item.cantidad_hijos),
  })

  const syncFromItem = React.useCallback((source: z.infer<typeof schema>) => {
    setCurrentItem(source)
    setFormData({
      nombre: source.nombre,
      apellido: source.apellido,
      puesto: source.puesto,
      legajo: String(source.legajo),
      dni: String(source.dni),
      localidad: source.localidad,
      domicilio: source.domicilio,
      nro_celular: source.nro_celular,
      fecha_nacimiento: source.fecha_nacimiento,
      fecha_ingreso: source.fecha_ingreso,
      nivel_estudios: source.nivel_estudios,
      cantidad_hijos: String(source.cantidad_hijos),
    })
  }, [])

  React.useEffect(() => {
    syncFromItem(item)
    setIsEditing(false)
    setErrorMessage(null)
  }, [item, syncFromItem])

  React.useEffect(() => {
    if (isEditing) {
      requestAnimationFrame(() => {
        firstInputRef.current?.focus()
      })
    }
  }, [isEditing])

  function InfoRow({
    label,
    value,
    field,
  }: {
    label: string
    value: React.ReactNode
    field?: keyof typeof formData
  }) {
    return (
      <div className="flex items-center justify-between gap-3 border-b pb-2">
        <span className="text-muted-foreground">{label}</span>
        {isEditing && field ? (
          <Input
            ref={field === "nombre" ? firstInputRef : undefined}
            value={String(formData[field] ?? "")}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                [field]: event.target.value,
              }))
            }
            className="h-8 max-w-44"
          />
        ) : (
          <span className="font-medium">{value}</span>
        )}
      </div>
    )
  }

function TimelineItem({
  title,
  date,
}: {
  title: string
  date: string
}) {
  return (
    <div className="flex gap-3">

      <div className="mt-1 h-3 w-3 rounded-full bg-violet-600" />

      <div>

        <p className="font-medium">
          {title}
        </p>

        <p className="text-sm text-muted-foreground">
          {date}
        </p>

      </div>

    </div>
  )
}

  const handleSave = async () => {
    setIsSaving(true)
    setErrorMessage(null)

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No hay sesión activa")
      }

      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        legajo: Number(formData.legajo),
        dni: Number(formData.dni),
        puesto: formData.puesto,
        localidad: formData.localidad,
        domicilio: formData.domicilio,
        nro_celular: formData.nro_celular,
        fecha_nacimiento: formData.fecha_nacimiento,
        fecha_ingreso: formData.fecha_ingreso,
        nivel_estudios: formData.nivel_estudios,
        cantidad_hijos: Number(formData.cantidad_hijos) || 0,
      }

      const response = await fetch(`${API_BASE}/agentes/${item.legajo}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || errorData?.message || "No se pudo guardar el agente")
      }

      const updatedAgent = {
        ...currentItem,
        ...payload,
      }

      setCurrentItem(updatedAgent)
      onSave?.(updatedAgent)
      setIsEditing(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo guardar el agente"
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      {/* If the drawer is controlled via props (open/onOpenChange), don't render
          the inline trigger (which caused the name to appear under the menu).
          Render a trigger only in uncontrolled mode so the row cell still
          shows the name as a button. */}
      {onOpenChange ? null : (
        <DrawerTrigger asChild>
          {trigger ?? (
            <Button variant="link" className="w-fit px-0 text-left text-foreground">
              {item.apellido} {item.nombre}
            </Button>
          )}
        </DrawerTrigger>
      )}
     <DrawerContent className="max-w-[500px] ml-auto">
        
        <DrawerHeader className="border-b pb-6">

  <div className="flex items-center gap-4">

    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700">
      {item.nombre[0]}
      {item.apellido[0]}
    </div>

    <div>

      <DrawerTitle className="text-xl">
        {isEditing ? `${formData.apellido} ${formData.nombre}` : `${currentItem.apellido} ${currentItem.nombre}`}
      </DrawerTitle>

      <DrawerDescription>
        {isEditing ? formData.puesto : currentItem.puesto}
      </DrawerDescription>

    </div>

  </div>

</DrawerHeader>

<div className="overflow-y-auto px-6 py-6">

  <div className="space-y-6">

    <section>

      <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
        Información personal
      </h3>

      {errorMessage ? (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-4">

        <InfoRow
          label="Nombre"
          value={currentItem.nombre}
          field="nombre"
        />

        <InfoRow
          label="Apellido"
          value={currentItem.apellido}
          field="apellido"
        />

        <InfoRow
          label="Legajo"
          value={currentItem.legajo}
          field="legajo"
        />

        <InfoRow
          label="DNI"
          value={currentItem.dni}
          field="dni"
        />

        <InfoRow
          label="Puesto"
          value={currentItem.puesto}
          field="puesto"
        />

        <InfoRow
          label="Localidad"
          value={currentItem.localidad}
          field="localidad"
        />

        <InfoRow
          label="Domicilio"
          value={currentItem.domicilio}
          field="domicilio"
        />

        <InfoRow
          label="Celular"
          value={currentItem.nro_celular}
          field="nro_celular"
        />

        <InfoRow
          label="Nacimiento"
          value={currentItem.fecha_nacimiento}
          field="fecha_nacimiento"
        />

        <InfoRow
          label="Ingreso"
          value={currentItem.fecha_ingreso}
          field="fecha_ingreso"
        />

        <InfoRow
          label="Nivel"
          value={currentItem.nivel_estudios}
          field="nivel_estudios"
        />

        <InfoRow
          label="Hijos"
          value={currentItem.cantidad_hijos}
          field="cantidad_hijos"
        />

      </div>

    </section>

    <section>

      <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
        Estado
      </h3>

      <Badge className="bg-green-500">
        Activo
      </Badge>

    </section>

    <section>

      <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">
        Historial
      </h3>

      <div className="space-y-4">

        <TimelineItem
          title="Alta del agente"
          date={item.fecha_ingreso}
        />

        <TimelineItem
          title="Última actualización"
          date="Hace 2 días"
        />

      </div>

    </section>

  </div>

</div>

<DrawerFooter className="border-t">
  {isEditing ? (
    <>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Guardando..." : "Guardar"}
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          setFormData({
            nombre: item.nombre,
            apellido: item.apellido,
            puesto: item.puesto,
            legajo: String(item.legajo),
            dni: String(item.dni),
            localidad: item.localidad,
            domicilio: item.domicilio,
            nro_celular: item.nro_celular,
            fecha_nacimiento: item.fecha_nacimiento,
            fecha_ingreso: item.fecha_ingreso,
            nivel_estudios: item.nivel_estudios,
            cantidad_hijos: String(item.cantidad_hijos),
          })
          setErrorMessage(null)
          setIsEditing(false)
        }}
        disabled={isSaving}
      >
        Cancelar
      </Button>
    </>
  ) : (
    <>
      <Button onClick={() => setIsEditing(true)}>
        Editar agente
      </Button>
      <DrawerClose asChild>
        <Button variant="outline">
          Cerrar
        </Button>
      </DrawerClose>
    </>
  )}
</DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
