'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useVMixStore, RunOfShowStep, VMixAction } from '@/store/vmix-store'
import { Plus, Trash2, Play, ArrowUp, ArrowDown, Settings } from 'lucide-react'
import { automationEngine } from '@/services/automation-engine'
import ActionEditor from '@/components/ActionEditor'
import BlockEditor from '@/components/BlockEditor'
import CueFieldEditor from '@/components/CueFieldEditor'
import BlockCreator from '@/components/BlockCreator'

export default function ShowPlanner() {
  const { rundown, addRowFromRunOfShow, reorderRows, updateRow, removeRow, addConsoleLog } = useVMixStore()
  const [editingBlock, setEditingBlock] = useState<string | null>(null)
  const [editingCueField, setEditingCueField] = useState<{ rowId: string; fieldId: string } | null>(null)

  const handleAddBlock = (step: RunOfShowStep) => {
    addRowFromRunOfShow(step)
  }

  const handleMoveRow = (rowId: string, direction: 'up' | 'down') => {
    const currentIndex = rundown.rows.findIndex(r => r.id === rowId)
    if (currentIndex === -1) return
    const newRows = [...rundown.rows]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex >= 0 && targetIndex < newRows.length) {
      [newRows[currentIndex], newRows[targetIndex]] = [newRows[targetIndex], newRows[currentIndex]]
      reorderRows(newRows)
    }
  }

  const executeRow = async (rowId: string) => {
    const row = rundown.rows.find(r => r.id === rowId)
    if (!row) return
    addConsoleLog({ message: `Ejecutando bloque: ${row.title}`, type: 'info' })
    for (const action of row.actions) {
      await automationEngine.executeAction(action)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6">

      {/* Tabla vertical del rundown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rundown</CardTitle>
            <BlockCreator onAddBlock={handleAddBlock} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            {/* Totalizador de tiempo */}
            <div className="mb-3 text-sm text-muted-foreground">
              Tiempo total del show: {calcTotalDuration(rundown.rows)}
            </div>
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
                    <td colSpan={6} className="border px-2 py-8 text-center text-muted-foreground">Aún no hay filas. Crea tu primer bloque arriba.</td>
                  </tr>
                ) : (
                  rundown.rows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-muted/50">
                      <td className="border px-2 py-1">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleMoveRow(row.id, 'up')} disabled={index === 0}>
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium">{index + 1}</span>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleMoveRow(row.id, 'down')} disabled={index === rundown.rows.length - 1}>
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="border px-2 py-1">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input 
                              value={row.title} 
                              onChange={(e) => updateRow(row.id, { title: e.target.value })} 
                              className="font-medium flex-1"
                              style={{
                                backgroundColor: row.style?.backgroundColor,
                                color: row.style?.textColor,
                                borderColor: row.style?.borderColor,
                                borderWidth: row.style?.borderWidth,
                                borderRadius: row.style?.borderRadius
                              }}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingBlock(row.id)}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {row.description && (
                            <p className="text-xs text-muted-foreground">{row.description}</p>
                          )}
                          
                          {/* Campos personalizados */}
                          {row.customFields && row.customFields.length > 0 && (
                            <div className="space-y-1">
                              {row.customFields.map((field) => (
                                <div key={field.id} className="flex items-center gap-2">
                                  <Input
                                    value={field.value}
                                    onChange={(e) => {
                                      const updatedFields = row.customFields!.map(f =>
                                        f.id === field.id ? { ...f, value: e.target.value } : f
                                      )
                                      updateRow(row.id, { customFields: updatedFields })
                                    }}
                                    placeholder={field.placeholder || field.label}
                                    className="text-xs"
                                  />
                                  {field.type === 'cue' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setEditingCueField({ rowId: row.id, fieldId: field.id })}
                                      className="text-xs"
                                    >
                                      CUE
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            {row.customFields && row.customFields.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {row.customFields.length} campos
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="border px-2 py-1 text-sm text-muted-foreground">
                        {calcTotalDuration(rundown.rows.slice(0, index + 1))}
                      </td>
                      <td className="border px-2 py-1">
                        <Input value={(row as any).duration || ''} onChange={(e) => updateRow(row.id, { duration: e.target.value } as any)} placeholder="2:00" />
                        <p className="text-[10px] text-muted-foreground mt-1">mm:ss o hh:mm:ss</p>
                      </td>
                      <td className="border px-2 py-1">
                        <Input value={row.notes || ''} onChange={(e) => updateRow(row.id, { notes: e.target.value })} placeholder="Notas..." />
                      </td>
                      <td className="border px-2 py-1">
                        <div className="space-y-2">
                          {/* Editor de acciones */}
                          <ActionEditor
                            actions={row.actions}
                            onActionsChange={(actions) => updateRow(row.id, { actions })}
                            onExecuteAction={async (action) => {
                              addConsoleLog({ message: `Probando acción: ${action.action}`, type: 'info' })
                              await automationEngine.executeAction(action)
                            }}
                            title={row.title}
                          />
                          
                          {/* Botones de control */}
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => executeRow(row.id)} className="flex items-center gap-1">
                              <Play className="h-3 w-3" /> Ejecutar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => removeRow(row.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      {editingBlock && (
        <BlockEditor
          row={rundown.rows.find(r => r.id === editingBlock)!}
          onUpdate={(updates) => updateRow(editingBlock, updates)}
          onClose={() => setEditingBlock(null)}
        />
      )}

      {editingCueField && (
        <CueFieldEditor
          field={rundown.rows.find(r => r.id === editingCueField.rowId)?.customFields?.find(f => f.id === editingCueField.fieldId)!}
          onUpdate={(updates) => {
            const row = rundown.rows.find(r => r.id === editingCueField.rowId)!
            const updatedFields = row.customFields?.map(f =>
              f.id === editingCueField.fieldId ? { ...f, ...updates } : f
            ) || []
            updateRow(editingCueField.rowId, { customFields: updatedFields })
          }}
          onClose={() => setEditingCueField(null)}
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
      totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2]
    } else if (parts.length === 2) {
      totalSeconds += parts[0] * 60 + parts[1]
    } else if (parts.length === 1) {
      totalSeconds += parts[0]
    }
  }
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}


