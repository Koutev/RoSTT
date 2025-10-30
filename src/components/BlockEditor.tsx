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
  const [activeTab, setActiveTab] = useState<'style' | 'fields'>('style')
  const [editingField, setEditingField] = useState<CustomField | null>(null)
  const [newCueOptionByFieldId, setNewCueOptionByFieldId] = useState<Record<string, string>>({})

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

  const addCustomField = (type: 'text' | 'cue') => {
    const newField: CustomField = {
      id: `field-${Date.now()}`,
      type,
      label: type === 'text' ? 'Texto' : 'CUE',
      value: '',
      placeholder: type === 'text' ? 'Ingresa valor...' : undefined,
      options: type === 'cue' ? [] : undefined,
    }
    onUpdate({ customFields: [...(row.customFields || []), newField] })
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
                          const readable = getReadableTextColor(soft)
                          updateStyle({
                            backgroundColor: soft,
                            textColor: readable,
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
                        const readable = getReadableTextColor(soft)
                        updateStyle({
                          backgroundColor: soft,
                          textColor: readable,
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
                <div className="flex gap-2">
                  <Button onClick={() => addCustomField('text')} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Texto
                  </Button>
                  <Button onClick={() => addCustomField('cue')}>
                    <Plus className="h-4 w-4 mr-2" />
                    CUE
                  </Button>
                </div>
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
                            <Input
                              value={field.label}
                              onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                              placeholder="Etiqueta"
                              className="h-8 w-48"
                            />
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
                              variant="destructive"
                              onClick={() => removeCustomField(field.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                          <div className="space-y-1">
                            <Label className="text-sm">Tipo</Label>
                            <Select
                              value={field.type}
                              onValueChange={(v) => updateCustomField(field.id, { type: v as 'text' | 'cue' })}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecciona tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Texto</SelectItem>
                                <SelectItem value="cue">CUE</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {field.type === 'text' && (
                            <div className="space-y-1 md:col-span-2">
                              <Label className="text-sm">Valor</Label>
                              <Input
                                value={field.value}
                                onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                                placeholder={field.placeholder || 'Valor'}
                              />
                            </div>
                          )}

                          {field.type === 'cue' && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-sm">Opciones</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={newCueOptionByFieldId[field.id] || ''}
                                    onChange={(e) => setNewCueOptionByFieldId({ ...newCueOptionByFieldId, [field.id]: e.target.value })}
                                    placeholder="Nueva opción"
                                    className="h-9"
                                  />
                                  <Button
                                    onClick={() => {
                                      const toAdd = (newCueOptionByFieldId[field.id] || '').trim()
                                      if (!toAdd) return
                                      const current = field.options || []
                                      if (current.includes(toAdd)) return
                                      updateCustomField(field.id, { options: [...current, toAdd] })
                                      setNewCueOptionByFieldId({ ...newCueOptionByFieldId, [field.id]: '' })
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Agregar
                                  </Button>
                                </div>
                                {(field.options && field.options.length > 0) && (
                                  <div className="flex flex-wrap gap-2">
                                    {field.options.map(opt => (
                                      <div key={opt} className="flex items-center gap-1 border rounded px-2 py-1 text-xs">
                                        <span>{opt}</span>
                                        <button
                                          onClick={() => {
                                            const updated = (field.options || []).filter(o => o !== opt)
                                            updateCustomField(field.id, { options: updated })
                                            if (field.value === opt) {
                                              updateCustomField(field.id, { value: '' })
                                            }
                                          }}
                                          title="Eliminar opción"
                                          className="text-red-500 hover:text-red-600"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                <Label className="text-sm">Seleccionada</Label>
                                <Select
                                  value={field.value}
                                  onValueChange={(v) => updateCustomField(field.id, { value: v })}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Elegir" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(field.options || []).map(opt => (
                                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
