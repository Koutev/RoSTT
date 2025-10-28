'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useVMixStore, RunOfShowStep, VMixAction, calculateEndTime } from '@/store/vmix-store'
import { Plus, Trash2, Play, ArrowUp, ArrowDown, Settings, GripVertical } from 'lucide-react'
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
  const { rundown, addRowFromRunOfShow, reorderRows, updateRow, removeRow, addConsoleLog, showStartTime, showEndTime, setShowStartTime, setShowEndTime, showStatus, currentBlockIndex } = useVMixStore()
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [editingCueField, setEditingCueField] = useState<{ rowId: string; fieldId: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleEditCueField = (rowId: string, fieldId: string) => {
    setEditingCueField({ rowId, fieldId })
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

  // Recalcular horario de finalización cuando cambie la duración total
  useEffect(() => {
    const totalDuration = calcTotalDuration(rundown.rows)
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
                <div className="text-lg font-bold text-primary">{calcTotalDuration(rundown.rows)}</div>
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
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 w-8 text-left">#</th>
                    <th className="border px-2 py-1 text-left">Bloque</th>
                    <th className="border px-2 py-1 text-left">Tiempo Total</th>
                    <th className="border px-2 py-1 text-left">Duración</th>
                    <th className="border px-2 py-1 text-left">Notas</th>
                    <th className="border px-2 py-1 text-left w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rundown.rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border px-2 py-8 text-center text-muted-foreground">
                        <div className="relative overflow-visible">
                          <div className="space-y-3">
                            <p>Aún no hay bloques en tu rundown</p>
                            <BlockCreatorCompact onAddBlock={handleAddBlock} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <SortableContext items={rundown.rows.map(row => row.id)} strategy={verticalListSortingStrategy}>
                      {rundown.rows.map((row, index) => (
                        <SortableRow
                          key={row.id}
                          row={row}
                          index={index}
                          currentBlockIndex={currentBlockIndex}
                          showStatus={showStatus}
                          onEdit={setEditingBlock}
                          onRemove={removeRow}
                          onUpdateRow={updateRow}
                          onEditCueField={handleEditCueField}
                          onExecuteRow={handleExecuteRow}
                        />
                      ))}
                      
                      {/* Fila para agregar más bloques */}
                      <tr>
                        <td colSpan={6} className="border px-2 py-4 text-center">
                          <div className="relative overflow-visible">
                            <BlockCreatorCompact onAddBlock={handleAddBlock} />
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
            setEditingBlock(null)
          }}
        />
      )}

      {/* Modal de acciones temporalmente deshabilitado */}
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
  onExecuteRow
}: SortableRowProps) {
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

  const isCurrentBlock = showStatus !== 'idle' && showStatus !== 'completed' && currentBlockIndex === index

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-muted/50 ${isCurrentBlock ? 'bg-red-100 border-red-500 border-2' : ''} ${isDragging ? 'opacity-50' : ''}`}
    >
      <td className="border px-2 py-1">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded"
            title="Arrastrar para reordenar"
          >
            <GripVertical className="h-4 w-4 text-gray-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {index + 1}
          </span>
        </div>
      </td>
      <td className="border px-2 py-1">
        <div className="flex items-center gap-2">
          <Input 
            value={row.title} 
            onChange={(e) => onUpdateRow(row.id, { title: e.target.value })} 
            className="font-medium flex-1"
          />
          {isCurrentBlock && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </td>
      <td className="border px-2 py-1">
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
              onClick={() => onEdit(row.id)}
              className="h-6 w-6 p-0"
            >
              <Settings className="h-4 w-4" />
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
    </tr>
  )
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}