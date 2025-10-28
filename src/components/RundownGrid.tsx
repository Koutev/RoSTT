'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useVMixStore } from '@/store/vmix-store'
import { Trash2, Play, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { automationEngine } from '@/services/automation-engine'

export default function RundownGrid() {
  const {
    rundown,
    updateRow,
    removeRow,
    reorderRows,
    executeRow,
    addConsoleLog,
  } = useVMixStore()

  const handleExecuteRow = async (rowId: string) => {
    const row = rundown.rows.find(r => r.id === rowId)
    if (!row) return
    
    addConsoleLog({ message: `Ejecutando fila: ${row.title}`, type: 'info' })
    
    for (const action of row.actions) {
      await automationEngine.executeAction(action)
    }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rundown</CardTitle>
        <CardDescription>
          Organiza tu show en filas. Las filas se crean desde el Run of Show y puedes reordenarlas aquí.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabla */}
        <div className="overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left w-8">#</th>
                <th className="border px-2 py-1 text-left">BLOQUE</th>
                {rundown.columns.map(col => (
                  <th key={col.id} className="border px-2 py-1 text-left">
                    {col.title}
                  </th>
                ))}
                <th className="border px-2 py-1 text-left w-32">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {rundown.rows.length === 0 ? (
                <tr>
                  <td colSpan={rundown.columns.length + 3} className="border px-2 py-8 text-center text-muted-foreground">
                    No hay filas en el rundown. Crea pasos en el Run of Show para agregar filas aquí.
                  </td>
                </tr>
              ) : (
                rundown.rows
                  .sort((a, b) => a.order - b.order)
                  .map((row, index) => (
                    <tr key={row.id} className="hover:bg-muted/50">
                      <td className="border px-2 py-1 text-center">
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveRow(row.id, 'up')}
                            disabled={index === 0}
                            className="h-4 w-4 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium">{index + 1}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveRow(row.id, 'down')}
                            disabled={index === rundown.rows.length - 1}
                            className="h-4 w-4 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="border px-2 py-1">
                        <div className="space-y-1">
                          <Input
                            value={row.title}
                            onChange={(e) => updateRow(row.id, { title: e.target.value })}
                            className="font-medium"
                          />
                          {row.description && (
                            <p className="text-xs text-muted-foreground">{row.description}</p>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {row.actions.length} acciones
                          </Badge>
                        </div>
                      </td>
                      <td className="border px-2 py-1">
                        <Input
                          value={row.time || ''}
                          onChange={(e) => updateRow(row.id, { time: e.target.value })}
                          placeholder="00:00:00"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <Input
                          value={row.duration || ''}
                          onChange={(e) => updateRow(row.id, { duration: e.target.value })}
                          placeholder="2:00"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <Input
                          value={row.notes || ''}
                          onChange={(e) => updateRow(row.id, { notes: e.target.value })}
                          placeholder="Notas..."
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleExecuteRow(row.id)}
                            className="flex items-center gap-1"
                          >
                            <Play className="h-3 w-3" />
                            Ejecutar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeRow(row.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
  )
}


