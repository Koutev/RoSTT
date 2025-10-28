'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useVMixStore, RunOfShowStep, VMixAction } from '@/store/vmix-store'
import { Plus, Trash2, Edit, GripVertical } from 'lucide-react'

export default function RunOfShowPanel() {
  const { runOfShow, addRunOfShowStep, updateRunOfShowStep, removeRunOfShowStep, addRowFromRunOfShow } = useVMixStore()
  const [editingStep, setEditingStep] = useState<string | null>(null)
  const [newStep, setNewStep] = useState<Partial<RunOfShowStep>>({
    title: '',
    time: '',
    condition: '',
    description: '',
    actions: []
  })

  const handleAddStep = () => {
    if (!newStep.title) return

    const step: RunOfShowStep = {
      id: Date.now().toString(),
      title: newStep.title,
      time: newStep.time || undefined,
      condition: newStep.condition || undefined,
      description: newStep.description || undefined,
      actions: newStep.actions || []
    }

    addRunOfShowStep(step)
    addRowFromRunOfShow(step) // Agregar también al rundown
    setNewStep({
      title: '',
      time: '',
      condition: '',
      description: '',
      actions: []
    })
  }

  const handleEditStep = (step: RunOfShowStep) => {
    setEditingStep(step.id)
    setNewStep(step)
  }

  const handleUpdateStep = () => {
    if (!editingStep || !newStep.title) return

    updateRunOfShowStep(editingStep, newStep)
    setEditingStep(null)
    setNewStep({
      title: '',
      time: '',
      condition: '',
      description: '',
      actions: []
    })
  }

  const handleCancelEdit = () => {
    setEditingStep(null)
    setNewStep({
      title: '',
      time: '',
      condition: '',
      description: '',
      actions: []
    })
  }

  const addActionToStep = (stepId: string) => {
    const action: VMixAction = {
      id: Date.now().toString(),
      action: 'Cut',
      target: '',
      value: '',
      delay: 0
    }

    const step = runOfShow.find(s => s.id === stepId)
    if (step) {
      const updatedStep = {
        ...step,
        actions: [...step.actions, action]
      }
      updateRunOfShowStep(stepId, updatedStep)
    }
  }

  const updateAction = (stepId: string, actionId: string, actionUpdate: Partial<VMixAction>) => {
    const step = runOfShow.find(s => s.id === stepId)
    if (step) {
      const updatedActions = step.actions.map(action =>
        action.id === actionId ? { ...action, ...actionUpdate } : action
      )
      updateRunOfShowStep(stepId, { actions: updatedActions })
    }
  }

  const removeAction = (stepId: string, actionId: string) => {
    const step = runOfShow.find(s => s.id === stepId)
    if (step) {
      const updatedActions = step.actions.filter(action => action.id !== actionId)
      updateRunOfShowStep(stepId, { actions: updatedActions })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run of Show</CardTitle>
        <CardDescription>
          Crea pasos que se convertirán en filas del rundown. Cada paso se agrega automáticamente al rundown.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulario para agregar/editar paso */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="step-title">Título del Paso</Label>
              <Input
                id="step-title"
                placeholder="Ej: Intro Sequence"
                value={newStep.title || ''}
                onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-time">Tiempo (HH:MM:SS)</Label>
              <Input
                id="step-time"
                placeholder="00:00:05"
                value={newStep.time || ''}
                onChange={(e) => setNewStep({ ...newStep, time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="step-condition">Condición (opcional)</Label>
            <Input
              id="step-condition"
              placeholder="Ej: Input4Playing == false"
              value={newStep.condition || ''}
              onChange={(e) => setNewStep({ ...newStep, condition: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step-description">Descripción</Label>
            <Textarea
              id="step-description"
              placeholder="Descripción del paso..."
              value={newStep.description || ''}
              onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            {editingStep ? (
              <>
                <Button onClick={handleUpdateStep}>
                  Actualizar Paso
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
              </>
            ) : (
              <Button onClick={handleAddStep} disabled={!newStep.title}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Paso al Rundown
              </Button>
            )}
          </div>
        </div>

        {/* Lista de pasos */}
        <div className="space-y-4">
          {runOfShow.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay pasos en el Run of Show. Agrega el primero arriba y aparecerá automáticamente en el rundown.
            </div>
          ) : (
            runOfShow.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">#{index + 1}</Badge>
                    <h3 className="font-medium">{step.title}</h3>
                    {step.time && (
                      <Badge variant="secondary">{step.time}</Badge>
                    )}
                    {step.condition && (
                      <Badge variant="outline">Condición</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStep(step)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRunOfShowStep(step.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {step.description && (
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                )}

                {step.condition && (
                  <div className="text-sm">
                    <span className="font-medium">Condición:</span> {step.condition}
                  </div>
                )}

                {/* Acciones del paso */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Acciones</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addActionToStep(step.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Acción
                    </Button>
                  </div>

                  {step.actions.map((action) => (
                    <div key={action.id} className="flex items-center gap-2 p-2 bg-background rounded border">
                      <select
                        value={action.action}
                        onChange={(e) => updateAction(step.id, action.id, { action: e.target.value })}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="Cut">Cut</option>
                        <option value="Fade">Fade</option>
                        <option value="OverlayInput1In">Overlay Input 1 In</option>
                        <option value="OverlayInput1Out">Overlay Input 1 Out</option>
                        <option value="PlayInput">Play Input</option>
                        <option value="PauseInput">Pause Input</option>
                        <option value="SetVolume">Set Volume</option>
                        <option value="SetText">Set Text</option>
                      </select>
                      <Input
                        placeholder="Target"
                        value={action.target || ''}
                        onChange={(e) => updateAction(step.id, action.id, { target: e.target.value })}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={action.value || ''}
                        onChange={(e) => updateAction(step.id, action.id, { value: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAction(step.id, action.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
