import { create } from 'zustand'
import { BlockTemplate } from '@/data/block-templates'

export interface VMixConnection {
  ip: string
  port: number
  connected: boolean
  lastPing?: Date
}

export interface RunOfShowStep {
  id: string
  title: string
  time?: string
  duration?: string
  condition?: string
  description?: string
  actions: VMixAction[]
  templateId?: string
  customFields?: CustomField[]
}

export interface VMixAction {
  id: string
  action: string
  target?: string
  value?: string
  delay?: number
}

export interface ConsoleLog {
  id: string
  timestamp: Date
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

interface VMixStore {
  connection: VMixConnection
  runOfShow: RunOfShowStep[]
  consoleLogs: ConsoleLog[]
  isRunning: boolean
  currentStepIndex: number

  // Rundown grid (filas/columnas)
  rundown: RundownGrid
  
  // Plantillas personalizadas
  customTemplates: BlockTemplate[]
  // Overrides de plantillas base por usuario (customFields)
  templateOverrides: Record<string, CustomField[]>
  
  // Horarios del show
  showStartTime: string
  showEndTime: string
  
  // Estado del show en ejecución
  currentBlockIndex: number
  showStatus: 'idle' | 'running' | 'paused' | 'completed'
  
  // Actions
  setConnection: (ip: string, port: number) => void
  setConnected: (connected: boolean) => void
  addRunOfShowStep: (step: RunOfShowStep) => void
  updateRunOfShowStep: (id: string, step: Partial<RunOfShowStep>) => void
  removeRunOfShowStep: (id: string) => void
  reorderRunOfShowSteps: (steps: RunOfShowStep[]) => void
  addConsoleLog: (log: Omit<ConsoleLog, 'id' | 'timestamp'>) => void
  clearConsoleLogs: () => void
  setRunning: (running: boolean) => void
  setCurrentStepIndex: (index: number) => void

  // Acciones rundown grid
  addRowFromRunOfShow: (step: RunOfShowStep) => void
  updateRow: (rowId: string, update: Partial<RundownRow>) => void
  removeRow: (rowId: string) => void
  reorderRows: (oldIndex: number, newIndex: number) => void
  executeRow: (rowId: string) => void

  // Acciones plantillas personalizadas
  addCustomTemplate: (template: BlockTemplate) => void
  removeCustomTemplate: (templateId: string) => void
  updateCustomTemplate: (templateId: string, updates: Partial<BlockTemplate>) => void
  setTemplateOverride: (templateId: string, fields: CustomField[]) => void

  // Acciones horarios del show
  setShowStartTime: (time: string) => void
  setShowEndTime: (time: string) => void

