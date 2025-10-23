import { create } from 'zustand'

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
  reorderRows: (rows: RundownRow[]) => void
  executeRow: (rowId: string) => void
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
}

export interface RundownGrid {
  columns: RundownColumn[]
  rows: RundownRow[]
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
      order: state.rundown.rows.length
    }
    return {
      rundown: {
        ...state.rundown,
        rows: [...state.rundown.rows, newRow]
      }
    }
  }),

  updateRow: (rowId: string, update: Partial<RundownRow>) => set(state => ({
    rundown: {
      ...state.rundown,
      rows: state.rundown.rows.map(r => r.id === rowId ? { ...r, ...update } : r)
    }
  })),

  removeRow: (rowId: string) => set(state => ({
    rundown: {
      ...state.rundown,
      rows: state.rundown.rows.filter(r => r.id !== rowId)
    }
  })),

  reorderRows: (rows: RundownRow[]) => set(state => ({
    rundown: {
      ...state.rundown,
      rows: rows.map((row, index) => ({ ...row, order: index }))
    }
  })),

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
  }
}))
