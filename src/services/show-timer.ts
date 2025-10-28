import { useVMixStore } from '@/store/vmix-store'
import { automationEngine } from './automation-engine'

class ShowTimer {
  private intervalId: NodeJS.Timeout | null = null
  private currentBlockStartTime: number = 0
  private currentBlockDuration: number = 0

  startBlockTimer(blockIndex: number): void {
    const state = useVMixStore.getState()
    const block = state.rundown.rows[blockIndex]
    
    if (!block || !block.duration) {
      console.warn('Bloque sin duración, pasando al siguiente')
      this.nextBlock()
      return
    }

    // Convertir duración a milisegundos
    this.currentBlockDuration = this.parseDurationToMs(block.duration)
    this.currentBlockStartTime = Date.now()

    console.log(`Iniciando bloque: ${block.title} (${block.duration})`)

    // Ejecutar acciones del bloque
    this.executeBlockActions(block)

    // Configurar timer para el siguiente bloque
    this.intervalId = setTimeout(() => {
      this.nextBlock()
    }, this.currentBlockDuration)
  }

  private executeBlockActions(block: any): void {
    // Ejecutar todas las acciones del bloque
    block.actions.forEach(async (action: any) => {
      try {
        await automationEngine.executeAction(action)
      } catch (error) {
        console.error('Error ejecutando acción:', error)
      }
    })
  }

  private parseDurationToMs(duration: string): number {
    const parts = duration.split(':').map(Number)
    if (parts.length === 3) {
      // HH:MM:SS
      return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000
    } else if (parts.length === 2) {
      // MM:SS
      return (parts[0] * 60 + parts[1]) * 1000
    } else if (parts.length === 1) {
      // SS
      return parts[0] * 1000
    }
    return 0
  }

  nextBlock(): void {
    const state = useVMixStore.getState()
    
    if (this.intervalId) {
      clearTimeout(this.intervalId)
      this.intervalId = null
    }

    if (state.showStatus === 'running') {
      state.nextBlock()
      
      if (state.currentBlockIndex >= 0) {
        // Hay más bloques, iniciar el siguiente
        this.startBlockTimer(state.currentBlockIndex)
      } else {
        // Show completado
        console.log('Show completado')
        state.setShowStatus('completed')
      }
    }
  }

  pauseTimer(): void {
    if (this.intervalId) {
      clearTimeout(this.intervalId)
      this.intervalId = null
    }
  }

  resumeTimer(): void {
    const state = useVMixStore.getState()
    if (state.showStatus === 'running' && state.currentBlockIndex >= 0) {
      const block = state.rundown.rows[state.currentBlockIndex]
      if (block && block.duration) {
        // Calcular tiempo restante
        const elapsed = Date.now() - this.currentBlockStartTime
        const remaining = this.currentBlockDuration - elapsed
        
        if (remaining > 0) {
          this.intervalId = setTimeout(() => {
            this.nextBlock()
          }, remaining)
        } else {
          // El tiempo ya pasó, ir al siguiente bloque
          this.nextBlock()
        }
      }
    }
  }

  stopTimer(): void {
    if (this.intervalId) {
      clearTimeout(this.intervalId)
      this.intervalId = null
    }
    this.currentBlockStartTime = 0
    this.currentBlockDuration = 0
  }

  getCurrentBlockProgress(): number {
    if (this.currentBlockDuration === 0) return 0
    
    const elapsed = Date.now() - this.currentBlockStartTime
    return Math.min((elapsed / this.currentBlockDuration) * 100, 100)
  }
}

export const showTimer = new ShowTimer()
