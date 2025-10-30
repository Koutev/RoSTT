'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useVMixStore, RunOfShowStep } from '@/store/vmix-store'
import { BLOCK_TEMPLATES, getTemplatesByCategory, BlockTemplate } from '@/data/block-templates'
import { Plus, X, ChevronDown, Star, Clock, Settings, Save } from 'lucide-react'

interface BlockCreatorProps {
  onAddBlock: (step: RunOfShowStep) => void
}

export default function BlockCreator({ onAddBlock }: BlockCreatorProps) {
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
  const [templateDescription, setTemplateDescription] = useState('')

  const { customTemplates, templateOverrides, addCustomTemplate, addConsoleLog } = useVMixStore()

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
      message: `Bloque "${template.name}" agregado al rundown`,
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
        description: templateDescription || `Bloque personalizado: ${customStep.title}`,
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
        message: `Plantilla "${templateName}" guardada exitosamente`,
        type: 'success'
      })
    }
    
    // Reset form
    setCustomStep({ title: '', duration: '2:00', description: '', actions: [] })
    setTemplateName('')
    setTemplateDescription('')
    setSaveAsTemplate(false)
    setShowCustomForm(false)
    setIsOpen(false)
    
    addConsoleLog({
      message: `Bloque personalizado "${customStep.title}" agregado al rundown`,
      type: 'success'
    })
  }

  const categories = getTemplatesByCategory()
  const allTemplates = [...BLOCK_TEMPLATES.filter(t => t.category !== 'Custom'), ...customTemplates]

  return (
    <div className="relative">
      {/* Botón principal mejorado */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
        size="lg"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Crear Bloque</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Menú desplegable mejorado */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-[420px] bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Crear Nuevo Bloque</h3>
                <p className="text-sm text-muted-foreground">Selecciona una plantilla o crea una personalizada</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!showCustomForm ? (
              <div className="space-y-6">
                {/* Plantillas predefinidas */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-foreground">Plantillas Predefinidas</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {allTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="flex items-center gap-4 p-4 text-left border border-border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group"
                      >
                        <div className="text-2xl group-hover:scale-110 transition-transform">
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {template.name}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {template.description}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {template.step.duration || '2:00'}
                            </Badge>
                            {template.step.actions.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {template.step.actions.length} acciones
                              </Badge>
                            )}
                            {template.category === 'Personalizados' && (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                Personalizado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Separador */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-background text-muted-foreground">o</span>
                  </div>
                </div>

                {/* Botón para crear personalizado */}
                <div>
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomForm(true)}
                    className="w-full h-12 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    <span className="font-medium">Crear Bloque Personalizado</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* Formulario personalizado mejorado */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">Bloque Personalizado</h4>
                    <p className="text-sm text-muted-foreground">Configura tu bloque desde cero</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomForm(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Título del Bloque</Label>
                    <Input
                      value={customStep.title || ''}
                      onChange={(e) => setCustomStep({ ...customStep, title: e.target.value })}
                      placeholder="Ej: Mi Bloque Personalizado"
                      className="h-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Duración</Label>
                      <Input
                        value={customStep.duration || ''}
                        onChange={(e) => setCustomStep({ ...customStep, duration: e.target.value })}
                        placeholder="02:00"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Formato: MM:SS</Label>
                      <div className="h-10 flex items-center text-xs text-muted-foreground">
                        Ej: 02:30, 01:45
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Descripción</Label>
                    <Textarea
                      value={customStep.description || ''}
                      onChange={(e) => setCustomStep({ ...customStep, description: e.target.value })}
                      placeholder="Descripción del bloque..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Opción para guardar como plantilla */}
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="save-template"
                        checked={saveAsTemplate}
                        onChange={(e) => setSaveAsTemplate(e.target.checked)}
                        className="rounded border-border"
                      />
                      <Label htmlFor="save-template" className="text-sm font-medium cursor-pointer">
                        Guardar como plantilla reutilizable
                      </Label>
                    </div>
                    
                    {saveAsTemplate && (
                      <div className="space-y-3 ml-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Nombre de la plantilla</Label>
                          <Input
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Ej: Mi Plantilla Especial"
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Descripción de la plantilla</Label>
                          <Textarea
                            value={templateDescription}
                            onChange={(e) => setTemplateDescription(e.target.value)}
                            placeholder="Descripción de cuándo usar esta plantilla..."
                            rows={2}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleCustomSubmit} 
                    disabled={!customStep.title || (saveAsTemplate && !templateName)}
                    className="flex-1 h-11"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Crear Bloque
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCustomForm(false)}
                    className="h-11"
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
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