  // Acciones estado del show
  setCurrentBlockIndex: (index: number) => void
  setShowStatus: (status: 'idle' | 'running' | 'paused' | 'completed') => void
  startShow: () => void
  pauseShow: () => void
  resumeShow: () => void
  stopShow: () => void
  nextBlock: () => void
}

export interface RundownColumn {
  id: string
  title: string
  type: 'time' | 'duration' | 'notes'
}

export interface CustomField {
  id: string
  type: 'text' | 'cue'
  label: string
  value: string
  placeholder?: string
  // Para campos CUE: lista de opciones del menú desplegable
  options?: string[]
  actions?: VMixAction[] // Para campos CUE
}

export interface BlockStyle {
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
}

export interface RundownRow {
  id: string
  title: string
  time?: string
  duration?: string
  notes?: string
  description?: string
  actions: VMixAction[]
  order: number
  style?: BlockStyle
  customFields?: CustomField[]
  templateId?: string
}

export interface RundownGrid {
  columns: RundownColumn[]
  rows: RundownRow[]
}

// Función para cargar plantillas personalizadas desde localStorage
const loadCustomTemplates = (): BlockTemplate[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('vmix-custom-templates')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Función para guardar plantillas personalizadas en localStorage
const saveCustomTemplates = (templates: BlockTemplate[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('vmix-custom-templates', JSON.stringify(templates))
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Overrides por plantilla (para plantillas base) en localStorage
const loadTemplateOverrides = (): Record<string, CustomField[]> => {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem('vmix-template-overrides')
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

const saveTemplateOverrides = (overrides: Record<string, CustomField[]>) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('vmix-template-overrides', JSON.stringify(overrides))
  } catch {
    // ignore
  }
}

export const useVMixStore = create<VMixStore>((set, get) => ({
  connection: {
    ip: '',
    port: 8088,
    connected: false
  },
  runOfShow: [],
  consoleLogs: [],
  isRunning: false,
  currentStepIndex: -1,
  customTemplates: loadCustomTemplates(),
  templateOverrides: loadTemplateOverrides(),
  showStartTime: '20:00',
  showEndTime: '22:00',
  currentBlockIndex: -1,
  showStatus: 'idle',
  rundown: {
    columns: [
      { id: 'col-time', title: 'Tiempo Total', type: 'time' as const },
      { id: 'col-duration', title: 'Duración', type: 'duration' as const },
      { id: 'col-notes', title: 'Notas', type: 'notes' as const }
    ],
    rows: []
  },

  setConnection: (ip: string, port: number) => 
    set(state => ({
      connection: { ...state.connection, ip, port }
    })),

  setConnected: (connected: boolean) => 
    set(state => ({
      connection: { ...state.connection, connected }
    })),

  addRunOfShowStep: (step: RunOfShowStep) => 
    set(state => ({
      runOfShow: [...state.runOfShow, step]
    })),

  updateRunOfShowStep: (id: string, stepUpdate: Partial<RunOfShowStep>) => 
    set(state => ({
      runOfShow: state.runOfShow.map(step => 
        step.id === id ? { ...step, ...stepUpdate } : step
      )
    })),

  removeRunOfShowStep: (id: string) => 
    set(state => ({
      runOfShow: state.runOfShow.filter(step => step.id !== id)
    })),

  reorderRunOfShowSteps: (steps: RunOfShowStep[]) => 
    set({ runOfShow: steps }),

  addConsoleLog: (log: Omit<ConsoleLog, 'id' | 'timestamp'>) => 
    set(state => ({
      consoleLogs: [...state.consoleLogs, {
        ...log,
        id: Date.now().toString(),
        timestamp: new Date()
      }]
    })),

  clearConsoleLogs: () => 
    set({ consoleLogs: [] }),

  setRunning: (running: boolean) => 
    set({ isRunning: running }),

  setCurrentStepIndex: (index: number) => 
    set({ currentStepIndex: index }),

  // Rundown grid actions
  addRowFromRunOfShow: (step: RunOfShowStep) => set(state => {
    const newRow: RundownRow = {
      id: `row-${Date.now()}`,
      title: step.title,
      time: undefined,
      duration: step.duration || '2:00',
      notes: step.description,
      description: step.description,
      actions: step.actions,
      order: state.rundown.rows.length,
      customFields: step.customFields,
      templateId: step.templateId
    }
    return {
      rundown: {
        ...state.rundown,
        rows: [...state.rundown.rows, newRow]
      }
    }
  }),

  updateRow: (rowId: string, update: Partial<RundownRow>) => set(state => {
    const rows = state.rundown.rows.map(r => r.id === rowId ? { ...r, ...update } : r)
    const updatedRow = rows.find(r => r.id === rowId)

    // Si se actualizaron customFields y hay templateId, persistir en plantilla o overrides
    if (update.customFields && updatedRow?.templateId) {
      const templateId = updatedRow.templateId
      const isCustom = state.customTemplates.some(t => t.id === templateId)
      if (isCustom) {
        // Actualizar plantilla personalizada con los customFields por defecto
        const template = state.customTemplates.find(t => t.id === templateId)!
        state.updateCustomTemplate(templateId, { customFields: update.customFields })
      } else {
        // Guardar overrides para plantillas base
        const newOverrides = { ...state.templateOverrides, [templateId]: update.customFields }
        saveTemplateOverrides(newOverrides)
        return {
          rundown: { ...state.rundown, rows },
          templateOverrides: newOverrides
        }
      }
    }

    return {
      rundown: {
        ...state.rundown,
        rows
      }
    }
  }),

  removeRow: (rowId: string) => set(state => ({
    rundown: {
      ...state.rundown,
      rows: state.rundown.rows.filter(r => r.id !== rowId)
    }
  })),

  reorderRows: (oldIndex: number, newIndex: number) => set(state => {
    const newRows = [...state.rundown.rows]
    const [movedRow] = newRows.splice(oldIndex, 1)
    newRows.splice(newIndex, 0, movedRow)
    
    return {
      rundown: {
        ...state.rundown,
        rows: newRows.map((row, index) => ({ ...row, order: index }))
      }
    }
  }),

  executeRow: (rowId: string) => {
    const state = get()
    const row = state.rundown.rows.find(r => r.id === rowId)
    if (row) {
      state.addConsoleLog({
        message: `Ejecutando fila: ${row.title}`,
        type: 'info'
      })
      // Aquí se ejecutarían las acciones de la fila
    }
  },

  // Acciones plantillas personalizadas
  addCustomTemplate: (template: BlockTemplate) => set(state => {
    const newTemplates = [...state.customTemplates, template]
    saveCustomTemplates(newTemplates)
    return { customTemplates: newTemplates }
  }),

  removeCustomTemplate: (templateId: string) => set(state => {
    const newTemplates = state.customTemplates.filter(t => t.id !== templateId)
    saveCustomTemplates(newTemplates)
    return { customTemplates: newTemplates }
  }),

  updateCustomTemplate: (templateId: string, updates: Partial<BlockTemplate>) => set(state => {
    const newTemplates = state.customTemplates.map(t => 
      t.id === templateId ? { ...t, ...updates } : t
    )
    saveCustomTemplates(newTemplates)
    return { customTemplates: newTemplates }
  }),

  setTemplateOverride: (templateId: string, fields: CustomField[]) => set(state => {
    const updated = { ...state.templateOverrides, [templateId]: fields }
    saveTemplateOverrides(updated)
    return { templateOverrides: updated }
  }),

  // Acciones horarios del show
  setShowStartTime: (time: string) => set({ showStartTime: time }),

  setShowEndTime: (time: string) => set({ showEndTime: time }),

  // Acciones estado del show
  setCurrentBlockIndex: (index: number) => set({ currentBlockIndex: index }),

  setShowStatus: (status: 'idle' | 'running' | 'paused' | 'completed') => set({ showStatus: status }),

  startShow: () => set(state => {
    if (state.rundown.rows.length === 0) return state
    return {
      showStatus: 'running',
      currentBlockIndex: 0
    }
  }),

  pauseShow: () => set({ showStatus: 'paused' }),

  resumeShow: () => set({ showStatus: 'running' }),

  stopShow: () => set({
    showStatus: 'idle',
    currentBlockIndex: -1
  }),

  nextBlock: () => set(state => {
    if (state.currentBlockIndex < state.rundown.rows.length - 1) {
      return {
        currentBlockIndex: state.currentBlockIndex + 1
      }
    } else {
      return {
        showStatus: 'completed',
        currentBlockIndex: -1
      }
    }
  })
}))

// Funciones utilitarias para manejo de tiempo (formato 24 horas)
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(minutes: number): string {
  // Manejar el paso de medianoche (más de 24 horas)
  const totalMinutes = minutes % (24 * 60) // Limitar a 24 horas
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function calculateEndTime(startTime: string, totalDuration: string): string {
  // Convertir startTime (HH:MM) a segundos totales
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const startTotalSeconds = startHours * 3600 + startMinutes * 60
  
  // Convertir totalDuration (MM:SS) a segundos totales
  const [durationMinutes, durationSeconds] = totalDuration.split(':').map(Number)
  const durationTotalSeconds = durationMinutes * 60 + durationSeconds
  
  // Calcular tiempo final en segundos
  const endTotalSeconds = startTotalSeconds + durationTotalSeconds
  
  // Convertir de vuelta a HH:MM:SS
  const hours = Math.floor(endTotalSeconds / 3600) % 24 // Limitar a 24 horas
  const minutes = Math.floor((endTotalSeconds % 3600) / 60)
  const seconds = endTotalSeconds % 60
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
