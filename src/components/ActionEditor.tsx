'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { VMixAction } from '@/store/vmix-store'
import { VMIX_ACTIONS_CATALOG, VMIX_CATEGORIES } from '@/data/vmix-actions'
import { vmixAPI, VMixInput } from '@/services/vmix-api'
import { Plus, Trash2, Play, Settings, X } from 'lucide-react'
import { automationEngine } from '@/services/automation-engine'

interface ActionEditorProps {
  actions: VMixAction[]
  onActionsChange: (actions: VMixAction[]) => void
  onExecuteAction?: (action: VMixAction) => void
  title: string
  initialOpen?: boolean
  onClose?: () => void
  hideOpenButton?: boolean
}

const VMIX_ACTIONS = VMIX_ACTIONS_CATALOG

export default function ActionEditor({ actions, onActionsChange, onExecuteAction, title, initialOpen, onClose, hideOpenButton }: ActionEditorProps) {
  const [isOpen, setIsOpen] = useState(!!initialOpen)
  const [editingAction, setEditingAction] = useState<VMixAction | null>(null)
  const [pendingActionValue, setPendingActionValue] = useState<string | null>(null)
  const [availableInputs, setAvailableInputs] = useState<VMixInput[]>([])
  const [loadingInputs, setLoadingInputs] = useState(false)
  const [actionSearch, setActionSearch] = useState('')

  useEffect(() => {
    const loadInputs = async () => {
      if (!pendingActionValue) return
      setLoadingInputs(true)
      const data = await vmixAPI.getData()
      setAvailableInputs(data?.inputs || [])
      setLoadingInputs(false)
    }
    loadInputs()
  }, [pendingActionValue])

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

  const categories = VMIX_CATEGORIES

  return (
    <>
      {/* Botón para abrir editor (opcional) */}
      {!hideOpenButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          <span>{actions.length} acciones</span>
        </Button>
      )}

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
              <Button variant="ghost" size="sm" onClick={() => { setIsOpen(false); onClose && onClose() }}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Izquierda: Selección y edición */}
                <div className="space-y-4">
                  <h3 className="font-medium">{editingAction ? 'Editar Acción' : 'Agregar Nueva Acción'}</h3>

                  {/* Menú combinado Categoría > Acción */}
                  <div className="space-y-2">
                    <Label>Acción de vMix</Label>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <Button variant="outline" className="justify-between w-full">
                          <span>
                            {editingAction?.action
                              ? (getActionInfo(editingAction.action)?.label || editingAction.action)
                              : 'Selecciona categoría y acción'}
                          </span>
                          <span className="text-xs text-muted-foreground">(Categoría ▸ Acción)</span>
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content side="bottom" className="min-w-[360px] bg-popover border rounded-md p-1 shadow">
                        <div className="p-2">
                          <Input
                            value={actionSearch}
                            onChange={(e) => setActionSearch(e.target.value)}
                            placeholder="Buscar acción…"
                            className="h-8"
                          />
                        </div>
                        <div className="max-h-72 overflow-auto">
                          {actionSearch.trim() ? (
                            VMIX_ACTIONS.filter((a) => a.label.toLowerCase().includes(actionSearch.toLowerCase()) || a.value.toLowerCase().includes(actionSearch.toLowerCase())).map((a) => (
                              <DropdownMenu.Item
                                key={`${a.category}-${a.value}`}
                                className="px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between"
                                onSelect={(e) => {
                                  e.preventDefault()
                                  setPendingActionValue(a.value)
                                }}
                              >
                                <span>{a.label}</span>
                                <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
                              </DropdownMenu.Item>
                            ))
                          ) : (
                            categories.map((category) => (
                              <DropdownMenu.Sub key={category}>
                                <DropdownMenu.SubTrigger className="px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between">
                                  <span>{category}</span>
                                  <span className="text-muted-foreground">▸</span>
                                </DropdownMenu.SubTrigger>
                                <DropdownMenu.SubContent className="bg-popover border rounded-md p-1 shadow min-w-[300px] max-h-72 overflow-auto">
                                  {getCategoryActions(category).map((a) => (
                                    <DropdownMenu.Item
                                      key={a.value}
                                      className="px-2 py-1.5 text-sm rounded hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                      onSelect={(e) => {
                                        e.preventDefault()
                                        // Paso 1: elegir acción -> luego pedimos Target
                                        setPendingActionValue(a.value)
                                      }}
                                    >
                                      {a.label}
                                    </DropdownMenu.Item>
                                  ))}
                                </DropdownMenu.SubContent>
                              </DropdownMenu.Sub>
                            ))
                          )}
                        </div>
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                  </div>

                  {/* Paso 2: seleccionar Target desde inputs de vMix */}
                  {pendingActionValue && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Target (Input de vMix)</Label>
                        <Select
                          onValueChange={(selectedInputKey) => {
                            const selected = availableInputs.find(i => i.key === selectedInputKey) || null
                            const newAction: VMixAction = {
                              id: `action-${Date.now()}`,
                              action: pendingActionValue,
                              target: selected?.key || selectedInputKey,
                              value: '',
                              delay: 0,
                            }
                            onActionsChange([...actions, newAction])
                            setEditingAction(newAction)
                            setPendingActionValue(null)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={loadingInputs ? 'Cargando inputs…' : (availableInputs.length ? 'Selecciona input' : 'Sin inputs detectados: escribir manual abajo')} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableInputs.map((inp) => (
                              <SelectItem key={inp.key} value={inp.key}>
                                {inp.number}. {inp.shortTitle || inp.title} ({inp.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!loadingInputs && availableInputs.length === 0 && (
                          <div className="text-xs text-muted-foreground">
                            No se detectaron inputs desde vMix. Verificá la conexión o ingresá un Target manual abajo.
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <Label>Target manual (fallback)</Label>
                        <Input
                          placeholder="Ej: 1, Camera 1, GUID"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                              const manual = (e.target as HTMLInputElement).value.trim()
                              const newAction: VMixAction = {
                                id: `action-${Date.now()}`,
                                action: pendingActionValue,
                                target: manual,
                                value: '',
                                delay: 0,
                              }
                              onActionsChange([...actions, newAction])
                              setEditingAction(newAction)
                              setPendingActionValue(null)
                            }
                          }}
                        />
                        <div className="text-xs text-muted-foreground">Presioná Enter para confirmar.</div>
                      </div>
                    </div>
                  )}

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

                {/* Derecha: Lista de acciones actuales */}
                <div className="space-y-3">
                  <h3 className="font-medium">Acciones de esta fila (orden de ejecución)</h3>
                  {actions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      No hay acciones configuradas. Selecciona una acción a la izquierda.
                    </div>
                  ) : (
                    actions.map((action, index) => (
                      <div key={action.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {getActionInfo(action.action)?.label || action.action}
                              </span>
                              <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                                <div><span className="font-medium">Target:</span> {action.target || '—'}</div>
                                <div><span className="font-medium">Value:</span> {action.value || '—'}</div>
                                <div><span className="font-medium">Delay:</span> {action.delay || 0}s</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" variant="outline" onClick={() => testAction(action)}>
                              <Play className="h-3 w-3 mr-1" />
                              Probar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingAction(action)}>
                              Editar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => removeAction(action.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => { setIsOpen(false); onClose && onClose() }}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
