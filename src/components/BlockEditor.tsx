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
  { name: 'Primario', value: '#0ea5e9' },
  { name: 'Éxito', value: '#10b981' },
  { name: 'Peligro', value: '#ef4444' },
  { name: 'Advertencia', value: '#f59e0b' },
  { name: 'Neutro', value: '#6b7280' },
]

export default function BlockEditor({ row, onUpdate, onClose }: BlockEditorProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'fields' | 'actions'>('style')
  const [editingField, setEditingField] = useState<CustomField | null>(null)

  const updateStyle = (styleUpdates: Partial<BlockStyle>) => {
    onUpdate({
      style: { ...row.style, ...styleUpdates }
    })
  }

  const getReadableTextColor = (hex: string): string => {
    const clean = hex.replace('#', '')
    const r = parseInt(clean.substring(0, 2), 16)
    const g = parseInt(clean.substring(2, 4), 16)
    const b = parseInt(clean.substring(4, 6), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 140 ? '#111827' : '#ffffff'
  }

  const lightenToSoftFill = (hex: string, factor: number = 0.85): string => {
    // Mezcla el color con blanco. factor=0.85 implica 85% blanco + 15% color
    const clean = hex.replace('#', '')
    const r = parseInt(clean.substring(0, 2), 16)
    const g = parseInt(clean.substring(2, 4), 16)
    const b = parseInt(clean.substring(4, 6), 16)
    const mix = (channel: number) => Math.round(255 * factor + channel * (1 - factor))
    const nr = mix(r)
    const ng = mix(g)
    const nb = mix(b)
    const toHex = (n: number) => n.toString(16).padStart(2, '0')
    return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`
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

                {/* Paleta de colores profesional */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Color del bloque</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        className="p-3 rounded-lg border-2 hover:scale-105 transition-transform"
                        style={{
                          backgroundColor: preset.value,
                          color: getReadableTextColor(preset.value),
                          borderColor: row.style?.backgroundColor === preset.value ? '#111827' : 'transparent'
                        }}
                        onClick={() => {
                          const base = preset.value
                          const soft = lightenToSoftFill(base)
                          updateStyle({
                            backgroundColor: soft,
                            textColor: '#111827',
                            borderColor: base,
                            borderWidth: 2,
                            borderRadius: 8,
                          })
                        }}
                      >
                        <div className="text-xs font-medium">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personalización simple: elegir color base y derivamos relleno suave + borde fuerte */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Color base</Label>
                    <Input
                      type="color"
                      defaultValue={row.style?.borderColor || '#0ea5e9'}
                      onChange={(e) => {
                        const base = e.target.value
                        const soft = lightenToSoftFill(base)
                        updateStyle({
                          backgroundColor: soft,
                          textColor: '#111827',
                          borderColor: base,
                          borderWidth: 2,
                          borderRadius: 8,
                        })
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vista</Label>
                    <div 
                      className="h-10 rounded-md border"
                      style={{
                        backgroundColor: row.style?.backgroundColor,
                        borderColor: row.style?.borderColor,
                        borderWidth: 2,
                        borderStyle: 'solid'
                      }}
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
                Las acciones del bloque se ejecutan cuando se hace clic en &quot;Ejecutar&quot; en la fila del rundown.
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
