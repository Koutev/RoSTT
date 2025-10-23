'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { VMixAction } from '@/store/vmix-store'
import { Plus, Trash2, Play, Settings, X } from 'lucide-react'
import { automationEngine } from '@/services/automation-engine'

interface ActionEditorProps {
  actions: VMixAction[]
  onActionsChange: (actions: VMixAction[]) => void
  onExecuteAction?: (action: VMixAction) => void
  title: string
}

// Todas las acciones disponibles de vMix API
const VMIX_ACTIONS = [
  // Transiciones
  { value: 'Cut', label: 'Cut - Cambio directo', category: 'Transiciones' },
  { value: 'Fade', label: 'Fade - Transición suave', category: 'Transiciones' },
  { value: 'FadeToBlack', label: 'Fade to Black', category: 'Transiciones' },
  { value: 'FadeFromBlack', label: 'Fade from Black', category: 'Transiciones' },
  
  // Overlays
  { value: 'OverlayInput1In', label: 'Overlay 1 In', category: 'Overlays' },
  { value: 'OverlayInput1Out', label: 'Overlay 1 Out', category: 'Overlays' },
  { value: 'OverlayInput2In', label: 'Overlay 2 In', category: 'Overlays' },
  { value: 'OverlayInput2Out', label: 'Overlay 2 Out', category: 'Overlays' },
  { value: 'OverlayInput3In', label: 'Overlay 3 In', category: 'Overlays' },
  { value: 'OverlayInput3Out', label: 'Overlay 3 Out', category: 'Overlays' },
  { value: 'OverlayInput4In', label: 'Overlay 4 In', category: 'Overlays' },
  { value: 'OverlayInput4Out', label: 'Overlay 4 Out', category: 'Overlays' },
  
  // Playback
  { value: 'PlayInput', label: 'Play Input', category: 'Playback' },
  { value: 'PauseInput', label: 'Pause Input', category: 'Playback' },
  { value: 'StopInput', label: 'Stop Input', category: 'Playback' },
  { value: 'RestartInput', label: 'Restart Input', category: 'Playback' },
  { value: 'LoopInput', label: 'Loop Input', category: 'Playback' },
  
  // Audio
  { value: 'SetVolume', label: 'Set Volume', category: 'Audio' },
  { value: 'SetAudioLevel', label: 'Set Audio Level', category: 'Audio' },
  { value: 'SetAudioBalance', label: 'Set Audio Balance', category: 'Audio' },
  { value: 'SetAudioBus', label: 'Set Audio Bus', category: 'Audio' },
  { value: 'SetAudioGain', label: 'Set Audio Gain', category: 'Audio' },
  
  // Text
  { value: 'SetText', label: 'Set Text', category: 'Text' },
  { value: 'SetTextColor', label: 'Set Text Color', category: 'Text' },
  { value: 'SetTextSize', label: 'Set Text Size', category: 'Text' },
  { value: 'SetTextPosition', label: 'Set Text Position', category: 'Text' },
  
  // Position & Effects
  { value: 'SetPosition', label: 'Set Position', category: 'Position' },
  { value: 'SetZoom', label: 'Set Zoom', category: 'Position' },
  { value: 'SetPanX', label: 'Set Pan X', category: 'Position' },
  { value: 'SetPanY', label: 'Set Pan Y', category: 'Position' },
  { value: 'SetRotation', label: 'Set Rotation', category: 'Position' },
  
  // Recording & Streaming
  { value: 'StartRecording', label: 'Start Recording', category: 'Recording' },
  { value: 'StopRecording', label: 'Stop Recording', category: 'Recording' },
  { value: 'StartStreaming', label: 'Start Streaming', category: 'Recording' },
  { value: 'StopStreaming', label: 'Stop Streaming', category: 'Recording' },
  
  // MultiView
  { value: 'SetMultiViewOverlay', label: 'Set MultiView Overlay', category: 'MultiView' },
  { value: 'SetMultiViewInput', label: 'Set MultiView Input', category: 'MultiView' },
  
  // External
  { value: 'SetExternal', label: 'Set External', category: 'External' },
  { value: 'SetExternalInput', label: 'Set External Input', category: 'External' },
]

