'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useVMixStore, RunOfShowStep } from '@/store/vmix-store'
import { BLOCK_TEMPLATES, BlockTemplate } from '@/data/block-templates'
import { X, Plus, Star, Clock, Search, Grid, List, ChevronDown, ChevronRight, Hash, Trash2 } from 'lucide-react'

interface BlockTemplateManagerProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (step: RunOfShowStep) => void
}

export default function BlockTemplateManager({ isOpen, onClose, onSelectTemplate }: BlockTemplateManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [customStep, setCustomStep] = useState<Partial<RunOfShowStep>>({
    title: '',
    duration: '02:00',
    description: '',
    actions: []
  })
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')

  const { customTemplates, addCustomTemplate, removeCustomTemplate, addConsoleLog } = useVMixStore()

  const handleDeleteTemplate = (templateId: string, templateName: string, e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se seleccione el template al hacer clic en eliminar
    if (confirm(`¿Estás seguro de que quieres eliminar la plantilla "${templateName}"?`)) {
      removeCustomTemplate(templateId)
      addConsoleLog({
        message: `Plantilla "${templateName}" eliminada`,
        type: 'info'
      })
    }
  }

  // Expandir todas las categorías por defecto al abrir
  useEffect(() => {
    if (isOpen) {
      const allTemplates = [...BLOCK_TEMPLATES.filter(t => t.category !== 'Custom'), ...customTemplates]
      const allCategories = Array.from(new Set(allTemplates.map(t => t.category)))
      
      // Solo inicializar si no hay items expandidos
      if (Object.keys(expandedItems).length === 0) {
        const defaultExpanded: Record<string, boolean> = {}
        allCategories.forEach(cat => {
          defaultExpanded[cat] = true
        })
        setExpandedItems(defaultExpanded)
      }
      
      // Solo establecer activeItem si no hay uno activo
      if (allCategories.length > 0 && !activeItem) {
        setActiveItem(allCategories[0])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const toggleItem = (category: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const scrollToItem = (category: string) => {
    setActiveItem(category)
    const element = document.getElementById(`item-${category}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Expandir si está colapsado
      if (!expandedItems[category]) {
        setExpandedItems(prev => ({ ...prev, [category]: true }))
      }
    }
  }

  if (!isOpen) return null

  const allTemplates = [...BLOCK_TEMPLATES.filter(t => t.category !== 'Custom'), ...customTemplates]
  
  const filteredTemplates = allTemplates.filter(template => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    )
  })

  // Agrupar todos los templates por categoría
  const allCategories = Array.from(new Set(allTemplates.map(t => t.category)))
  const categoriesGrouped = allCategories.map(category => ({
    category,
    templates: allTemplates.filter(t => t.category === category)
  }))

  const filteredCategories = categoriesGrouped.map(cat => ({
    ...cat,
    templates: cat.templates.filter(t => 
      !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.templates.length > 0)

  const handleTemplateSelect = (template: BlockTemplate) => {
    const step: RunOfShowStep = {
      id: Date.now().toString(),
      ...template.step,
      templateId: template.id,
      customFields: template.customFields ? JSON.parse(JSON.stringify(template.customFields)) : undefined,
      actions: template.step.actions.map(action => ({
        ...action,
        id: `action-${Date.now()}-${Math.random()}`
      }))
    }
    onSelectTemplate(step)
    onClose()
    addConsoleLog({
      message: `Bloque "${template.name}" agregado al rundown`,
      type: 'success'
    })
  }

  const handleCreateCustom = () => {
    if (!customStep.title || !templateName) return

    const newTemplate: BlockTemplate = {
      id: `custom-${Date.now()}`,
      name: templateName,
      description: templateDescription || `Bloque personalizado: ${customStep.title}`,
      icon: '⭐',
      category: 'Personalizados',
      step: {
        title: customStep.title!,
        duration: customStep.duration || '02:00',
        description: customStep.description || undefined,
        actions: customStep.actions || []
      }
    }

    addCustomTemplate(newTemplate)
    addConsoleLog({
      message: `Plantilla "${templateName}" creada exitosamente`,
      type: 'success'
    })

    // Reset form
    setCustomStep({ title: '', duration: '02:00', description: '', actions: [] })
    setTemplateName('')
    setTemplateDescription('')
    setShowCreateForm(false)
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setCustomStep({ title: '', duration: '02:00', description: '', actions: [] })
    setTemplateName('')
    setTemplateDescription('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header compacto */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="text-lg font-semibold">Gestionar Bloques</h2>
            <p className="text-xs text-muted-foreground">
              Selecciona un template o crea uno personalizado
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              title={`Cambiar a vista ${viewMode === 'grid' ? 'lista' : 'grid'}`}
              className="h-8 w-8 p-0"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!showCreateForm ? (
            <>
              {/* Barra de búsqueda y botón crear compacta */}
              <div className="px-4 py-2.5 border-b">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    size="sm"
                    className="h-9 flex items-center gap-1.5 text-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Crear Personalizado
                  </Button>
                </div>
              </div>

              {/* Navegación rápida de ITEMs */}
              <div className="px-3 py-2 border-b bg-muted/20 flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">ITEMS:</span>
                {filteredCategories.map(({ category, templates }) => (
                  <button
                    key={category}
                    onClick={() => scrollToItem(category)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                      activeItem === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted text-foreground'
                    }`}
                  >
                    {category} ({templates.length})
                  </button>
                ))}
              </div>

              {/* Lista de templates compacta con ITEMs colapsables */}
              <div className="flex-1 overflow-y-auto p-3">
                {viewMode === 'grid' ? (
                  <div className="space-y-2">
                    {filteredCategories.map(({ category, templates }) => {
                      const isExpanded = expandedItems[category] ?? true
                      const isActive = activeItem === category
                      
                      return (
                        <div 
                          key={category} 
                          id={`item-${category}`}
                          className={`border rounded-lg transition-all ${
                            isActive ? 'border-primary shadow-sm' : 'border-border'
                          }`}
                        >
                          {/* Header del ITEM */}
                          <button
                            onClick={() => toggleItem(category)}
                            className={`w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors ${
                              isActive ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Hash className="h-3.5 w-3.5 text-primary" />
                              <span className="text-sm font-semibold text-foreground">
                                {category}
                              </span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                {templates.length}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {isExpanded ? 'Ocultar' : 'Mostrar'}
                            </div>
                          </button>

                          {/* Contenido del ITEM */}
                          {isExpanded && (
                            <div className="p-2">
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                {templates.map((template) => (
                                  <Card
                                    key={template.id}
                                    className="relative cursor-pointer hover:shadow-md transition-all duration-150 hover:border-primary/50 hover:scale-[1.02] group"
                                    onClick={() => handleTemplateSelect(template)}
                                  >
                                    <CardContent className="p-2.5">
                                      <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                          <div className="text-lg">{template.icon}</div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-xs text-foreground truncate">
                                              {template.name}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                                          {template.description}
                                        </div>
                                        <div className="flex items-center gap-1 flex-wrap">
                                          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                                            <Clock className="h-2 w-2 mr-0.5" />
                                            {template.step.duration || '02:00'}
                                          </Badge>
                                          {template.step.actions.length > 0 && (
                                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                              {template.step.actions.length}
                                            </Badge>
                                          )}
                                          {template.category === 'Personalizados' && (
                                            <Badge variant="default" className="text-[9px] px-1 py-0 h-4 bg-green-100 text-green-800">
                                              ★
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                    {template.category === 'Personalizados' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleDeleteTemplate(template.id, template.name, e)}
                                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                                        title="Eliminar plantilla"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {filteredCategories.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <p>No se encontraron templates que coincidan con la búsqueda.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredCategories.map(({ category, templates }) => {
                      const isExpanded = expandedItems[category] ?? true
                      const isActive = activeItem === category
                      
                      return (
                        <div 
                          key={category} 
                          id={`item-${category}`}
                          className={`border rounded-lg transition-all ${
                            isActive ? 'border-primary shadow-sm' : 'border-border'
                          }`}
                        >
                          {/* Header del ITEM */}
                          <button
                            onClick={() => toggleItem(category)}
                            className={`w-full px-3 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors ${
                              isActive ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <Hash className="h-3.5 w-3.5 text-primary" />
                              <span className="text-sm font-semibold text-foreground">
                                {category}
                              </span>
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                {templates.length}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {isExpanded ? 'Ocultar' : 'Mostrar'}
                            </div>
                          </button>

                          {/* Contenido del ITEM */}
                          {isExpanded && (
                            <div className="p-2 space-y-1">
                              {templates.map((template) => (
                                <Card
                                  key={template.id}
                                  className="relative cursor-pointer hover:shadow-sm transition-all duration-150 hover:border-primary/50 hover:bg-muted/30 group"
                                  onClick={() => handleTemplateSelect(template)}
                                >
                                  <CardContent className="p-2">
                                    <div className="flex items-center gap-2">
                                      <div className="text-base">{template.icon}</div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                          <div className="font-semibold text-xs text-foreground">
                                            {template.name}
                                          </div>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                                          {template.description}
                                        </div>
                                        <div className="flex items-center gap-1 flex-wrap mt-1">
                                          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">
                                            <Clock className="h-2 w-2 mr-0.5" />
                                            {template.step.duration || '02:00'}
                                          </Badge>
                                          {template.step.actions.length > 0 && (
                                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                                              {template.step.actions.length}
                                            </Badge>
                                          )}
                                          {template.category === 'Personalizados' && (
                                            <Badge variant="default" className="text-[9px] px-1 py-0 h-3.5 bg-green-100 text-green-800">
                                              ★
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                  {template.category === 'Personalizados' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleDeleteTemplate(template.id, template.name, e)}
                                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                                      title="Eliminar plantilla"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {filteredCategories.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        <p>No se encontraron templates que coincidan con la búsqueda.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Formulario de creación compacto */
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-2xl mx-auto space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Crear Bloque Personalizado</h3>
                    <p className="text-xs text-muted-foreground">
                      Configura tu bloque y guárdalo como template
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Nombre del Template *</Label>
                        <Input
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                          placeholder="Ej: Mi Bloque Especial"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Duración *</Label>
                        <Input
                          value={customStep.duration || ''}
                          onChange={(e) => setCustomStep({ ...customStep, duration: e.target.value })}
                          placeholder="02:00"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Descripción del Template</Label>
                      <Input
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        placeholder="Descripción opcional..."
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="border-t pt-3 space-y-3">
                      <h4 className="text-sm font-medium">Configuración del Bloque</h4>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Título del Bloque *</Label>
                        <Input
                          value={customStep.title || ''}
                          onChange={(e) => setCustomStep({ ...customStep, title: e.target.value })}
                          placeholder="Ej: Mi Bloque Personalizado"
                          className="h-8 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Descripción del Bloque</Label>
                        <Textarea
                          value={customStep.description || ''}
                          onChange={(e) => setCustomStep({ ...customStep, description: e.target.value })}
                          placeholder="Descripción opcional..."
                          rows={2}
                          className="resize-none text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateCustom}
                    disabled={!customStep.title || !templateName}
                    size="sm"
                    className="flex-1 h-9"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Crear Template
                  </Button>
                  <Button variant="outline" onClick={handleCancel} size="sm" className="h-9">
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

