'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useVMixStore, RunOfShowStep, VMixAction, calculateEndTime, RundownRow } from '@/store/vmix-store'
import { Plus, Trash2, Play, ArrowUp, ArrowDown, Settings, GripVertical, ChevronDown, ChevronRight, Hash } from 'lucide-react'
import { automationEngine } from '@/services/automation-engine'
import ActionEditor from '@/components/ActionEditor'
import BlockEditor from '@/components/BlockEditor'
import CueFieldEditor from '@/components/CueFieldEditor'
import BlockCreatorCompact from '@/components/BlockCreatorCompact'
import Timeline from '@/components/Timeline'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function ShowPlanner() {
  const { rundown, addRowFromRunOfShow, reorderRows, updateRow, removeRow, addConsoleLog, showStartTime, showEndTime, setShowStartTime, setShowEndTime, showStatus, currentBlockIndex, addItem, toggleItemExpanded, addBlockToItem } = useVMixStore()
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [editingActionsRowId, setEditingActionsRowId] = useState<string | null>(null)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const stored = localStorage.getItem('rundown-column-widths')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    try {
      localStorage.setItem('rundown-column-widths', JSON.stringify(columnWidths))
    } catch {}
  }, [columnWidths])

  const columns = [
    { id: 'col-index', min: 60, max: 220 },
    { id: 'col-block', min: 220, max: 800 },
    { id: 'col-total', min: 120, max: 260 },
    { id: 'col-duration', min: 120, max: 260 },
    { id: 'col-notes', min: 220, max: 800 },
    { id: 'col-actions', min: 160, max: 320 }
  ] as const

  const startResize = (colId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const th = (e.currentTarget as HTMLDivElement).parentElement as HTMLTableCellElement
    const startX = e.clientX
    const startWidth = th.getBoundingClientRect().width
    const colMeta = columns.find(c => c.id === colId)!

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX
      let newWidth = Math.max(colMeta.min, Math.min(colMeta.max, Math.round(startWidth + delta)))
      setColumnWidths(prev => ({ ...prev, [colId]: newWidth }))
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleEditRowActions = (rowId: string) => {
    setEditingActionsRowId(rowId)
  }

  const handleExecuteRow = async (row: RunOfShowStep) => {
    addConsoleLog({ message: `Ejecutando bloque: ${row.title}`, type: 'info' })
    for (const action of row.actions) {
      await automationEngine.executeAction(action)
    }
    addConsoleLog({ message: `Bloque completado: ${row.title}`, type: 'success' })
  }

  const handleAddBlock = (step: RunOfShowStep) => {
    addRowFromRunOfShow(step)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = rundown.rows.findIndex((row) => row.id === active.id)
      const newIndex = rundown.rows.findIndex((row) => row.id === over?.id)

      reorderRows(oldIndex, newIndex)
      addConsoleLog({
        message: `Bloque movido de posición ${oldIndex + 1} a ${newIndex + 1}`,
        type: 'info'
      })
    }
  }

  // Obtener todos los bloques del rundown (incluyendo los que están dentro de ITEMs)
  const getAllBlocks = () => {
    const allBlocks: typeof rundown.rows = []
    for (const row of rundown.rows) {
      if (row.type === 'item') {
        // Si es un ITEM, agregar solo sus bloques hijos (no el ITEM en sí)
        if (row.children) {
          allBlocks.push(...row.children)
        }
      } else {
        // Si es un bloque normal, agregarlo
        allBlocks.push(row)
      }
    }
    return allBlocks
  }

  // Recalcular horario de finalización cuando cambie la duración total
  useEffect(() => {
    const allBlocks = getAllBlocks()
    const totalDuration = calcTotalDuration(allBlocks)
    const calculatedEndTime = calculateEndTime(showStartTime, totalDuration)
    setShowEndTime(calculatedEndTime)
  }, [rundown.rows, showStartTime, setShowEndTime])

  const executeRow = async (rowId: string) => {
    const row = rundown.rows.find(r => r.id === rowId)
    if (!row) return
    addConsoleLog({ message: `Ejecutando bloque: ${row.title}`, type: 'info' })
    for (const action of row.actions) {
      await automationEngine.executeAction(action)
    }
    addConsoleLog({ message: `Bloque completado: ${row.title}`, type: 'success' })
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header del rundown */}
      <div className="flex-shrink-0 bg-muted/30 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Rundown</h1>
              <p className="text-muted-foreground">Planifica tu show paso a paso</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Duración Total</div>
                <div className="text-lg font-bold text-primary">{calcTotalDuration(getAllBlocks())}</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Inicio</div>
                <Input
                  type="time"
                  value={showStartTime}
                  onChange={(e) => setShowStartTime(e.target.value)}
                  className="w-24 text-center"
                />
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Finalización</div>
                <div className="text-lg font-bold text-primary">{showEndTime}</div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Línea de tiempo con cuenta atrás */}
      <Timeline />

      {/* Tabla del rundown */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-4">
          <div className="relative">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full border-collapse table-fixed">
                <colgroup>
                  {columns.map((c) => (
                    <col key={c.id} style={{ width: (columnWidths[c.id] || undefined) as any }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th className="border px-2 py-1 text-left relative group">
                      #
                      <div
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100"
                        onMouseDown={(e) => startResize('col-index', e)}
                      />
                    </th>
                    <th className="border px-2 py-1 text-left relative group">
                      Bloque
                      <div
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100"
                        onMouseDown={(e) => startResize('col-block', e)}
                      />
                    </th>
                    <th className="border px-2 py-1 text-center relative group">
                      Tiempo Total
                      <div
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100"
                        onMouseDown={(e) => startResize('col-total', e)}
                      />
                    </th>
                    <th className="border px-2 py-1 text-left relative group">
                      Duración
                      <div
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100"
                        onMouseDown={(e) => startResize('col-duration', e)}
                      />
                    </th>
                    <th className="border px-2 py-1 text-left relative group">
                      Notas
                      <div
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100"
                        onMouseDown={(e) => startResize('col-notes', e)}
                      />
                    </th>
                    <th className="border px-2 py-1 text-left relative group">
                      Acciones
                      <div
                        className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize opacity-0 group-hover:opacity-100"
                        onMouseDown={(e) => startResize('col-actions', e)}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rundown.rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border px-2 py-8 text-center text-muted-foreground">
                        <div className="relative overflow-visible">
                          <div className="space-y-3">
                            <p>Aún no hay bloques en tu rundown</p>
                            <BlockCreatorCompact onAddBlock={handleAddBlock} onAddItem={() => addItem()} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <SortableContext items={rundown.rows.filter(r => !r.parentId).map(row => row.id)} strategy={verticalListSortingStrategy}>
                      {rundown.rows.filter(r => !r.parentId).map((row, index) => {
                        // Calcular el índice real del bloque considerando bloques dentro de ITEMs anteriores
                        let realIndex = 0
                        for (let i = 0; i < index; i++) {
                          const prevRow = rundown.rows.filter(r => !r.parentId)[i]
                          if (prevRow.type === 'item' && prevRow.children) {
                            realIndex += prevRow.children.length
                          } else {
                            realIndex += 1
                          }
                        }
                        // Si es un ITEM, no incrementar el índice real
                        const isItem = row.type === 'item'
                        const blockIndex = isItem ? -1 : realIndex
                        
                        return (
                          <SortableRow
                            key={row.id}
                            row={row}
                            index={index}
                            currentBlockIndex={currentBlockIndex}
                            showStatus={showStatus}
                            onEdit={setEditingBlock}
                            onRemove={removeRow}
                            onUpdateRow={updateRow}
                            onEditCueField={handleEditRowActions}
                            onExecuteRow={handleExecuteRow}
                            onToggleItem={row.type === 'item' ? () => toggleItemExpanded(row.id) : undefined}
                            onAddBlockToItem={row.type === 'item' ? (step) => addBlockToItem(row.id, step) : undefined}
                            allBlocks={getAllBlocks()}
                            blockRealIndex={blockIndex}
                          />
                        )
                      })}
                      
                      {/* Fila para agregar más bloques o ITEMs */}
                      <tr>
                        <td colSpan={6} className="border px-2 py-4 text-center">
                          <div className="relative overflow-visible flex items-center justify-center">
                            <BlockCreatorCompact onAddBlock={handleAddBlock} onAddItem={() => addItem()} />
                          </div>
                        </td>
                      </tr>
                    </SortableContext>
                  )}
                </tbody>
              </table>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Modales */}
      {editingBlock && (
        <BlockEditor
          row={rundown.rows.find(r => r.id === editingBlock)!}
          onClose={() => setEditingBlock(null)}
          onUpdate={(updates) => {
            updateRow(editingBlock, updates)
          }}
        />
      )}

      {editingActionsRowId && (
        <ActionEditor
          actions={rundown.rows.find(r => r.id === editingActionsRowId)?.actions || []}
          onActionsChange={(newActions) => {
            updateRow(editingActionsRowId, { actions: newActions })
          }}
          title={`Acciones de ${rundown.rows.find(r => r.id === editingActionsRowId)?.title || ''}`}
          initialOpen
          hideOpenButton
          onClose={() => setEditingActionsRowId(null)}
        />
      )}
    </div>
  )
}

