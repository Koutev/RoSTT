'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useVMixStore, RunOfShowStep } from '@/store/vmix-store'
import { BLOCK_TEMPLATES, BlockTemplate } from '@/data/block-templates'
import { Plus, X, ChevronDown, Star, Clock, Save, Edit, Trash2 } from 'lucide-react'

interface BlockCreatorCompactProps {
  onAddBlock: (step: RunOfShowStep) => void
}

export default function BlockCreatorCompact({ onAddBlock }: BlockCreatorCompactProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customStep, setCustomStep] = useState<Partial<RunOfShowStep>>({
    title: '',
    duration: '02:00',
    description: '',
    actions: []
  })
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [editingTemplate, setEditingTemplate] = useState<BlockTemplate | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    duration: '02:00'
  })

  const { customTemplates, templateOverrides, addCustomTemplate, removeCustomTemplate, updateCustomTemplate, addConsoleLog } = useVMixStore()

  const handleTemplateSelect = (template: BlockTemplate) => {
    const defaultFields = template.customFields || templateOverrides[template.id]
    const step: RunOfShowStep = {
      id: Date.now().toString(),
      ...template.step,
      templateId: template.id,
      customFields: defaultFields ? JSON.parse(JSON.stringify(defaultFields)) : undefined,
      actions: template.step.actions.map(action => ({
        ...action,
        id: `action-${Date.now()}-${Math.random()}`
      }))
    }
    onAddBlock(step)
    setIsOpen(false)
    addConsoleLog({
      message: `Bloque "${template.name}" agregado`,
      type: 'success'
    })
  }

  const handleCustomSubmit = () => {
    if (!customStep.title) return
    
    const step: RunOfShowStep = {
      id: Date.now().toString(),
      title: customStep.title!,
      duration: customStep.duration || '2:00',
      description: customStep.description || undefined,
      actions: customStep.actions || []
    }
    
    onAddBlock(step)
    
    // Si se quiere guardar como plantilla
    if (saveAsTemplate && templateName) {
      const newTemplate: BlockTemplate = {
        id: `custom-${Date.now()}`,
        name: templateName,
        description: `Bloque personalizado: ${customStep.title}`,
        icon: '⭐',
        category: 'Personalizados',
        step: {
          title: customStep.title!,
          duration: customStep.duration || '2:00',
          description: customStep.description || undefined,
          actions: customStep.actions || []
        }
      }
      addCustomTemplate(newTemplate)
      addConsoleLog({
        message: `Plantilla "${templateName}" guardada`,
        type: 'success'
      })
    }
    
    // Reset form
    setCustomStep({ title: '', duration: '2:00', description: '', actions: [] })
    setTemplateName('')
    setSaveAsTemplate(false)
    setShowCustomForm(false)
    setIsOpen(false)
    
    addConsoleLog({
      message: `Bloque "${customStep.title}" agregado`,
      type: 'success'
    })
  }

  const handleEditTemplate = (template: BlockTemplate) => {
    setEditingTemplate(template)
    setEditForm({
      name: template.name,
      description: template.description,
      duration: template.step.duration || '02:00'
    })
  }

  const handleSaveEdit = () => {
    if (!editingTemplate || !editForm.name.trim()) return

    updateCustomTemplate(editingTemplate.id, {
      name: editForm.name,
      description: editForm.description,
      step: {
        ...editingTemplate.step,
        duration: editForm.duration
      }
    })

    addConsoleLog({
      message: `Plantilla "${editForm.name}" actualizada`,
      type: 'success'
    })

    setEditingTemplate(null)
    setEditForm({ name: '', description: '', duration: '02:00' })
  }

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (confirm(`¿Eliminar plantilla "${templateName}"?`)) {
      removeCustomTemplate(templateId)
      addConsoleLog({
        message: `Plantilla "${templateName}" eliminada`,
        type: 'info'
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingTemplate(null)
    setEditForm({ name: '', description: '', duration: '02:00' })
  }

  const allTemplates = [...BLOCK_TEMPLATES.filter(t => t.category !== 'Custom'), ...customTemplates]

  return (
    <div className="relative">
      {/* Botón compacto */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="flex items-center gap-1 h-8 px-3 text-xs border-dashed border-primary/40 hover:border-primary/60 hover:bg-primary/5"
      >
        <Plus className="h-3 w-3" />
        <span>Agregar</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Menú desplegable compacto */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-background border border-border rounded-lg shadow-xl z-[9999] overflow-hidden">
          <div className="p-4">
            {/* Header compacto */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Agregar Bloque</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>

            {!showCustomForm ? (
              <div className="space-y-4">
                {/* Plantillas en grid compacto */}
                <div>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-3 w-3 text-primary" />
                    <h4 className="text-xs font-medium text-foreground">Plantillas</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {allTemplates.map((template) => (
                      <div key={template.id} className="relative group">
                        <button
                          onClick={() => handleTemplateSelect(template)}
                          className="flex items-center gap-2 p-2 text-left border border-border rounded-md hover:bg-muted/50 hover:border-primary/20 transition-all duration-150 w-full"
                        >
                          <div className="text-lg group-hover:scale-105 transition-transform">
                            {template.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                              {template.name}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                <Clock className="h-2 w-2 mr-1" />
                                {template.step.duration || '2:00'}
                              </Badge>
                              {template.category === 'Personalizados' && (
                                <Badge variant="default" className="text-[10px] px-1 py-0 h-4 bg-green-100 text-green-800">
                                  ★
                                </Badge>
                              )}
                            </div>
                          </div>
                        </button>
                        
                        {/* Opciones de gestión para plantillas personalizadas */}
                        {template.category === 'Personalizados' && (
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditTemplate(template)
                              }}
                              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              title="Editar plantilla"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTemplate(template.id, template.name)
                              }}
                              className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                              title="Eliminar plantilla"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Separador */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-background text-muted-foreground">o</span>
                  </div>
                </div>

                {/* Botón personalizado compacto */}
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomForm(true)}
                    size="sm"
                    className="w-full h-8 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Crear Personalizado
                  </Button>
                </div>
              </div>
            ) : (
              /* Formulario personalizado compacto */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Bloque Personalizado</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomForm(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Título</Label>
                    <Input
                      value={customStep.title || ''}
                      onChange={(e) => setCustomStep({ ...customStep, title: e.target.value })}
                      placeholder="Nombre del bloque"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">Duración</Label>
                      <Input
                        value={customStep.duration || ''}
                        onChange={(e) => setCustomStep({ ...customStep, duration: e.target.value })}
                        placeholder="02:00"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-muted-foreground">Descripción</Label>
                      <Input
                        value={customStep.description || ''}
                        onChange={(e) => setCustomStep({ ...customStep, description: e.target.value })}
                        placeholder="Opcional"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Opción para guardar como plantilla compacta */}
                  <div className="space-y-2 p-2 bg-muted/20 rounded border border-border">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="save-template-compact"
                        checked={saveAsTemplate}
                        onChange={(e) => setSaveAsTemplate(e.target.checked)}
                        className="rounded border-border scale-75"
                      />
                      <Label htmlFor="save-template-compact" className="text-xs font-medium cursor-pointer">
                        Guardar como plantilla
                      </Label>
                    </div>
                    
                    {saveAsTemplate && (
                      <div className="ml-4">
                        <Input
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="Nombre de la plantilla"
                          className="h-7 text-xs"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleCustomSubmit} 
                    disabled={!customStep.title || (saveAsTemplate && !templateName)}
                    size="sm"
                    className="flex-1 h-7 text-xs"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Crear
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCustomForm(false)}
                    size="sm"
                    className="h-7 text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay para cerrar */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Modal de edición de plantilla */}
      {editingTemplate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editar Plantilla</h3>
              <button
                onClick={handleCancelEdit}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Nombre de la plantilla"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Descripción de la plantilla"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-duration">Duración (MM:SS)</Label>
                <Input
                  id="edit-duration"
                  value={editForm.duration}
                  onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  placeholder="02:00"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveEdit}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
