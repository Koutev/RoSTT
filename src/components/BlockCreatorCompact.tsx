'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useVMixStore, RunOfShowStep } from '@/store/vmix-store'
import { BLOCK_TEMPLATES, BlockTemplate } from '@/data/block-templates'
import { Plus, ChevronDown, Star, Clock, X, Hash } from 'lucide-react'
import BlockTemplateManager from '@/components/BlockTemplateManager'

interface BlockCreatorCompactProps {
  onAddBlock: (step: RunOfShowStep) => void
  onAddItem?: () => void
}

export default function BlockCreatorCompact({ onAddBlock, onAddItem }: BlockCreatorCompactProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)

  const { customTemplates, templateOverrides, addConsoleLog } = useVMixStore()

  const handleAddItem = () => {
    if (onAddItem) {
      onAddItem()
      setIsOpen(false)
      addConsoleLog({
        message: 'ITEM agregado al rundown',
        type: 'success'
      })
    }
  }

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
              <h3 className="text-sm font-semibold text-foreground">Agregar</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Botón para agregar ITEM */}
              {onAddItem && (
                <>
                  <div>
                    <Button
                      variant="outline"
                      onClick={handleAddItem}
                      size="sm"
                      className="w-full h-9 border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-xs font-medium"
                    >
                      <Hash className="h-3.5 w-3.5 mr-1.5" />
                      Agregar ITEM
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">
                      Contenedor para agrupar bloques
                    </p>
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
                </>
              )}
              {/* Plantillas en grid compacto */}
              <div>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="h-3 w-3 text-primary" />
                  <h4 className="text-xs font-medium text-foreground">Plantillas</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {allTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="group flex items-center gap-2 p-2 text-left border border-border rounded-md hover:bg-muted/50 hover:border-primary/20 transition-all duration-150 w-full"
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
                  onClick={() => {
                    setIsOpen(false)
                    setShowTemplateManager(true)
                  }}
                  size="sm"
                  className="w-full h-8 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Crear Personalizado
                </Button>
              </div>
            </div>
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

      {/* Modal de gestión de templates */}
      <BlockTemplateManager
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        onSelectTemplate={(step) => {
          onAddBlock(step)
          setShowTemplateManager(false)
        }}
      />
    </div>
  )
}
