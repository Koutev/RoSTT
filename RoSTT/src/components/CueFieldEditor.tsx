'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CustomField, VMixAction } from '@/store/vmix-store'
import { Plus, Trash2, Play, Settings, X } from 'lucide-react'
import { automationEngine } from '@/services/automation-engine'

interface CueFieldEditorProps {
  field: CustomField
  onUpdate: (updates: Partial<CustomField>) => void
  onClose: () => void
}

// Acciones rápidas para CUEs
const QUICK_CUE_ACTIONS = [
  { value: 'Cut', label: 'Cut - Cambio directo', category: 'Transición' },
  { value: 'Fade', label: 'Fade - Transición suave', category: 'Transición' },
  { value: 'OverlayInput1In', label: 'Overlay 1 In', category: 'Overlay' },
  { value: 'OverlayInput1Out', label: 'Overlay 1 Out', category: 'Overlay' },
  { value: 'PlayInput', label: 'Play Input', category: 'Playback' },
  { value: 'PauseInput', label: 'Pause Input', category: 'Playback' },
  { value: 'SetVolume', label: 'Set Volume', category: 'Audio' },
  { value: 'SetText', label: 'Set Text', category: 'Text' },
  { value: 'StartRecording', label: 'Start Recording', category: 'Recording' },
  { value: 'StopRecording', label: 'Stop Recording', category: 'Recording' },
]

export default function CueFieldEditor({ field, onUpdate, onClose }: CueFieldEditorProps) {
  const [editingAction, setEditingAction] = useState<VMixAction | null>(null)

  const addAction = () => {
    const newAction: VMixAction = {
      id: `action-${Date.now()}`,
      action: 'Cut',
      target: '',
      value: '',
      delay: 0
    }
    onUpdate({
      actions: [...(field.actions || []), newAction]
    })
  }

  const updateAction = (id: string, updates: Partial<VMixAction>) => {
    const updatedActions = (field.actions || []).map(action =>
      action.id === id ? { ...action, ...updates } : action
    )
    onUpdate({ actions: updatedActions })
  }

  const removeAction = (id: string) => {
    const updatedActions = (field.actions || []).filter(action => action.id !== id)
    onUpdate({ actions: updatedActions })
  }

  const testCue = async () => {
    if (field.actions && field.actions.length > 0) {
      for (const action of field.actions) {
        await automationEngine.executeAction(action)
      }
    }
  }

  const addQuickAction = (actionType: string) => {
    const newAction: VMixAction = {
      id: `action-${Date.now()}`,
      action: actionType,
      target: '',
      value: '',
      delay: 0
    }
    onUpdate({
      actions: [...(field.actions || []), newAction]
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Editor de Campo CUE</h2>
            <p className="text-sm text-muted-foreground">{field.label}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Configuración básica del campo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuración del Campo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Etiqueta del Campo</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => onUpdate({ label: e.target.value })}
                    placeholder="Ej: CUE Camera 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor por Defecto</Label>
                  <Input
                    value={field.value}
                    onChange={(e) => onUpdate({ value: e.target.value })}
                    placeholder="Valor inicial..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Placeholder</Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  placeholder="Texto de ayuda..."
                />
              </div>
            </div>

            {/* Acciones CUE */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Acciones CUE</h3>
                <div className="flex gap-2">
                  <Button onClick={testCue} disabled={!field.actions || field.actions.length === 0}>
                    <Play className="h-4 w-4 mr-2" />
                    Probar CUE
                  </Button>
                  <Button onClick={addAction}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Acción
                  </Button>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Acciones Rápidas</Label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_CUE_ACTIONS.map((action) => (
                    <Button
                      key={action.value}
                      variant="outline"
                      size="sm"
                      onClick={() => addQuickAction(action.value)}
                      className="text-xs"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Lista de acciones */}
              {(!field.actions || field.actions.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay acciones configuradas. Agrega la primera acción arriba.
                </div>
              ) : (
                <div className="space-y-3">
                  {field.actions.map((action, index) => (
                    <div key={action.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">{action.action}</span>
                          {action.delay && action.delay > 0 && (
                            <Badge variant="secondary">
                              Delay: {action.delay}s
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingAction(action)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeAction(action.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Target:</span> {action.target || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Value:</span> {action.value || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Delay:</span> {action.delay || 0}s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Editor de acción */}
            {editingAction && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Editar Acción</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Acción</Label>
                      <Select
                        value={editingAction.action}
                        onValueChange={(value) => updateAction(editingAction.id, { action: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUICK_CUE_ACTIONS.map(action => (
                            <SelectItem key={action.value} value={action.value}>
                              {action.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Delay (segundos)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={editingAction.delay || 0}
                        onChange={(e) => updateAction(editingAction.id, { delay: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target</Label>
                      <Input
                        value={editingAction.target || ''}
                        onChange={(e) => updateAction(editingAction.id, { target: e.target.value })}
                        placeholder="Ej: Camera1, Input1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Value</Label>
                      <Input
                        value={editingAction.value || ''}
                        onChange={(e) => updateAction(editingAction.id, { value: e.target.value })}
                        placeholder="Ej: 0.8, Hello World"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setEditingAction(null)}>
                      Guardar Cambios
                    </Button>
                    <Button variant="outline" onClick={() => setEditingAction(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
