'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RundownRow, CustomField, BlockStyle, VMixAction } from '@/store/vmix-store'
import { Plus, Trash2, Palette, Settings, X, Play } from 'lucide-react'
import { automationEngine } from '@/services/automation-engine'

interface BlockEditorProps {
  row: RundownRow
  onUpdate: (updates: Partial<RundownRow>) => void
  onClose: () => void
}

const COLOR_PRESETS = [
  { name: 'Azul', value: '#3b82f6', text: '#ffffff' },
  { name: 'Verde', value: '#10b981', text: '#ffffff' },
  { name: 'Rojo', value: '#ef4444', text: '#ffffff' },
  { name: 'Amarillo', value: '#f59e0b', text: '#000000' },
  { name: 'Púrpura', value: '#8b5cf6', text: '#ffffff' },
  { name: 'Rosa', value: '#ec4899', text: '#ffffff' },
  { name: 'Cian', value: '#06b6d4', text: '#ffffff' },
  { name: 'Gris', value: '#6b7280', text: '#ffffff' },
  { name: 'Naranja', value: '#f97316', text: '#ffffff' },
  { name: 'Lima', value: '#84cc16', text: '#000000' },
]

export default function BlockEditor({ row, onUpdate, onClose }: BlockEditorProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'fields' | 'actions'>('style')
  const [editingField, setEditingField] = useState<CustomField | null>(null)

  const updateStyle = (styleUpdates: Partial<BlockStyle>) => {
    onUpdate({
      style: { ...row.style, ...styleUpdates }
    })
  }

  const addCustomField = () => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'Nuevo Campo',
      value: '',
      placeholder: 'Ingresa valor...'
    }
    onUpdate({
      customFields: [...(row.customFields || []), newField]
    })
  }

  const updateCustomField = (fieldId: string, updates: Partial<CustomField>) => {
    const updatedFields = (row.customFields || []).map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    )
    onUpdate({ customFields: updatedFields })
  }

  const removeCustomField = (fieldId: string) => {
    const updatedFields = (row.customFields || []).filter(field => field.id !== fieldId)
    onUpdate({ customFields: updatedFields })
  }

  const executeCueField = async (field: CustomField) => {
    if (field.actions && field.actions.length > 0) {
      for (const action of field.actions) {
        await automationEngine.executeAction(action)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Editor de Bloque</h2>
            <p className="text-sm text-muted-foreground">{row.title}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'style' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('style')}
          >
            <Palette className="h-4 w-4 inline mr-2" />
            Estilo
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'fields' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('fields')}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Campos Personalizados
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'actions' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('actions')}
          >
            <Play className="h-4 w-4 inline mr-2" />
            Acciones del Bloque
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'style' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Colores del Bloque</h3>
                
                {/* Vista previa */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-2 block">Vista Previa</Label>
                  <div 
                    className="p-4 rounded-lg border-2"
                    style={{
                      backgroundColor: row.style?.backgroundColor || '#f3f4f6',
                      color: row.style?.textColor || '#000000',
                      borderColor: row.style?.borderColor || '#d1d5db',
                      borderWidth: row.style?.borderWidth || 1,
                      borderRadius: row.style?.borderRadius || 8
                    }}
                  >
                    <h4 className="font-semibold">{row.title}</h4>
                    <p className="text-sm opacity-75">Vista previa del bloque personalizado</p>
                  </div>
                </div>

                {/* Presets de colores */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Presets de Colores</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        className="p-3 rounded-lg border-2 hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: preset.value,
                          color: preset.text,
                          borderColor: row.style?.backgroundColor === preset.value ? '#000' : 'transparent'
                        }}
                        onClick={() => updateStyle({
                          backgroundColor: preset.value,
                          textColor: preset.text
                        })}
                      >
                        <div className="text-xs font-medium">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colores personalizados */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="space-y-2">
                    <Label>Color de Fondo</Label>
                    <Input
                      type="color"
                      value={row.style?.backgroundColor || '#f3f4f6'}
                      onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color de Texto</Label>
                    <Input
                      type="color"
                      value={row.style?.textColor || '#000000'}
                      onChange={(e) => updateStyle({ textColor: e.target.value })}
                    />
                  </div>
                </div>

                {/* Bordes */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="space-y-2">
                    <Label>Color del Borde</Label>
                    <Input
                      type="color"
                      value={row.style?.borderColor || '#d1d5db'}
                      onChange={(e) => updateStyle({ borderColor: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grosor del Borde</Label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={row.style?.borderWidth || 1}
                      onChange={(e) => updateStyle({ borderWidth: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Radio del Borde</Label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={row.style?.borderRadius || 8}
                      onChange={(e) => updateStyle({ borderRadius: parseInt(e.target.value) || 8 })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fields' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Campos Personalizados</h3>
                <Button onClick={addCustomField}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Campo
                </Button>
              </div>

              {(!row.customFields || row.customFields.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay campos personalizados. Agrega el primero arriba.
                </div>
              ) : (
                <div className="space-y-4">
                  {row.customFields.map((field) => (
                    <Card key={field.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={field.type === 'cue' ? 'default' : 'secondary'}>
                              {field.type === 'cue' ? 'CUE' : 'TEXT'}
                            </Badge>
                            <span className="font-medium">{field.label}</span>
                          </div>
                          <div className="flex gap-2">
                            {field.type === 'cue' && field.actions && field.actions.length > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => executeCueField(field)}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Ejecutar CUE
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingField(field)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeCustomField(field.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm">Valor</Label>
                            <Input
                              value={field.value}
                              onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                              placeholder={field.placeholder}
                            />
                          </div>
                          {field.type === 'cue' && field.actions && (
                            <div>
                              <Label className="text-sm">Acciones CUE ({field.actions.length})</Label>
                              <div className="text-xs text-muted-foreground">
                                {field.actions.map((action, index) => (
                                  <span key={index}>
                                    {action.action}
                                    {index < field.actions!.length - 1 && ', '}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Acciones del Bloque</h3>
              <div className="text-sm text-muted-foreground">
                Las acciones del bloque se ejecutan cuando se hace clic en "Ejecutar" en la fila del rundown.
                Actualmente hay {row.actions.length} acciones configuradas.
              </div>
              {/* Aquí podrías integrar el ActionEditor si quieres */}
            </div>
          )}
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
