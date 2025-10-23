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
import { Plus, X, ChevronDown } from 'lucide-react'

interface BlockCreatorProps {
  onAddBlock: (step: RunOfShowStep) => void
}

export default function BlockCreator({ onAddBlock }: BlockCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customStep, setCustomStep] = useState<Partial<RunOfShowStep>>({
    title: '',
    duration: '2:00',
    description: '',
    actions: []
  })

  const handleTemplateSelect = (template: BlockTemplate) => {
    const step: RunOfShowStep = {
      id: Date.now().toString(),
      ...template.step,
      actions: template.step.actions.map(action => ({
        ...action,
        id: `action-${Date.now()}-${Math.random()}`
      }))
    }
    onAddBlock(step)
    setIsOpen(false)
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
    setCustomStep({ title: '', duration: '2:00', description: '', actions: [] })
    setShowCustomForm(false)
    setIsOpen(false)
  }

  const categories = getTemplatesByCategory()

  return (
    <div className="relative">
      {/* Botón principal */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Crear Bloque
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-background border rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Crear Nuevo Bloque</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!showCustomForm ? (
              <div className="space-y-4">
                {/* Plantillas por categoría */}
                {categories.map(({ category, templates }) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className="flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <span className="text-2xl">{template.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{template.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {template.description}
                            </div>
                            {template.step.actions.length > 0 && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                {template.step.actions.length} acciones
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Botón para crear personalizado */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomForm(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Bloque Personalizado
                  </Button>
                </div>
              </div>
            ) : (
              /* Formulario personalizado */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Bloque Personalizado</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustomForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Título del Bloque</Label>
                    <Input
                      value={customStep.title || ''}
                      onChange={(e) => setCustomStep({ ...customStep, title: e.target.value })}
                      placeholder="Ej: Mi Bloque Personalizado"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Duración</Label>
                    <Input
                      value={customStep.duration || ''}
                      onChange={(e) => setCustomStep({ ...customStep, duration: e.target.value })}
                      placeholder="2:00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={customStep.description || ''}
                      onChange={(e) => setCustomStep({ ...customStep, description: e.target.value })}
                      placeholder="Descripción del bloque..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCustomSubmit} disabled={!customStep.title}>
                    Crear Bloque
                  </Button>
                  <Button variant="outline" onClick={() => setShowCustomForm(false)}>
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