function calcTotalDuration(rows: { duration?: string }[]): string {
  let totalSeconds = 0
  for (const row of rows) {
    if (!row.duration) continue
    const parts = row.duration.split(':').map(Number)
    if (parts.length === 3) {
      // Formato HH:MM:SS
      totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2]
    } else if (parts.length === 2) {
      // Formato MM:SS
      totalSeconds += parts[0] * 60 + parts[1]
    } else if (parts.length === 1) {
      // Formato SS
      totalSeconds += parts[0]
    }
  }
  
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  // Siempre mostrar formato MM:SS
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

interface SortableRowProps {
  row: RunOfShowStep
  index: number
  currentBlockIndex: number
  showStatus: string
  onEdit: (rowId: string) => void
  onRemove: (rowId: string) => void
  onUpdateRow: (rowId: string, updates: Partial<RunOfShowStep>) => void
  onEditCueField: (rowId: string, fieldId: string) => void
  onExecuteRow: (row: RunOfShowStep) => void
  onToggleItem?: () => void
  onAddBlockToItem?: (step: RunOfShowStep) => void
}

function SortableRow({ 
  row, 
  index, 
  currentBlockIndex, 
  showStatus, 
  onEdit, 
  onRemove, 
  onUpdateRow, 
  onEditCueField,
  onExecuteRow,
  onToggleItem,
  onAddBlockToItem,
  allBlocks = [],
  blockRealIndex = -1
}: SortableRowProps) {
  const isItem = (row as RundownRow).type === 'item'
  const itemRow = row as RundownRow
  const isExpanded = itemRow.isExpanded ?? true
  const children = itemRow.children || []
  
  // Calcular el índice real para bloques dentro de ITEMs
  const getBlockRealIndex = (childIndex: number): number => {
    if (blockRealIndex >= 0) {
      return blockRealIndex + childIndex + 1
    }
    // Si el ITEM no tiene índice real, calcular desde el inicio
    let count = 0
    const allBlocksList = allBlocks.length > 0 ? allBlocks : []
    // Buscar la posición del ITEM en la lista de bloques
    for (let i = 0; i < index; i++) {
      // Esto ya se calculó arriba, usar blockRealIndex
    }
    return blockRealIndex + childIndex + 1
  }
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const ensureReadableTextColor = (bg?: string, text?: string): string | undefined => {
    if (!bg && text) return text
    if (!bg) return text
    const parseHex = (hex: string) => {
      const c = hex.replace('#', '')
      const r = parseInt(c.substring(0, 2), 16) / 255
      const g = parseInt(c.substring(2, 4), 16) / 255
      const b = parseInt(c.substring(4, 6), 16) / 255
      const lin = (u: number) => (u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4))
      const lr = lin(r), lg = lin(g), lb = lin(b)
      return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
    }
    const toHex = (s: string) => {
      if (!s) return undefined
      const v = s.trim().toLowerCase()
      if (v.startsWith('#') && (v.length === 7)) return v
      return undefined
    }
    const bgHex = toHex(bg)
    const txtHex = toHex(text || '')
    if (!bgHex) return text
    const Lbg = parseHex(bgHex)
    const contrastWith = (txt: string) => {
      const Ltxt = parseHex(txt)
      const lighter = Math.max(Lbg, Ltxt)
      const darker = Math.min(Lbg, Ltxt)
      return (lighter + 0.05) / (darker + 0.05)
    }
    const darkTxt = '#111827'
    const lightTxt = '#ffffff'
    const pickBest = () => (contrastWith(darkTxt) >= contrastWith(lightTxt) ? darkTxt : lightTxt)
    if (!txtHex) return pickBest()
    return contrastWith(txtHex) >= 4.5 ? txtHex : pickBest()
  }

  const bgColor = (row as any).style?.backgroundColor as string | undefined
  const configuredText = (row as any).style?.textColor as string | undefined
  const effectiveText = ensureReadableTextColor(bgColor, configuredText)

  const rowVisualStyle: React.CSSProperties = {
    ...(bgColor ? { backgroundColor: bgColor } : {}),
    ...(effectiveText ? { color: effectiveText } : {}),
    ...(row as any).style?.borderColor ? { borderColor: (row as any).style.borderColor } : {},
    ...(row as any).style?.borderWidth !== undefined ? { borderWidth: (row as any).style.borderWidth, borderStyle: 'solid' } : {},
  }

  const isCurrentBlock = !isItem && showStatus !== 'idle' && showStatus !== 'completed' && blockRealIndex >= 0 && currentBlockIndex === blockRealIndex

  return (
    <>
    <tr
      ref={isItem ? undefined : setNodeRef}
      style={isItem ? { ...style, backgroundColor: 'var(--muted)', borderTop: '2px solid var(--primary)', borderBottom: '2px solid var(--primary)' } : { ...style, ...rowVisualStyle }}
      className={`${isItem ? 'bg-muted/70 border-y-2 border-primary/30 font-semibold' : `hover:bg-muted/50 ${isCurrentBlock ? 'bg-red-100 border-red-500 border-2' : ''}`} ${isDragging ? 'opacity-50' : ''}`}
    >
      {!isItem && (
      <td className="border px-2 py-1">
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              {...attributes}
              {...listeners}
              onClick={() => { if (!isDragging) onEdit(row.id) }}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
              title="Editar bloque (clic) • Arrastrar para reordenar"
            >
              <GripVertical className="h-4 w-4 text-gray-500" />
            </button>
            <span className="text-sm font-medium text-muted-foreground">
              {index + 1}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.id)}
            className="h-6 px-2 py-0 text-xs"
            title="Editar bloque"
          >
            <Settings className="h-3 w-3 mr-1" />
            Editar
          </Button>
        </div>
      </td>
      )}
      <td className="border px-2 py-1" colSpan={isItem ? 6 : 1}>
        {isItem ? (
          /* Renderizado especial para ITEM/Separador */
          <div className="flex items-center gap-3 py-2.5">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleItem?.()
              }}
              className="p-1.5 hover:bg-background/50 rounded transition-colors"
              title={isExpanded ? 'Colapsar' : 'Expandir'}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-primary" />
              ) : (
                <ChevronRight className="h-5 w-5 text-primary" />
              )}
            </button>
            <Hash className="h-5 w-5 text-primary" />
            <Input 
              value={row.title} 
              onChange={(e) => onUpdateRow(row.id, { title: e.target.value })} 
              className="font-bold text-base flex-1 border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:ring-offset-0 px-2 py-1 rounded hover:bg-background/30"
              placeholder="SEGMENTO 1"
            />
            {isExpanded && (
              <Badge variant="secondary" className="text-xs">
                {children.length} bloques
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(row.id)
              }}
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          /* Renderizado normal para bloques */
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input 
                value={row.title} 
                onChange={(e) => onUpdateRow(row.id, { title: e.target.value })} 
                className="font-semibold text-sm flex-1"
              />
              {isCurrentBlock && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            {row.customFields && row.customFields.length > 0 && (
            <>
              {row.customFields.length >= 3 && (
                <div className="h-px bg-border" />
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {row.customFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-1">
                    {field.type === 'cue' && (
                      <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">CUE</Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">{field.label}</span>
                    {field.type === 'text' ? (
                      <Input
                        value={field.value}
                        onChange={(e) => {
                          const updated = (row.customFields || []).map(f => f.id === field.id ? { ...f, value: e.target.value } : f)
                          onUpdateRow(row.id, { customFields: updated as any })
                        }}
                        className="h-7 text-[11px] w-40"
                        placeholder={field.placeholder || ''}
                      />
                    ) : (
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          const updated = (row.customFields || []).map(f => f.id === field.id ? { ...f, value: v } : f)
                          onUpdateRow(row.id, { customFields: updated as any })
                        }}
                      >
                        <SelectTrigger className="h-7 text-[11px] px-2 py-0 w-40">
                          <SelectValue placeholder="Elegir" />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options || []).map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          </div>
        )}
      </td>
      {!isItem && (
        <>
          <td className="border px-2 py-1 text-center">
            <span className="text-sm text-muted-foreground">
              {calcTotalDuration([row])}
            </span>
          </td>
          <td className="border px-2 py-1">
            <Input 
              value={row.duration || ''} 
              onChange={(e) => onUpdateRow(row.id, { duration: e.target.value })} 
              placeholder="02:00"
              className="w-20"
            />
          </td>
          <td className="border px-2 py-1">
            <Textarea 
              value={row.description || ''} 
              onChange={(e) => onUpdateRow(row.id, { description: e.target.value })} 
              placeholder="Notas del bloque..."
              className="min-h-[60px] resize-none"
            />
          </td>
          <td className="border px-2 py-1">
            <div className="space-y-2">
              <div className="flex items-center gap-1 flex-wrap">
                {row.actions.map((action, actionIndex) => (
                  <Badge key={actionIndex} variant="secondary" className="text-xs">
                    {action.action}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditCueField(row.id, 'actions')}
                  className="text-xs h-6 px-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Acción
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExecuteRow(row)}
                  className="text-xs h-6 px-2"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Ejecutar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(row.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </td>
        </>
      )}
      </tr>
      {isItem && isExpanded && (
        <>
          {children.length > 0 && children.map((child, childIndex) => {
            const childRealIndex = blockRealIndex >= 0 ? blockRealIndex + childIndex + 1 : -1
            const isChildCurrentBlock = showStatus !== 'idle' && showStatus !== 'completed' && currentBlockIndex === childRealIndex
            
            return (
            <tr key={child.id} className={`bg-muted/20 ${isChildCurrentBlock ? 'bg-red-100 border-red-500 border-2' : ''}`}>
            <td className="border px-2 py-1">
              <div className="flex items-center gap-2 pl-8">
                <span className="text-xs text-muted-foreground">
                  {childRealIndex >= 0 ? childRealIndex + 1 : `${index + 1}.${childIndex + 1}`}
                </span>
              </div>
            </td>
            <td className="border px-2 py-1">
              <div className="flex flex-col gap-2 pl-8">
                <div className="flex items-center gap-2">
                  <Input 
                    value={child.title} 
                    onChange={(e) => onUpdateRow(child.id, { title: e.target.value })} 
                    className="font-semibold text-sm flex-1"
                  />
                  {isChildCurrentBlock && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                {child.customFields && child.customFields.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs pl-6">
                    {child.customFields.map((field) => (
                      <div key={field.id} className="flex items-center gap-1">
                        {field.type === 'cue' && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">CUE</Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">{field.label}</span>
                        {field.type === 'text' ? (
                          <Input
                            value={field.value}
                            onChange={(e) => {
                              const updated = (child.customFields || []).map(f => f.id === field.id ? { ...f, value: e.target.value } : f)
                              onUpdateRow(child.id, { customFields: updated as any })
                            }}
                            className="h-7 text-[11px] w-40"
                            placeholder={field.placeholder || ''}
                          />
                        ) : (
                          <Select
                            value={field.value}
                            onValueChange={(v) => {
                              const updated = (child.customFields || []).map(f => f.id === field.id ? { ...f, value: v } : f)
                              onUpdateRow(child.id, { customFields: updated as any })
                            }}
                          >
                            <SelectTrigger className="h-7 text-[11px] px-2 py-0 w-40">
                              <SelectValue placeholder="Elegir" />
                            </SelectTrigger>
                            <SelectContent>
                              {(field.options || []).map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </td>
            <td className="border px-2 py-1 text-center">
              <span className="text-sm text-muted-foreground">
                {calcTotalDuration([child])}
              </span>
            </td>
            <td className="border px-2 py-1">
              <Input 
                value={child.duration || ''} 
                onChange={(e) => onUpdateRow(child.id, { duration: e.target.value })} 
                placeholder="02:00"
                className="w-20"
              />
            </td>
            <td className="border px-2 py-1">
              <Textarea 
                value={child.description || ''} 
                onChange={(e) => onUpdateRow(child.id, { description: e.target.value })} 
                placeholder="Notas del bloque..."
                className="min-h-[60px] resize-none"
              />
            </td>
            <td className="border px-2 py-1">
              <div className="space-y-2">
                <div className="flex items-center gap-1 flex-wrap">
                  {child.actions.map((action, actionIndex) => (
                    <Badge key={actionIndex} variant="secondary" className="text-xs">
                      {action.action}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditCueField(child.id, 'actions')}
                    className="text-xs h-6 px-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Acción
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onExecuteRow(child)}
                    className="text-xs h-6 px-2"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Ejecutar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(child.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </td>
          </tr>
          )
          })}
          {/* Botón para agregar bloques dentro del ITEM cuando está expandido */}
          {onAddBlockToItem && (
            <tr className="bg-muted/10">
              <td colSpan={6} className="border px-2 py-2">
                <div className="pl-8">
                  <BlockCreatorCompact onAddBlock={onAddBlockToItem} />
                </div>
              </td>
            </tr>
          )}
        </>
      )}
    </>
  )
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}