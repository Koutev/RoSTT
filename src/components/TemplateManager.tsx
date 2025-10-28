'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useVMixStore, BlockTemplate } from '@/store/vmix-store'
import { Edit, Trash2, Save, X, Star } from 'lucide-react'

export default function TemplateManager() {
  const { customTemplates, removeCustomTemplate, updateCustomTemplate, addConsoleLog } = useVMixStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<BlockTemplate | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    duration: '02:00'
  })

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

    // Actualizar la plantilla existente
    updateCustomTemplate(editingTemplate.id, {
      name: editForm.name,
      description: editForm.description,
      step: {
        ...editingTemplate.step,
        duration: editForm.duration
      }
    })

    addConsoleLog({
      message: `Plantilla "${editForm.name}" actualizada exitosamente`,
      type: 'success'
    })

    setEditingTemplate(null)
    setEditForm({ name: '', description: '', duration: '02:00' })
  }

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la plantilla "${templateName}"?`)) {
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

  return (
    <>
      {/* Botón para abrir el gestor */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Star className="h-4 w-4" />
        Mis Plantillas ({customTemplates.length})
      </Button>

      {/* Modal del gestor */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gestión de Plantillas Personalizadas</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Edita, modifica o elimina tus plantillas personalizadas
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="overflow-y-auto max-h-[60vh]">
              {customTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tienes plantillas personalizadas aún</p>
                  <p className="text-sm">Crea tu primera plantilla desde el botón "Crear Bloque"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      {editingTemplate?.id === template.id ? (
                        /* Formulario de edición */
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Edit className="h-4 w-4 text-primary" />
                            <span className="font-medium">Editando: {template.name}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nombre de la plantilla</Label>
                              <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                placeholder="Nombre de la plantilla"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Duración (MM:SS)</Label>
                              <Input
                                value={editForm.duration}
                                onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                                placeholder="02:00"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              placeholder="Descripción de cuándo usar esta plantilla..."
                              rows={2}
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={handleSaveEdit} size="sm">
                              <Save className="h-4 w-4 mr-2" />
                              Guardar Cambios
                            </Button>
                            <Button onClick={handleCancelEdit} variant="outline" size="sm">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Vista de la plantilla */
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{template.icon}</div>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {template.description}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {template.step.duration || '02:00'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {template.step.actions.length} acciones
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditTemplate(template)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDeleteTemplate(template.id, template.name)}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