export default function ActionEditor({ actions, onActionsChange, onExecuteAction, title }: ActionEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<VMixAction | null>(null)

  const addAction = () => {
    const newAction: VMixAction = {
      id: `action-${Date.now()}`,
      action: 'Cut',
      target: '',
      value: '',
      delay: 0
    }
    onActionsChange([...actions, newAction])
  }

  const updateAction = (id: string, updates: Partial<VMixAction>) => {
    const updatedActions = actions.map(action =>
      action.id === id ? { ...action, ...updates } : action
    )
    onActionsChange(updatedActions)
  }

  const removeAction = (id: string) => {
    onActionsChange(actions.filter(action => action.id !== id))
  }

  const testAction = async (action: VMixAction) => {
    if (onExecuteAction) {
      onExecuteAction(action)
    } else {
      await automationEngine.executeAction(action)
    }
  }

  const getActionInfo = (actionType: string) => {
    return VMIX_ACTIONS.find(a => a.value === actionType)
  }

  const getCategoryActions = (category: string) => {
    return VMIX_ACTIONS.filter(a => a.category === category)
  }

  const categories = [...new Set(VMIX_ACTIONS.map(a => a.category))]

  return (
    <>
      {/* Botón para abrir editor */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        <span>{actions.length} acciones</span>
      </Button>

      {/* Modal del editor */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Editor de Acciones</h2>
                <p className="text-sm text-muted-foreground">{title}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                {/* Lista de acciones actuales */}
                {actions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay acciones configuradas. Agrega la primera acción abajo.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-medium">Acciones Configuradas</h3>
                    {actions.map((action, index) => (
                      <div key={action.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <span className="font-medium">
                              {getActionInfo(action.action)?.label || action.action}
                            </span>
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
                              onClick={() => testAction(action)}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Probar
                            </Button>
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

                {/* Editor de nueva acción */}
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">
                    {editingAction ? 'Editar Acción' : 'Agregar Nueva Acción'}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Selector de categoría y acción */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoría</Label>
                        <Select
                          value={editingAction?.action ? getActionInfo(editingAction.action)?.category : ''}
                          onValueChange={(category) => {
                            const firstAction = getCategoryActions(category)[0]
                            if (firstAction && editingAction) {
                              updateAction(editingAction.id, { action: firstAction.value })
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Acción</Label>
                        <Select
                          value={editingAction?.action || ''}
                          onValueChange={(value) => {
                            if (editingAction) {
                              updateAction(editingAction.id, { action: value })
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona acción" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <div key={category}>
                                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                  {category}
                                </div>
                                {getCategoryActions(category).map(action => (
                                  <SelectItem key={action.value} value={action.value}>
                                    {action.label}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Parámetros */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Target (Input/Elemento)</Label>
                        <Input
                          value={editingAction?.target || ''}
                          onChange={(e) => {
                            if (editingAction) {
                              updateAction(editingAction.id, { target: e.target.value })
                            }
                          }}
                          placeholder="Ej: Camera1, Input1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Value (Valor)</Label>
                        <Input
                          value={editingAction?.value || ''}
                          onChange={(e) => {
                            if (editingAction) {
                              updateAction(editingAction.id, { value: e.target.value })
                            }
                          }}
                          placeholder="Ej: 0.8, Hello World"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Delay (segundos)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={editingAction?.delay || 0}
                          onChange={(e) => {
                            if (editingAction) {
                              updateAction(editingAction.id, { delay: parseFloat(e.target.value) || 0 })
                            }
                          }}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2">
                      {editingAction ? (
                        <>
                          <Button onClick={() => setEditingAction(null)}>
                            Guardar Cambios
                          </Button>
                          <Button variant="outline" onClick={() => setEditingAction(null)}>
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <Button onClick={addAction}>
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Acción
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
