import { vmixAPI } from './vmix-api'
import { useVMixStore } from '@/store/vmix-store'
import { VMixAction } from '@/store/vmix-store'

export class AutomationEngine {
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  async executeAction(action: VMixAction): Promise<boolean> {
    const { addConsoleLog } = useVMixStore.getState()
    
    try {
      addConsoleLog({
        message: `Ejecutando: ${action.action}${action.target ? ` en ${action.target}` : ''}${action.value ? ` con valor ${action.value}` : ''}`,
        type: 'info'
      })

      let success = false

      switch (action.action) {
        case 'Cut':
          success = await vmixAPI.cut(action.target || '')
          break
        case 'Fade':
          success = await vmixAPI.fade(action.target || '')
          break
        case 'OverlayInput1In':
          success = await vmixAPI.overlayInputIn(1, action.target || '')
          break
        case 'OverlayInput1Out':
          success = await vmixAPI.overlayInputOut(1)
          break
        case 'PlayInput':
          success = await vmixAPI.playInput(action.target || '')
          break
        case 'PauseInput':
          success = await vmixAPI.pauseInput(action.target || '')
          break
        case 'SetVolume':
          success = await vmixAPI.setVolume(action.target || '', parseFloat(action.value || '0'))
          break
        case 'SetText':
          success = await vmixAPI.setText(action.target || '', action.value || '')
          break
        default:
          // Comando genérico
          success = await vmixAPI.sendCommand(action.action, action.target, action.value)
      }

      if (success) {
        addConsoleLog({
          message: `✅ Acción completada: ${action.action}`,
          type: 'success'
        })
      } else {
        addConsoleLog({
          message: `❌ Error ejecutando: ${action.action}`,
          type: 'error'
        })
      }

      return success
    } catch (error) {
      addConsoleLog({
        message: `❌ Error ejecutando ${action.action}: ${error}`,
        type: 'error'
      })
      return false
    }
  }

  async executeStep(stepIndex: number): Promise<boolean> {
    const { runOfShow, addConsoleLog, setCurrentStepIndex } = useVMixStore.getState()
    const step = runOfShow[stepIndex]

    if (!step) {
      addConsoleLog({
        message: `❌ Paso ${stepIndex + 1} no encontrado`,
        type: 'error'
      })
      return false
    }

    addConsoleLog({
      message: `🎬 Ejecutando paso: ${step.title}`,
      type: 'info'
    })

    setCurrentStepIndex(stepIndex)

    // Ejecutar todas las acciones del paso
    let allSuccess = true
    for (const action of step.actions) {
      if (action.delay && action.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, (action.delay || 0) * 1000))
      }
      
      const success = await this.executeAction(action)
      if (!success) {
        allSuccess = false
      }
    }

    if (allSuccess) {
      addConsoleLog({
        message: `✅ Paso completado: ${step.title}`,
        type: 'success'
      })
    } else {
      addConsoleLog({
        message: `⚠️ Paso completado con errores: ${step.title}`,
        type: 'warning'
      })
    }

    return allSuccess
  }

  async startAutomation(): Promise<void> {
    const { runOfShow, setRunning, addConsoleLog } = useVMixStore.getState()

    if (runOfShow.length === 0) {
      addConsoleLog({
        message: '❌ No hay pasos en el Run of Show',
        type: 'error'
      })
      return
    }

    this.isRunning = true
    setRunning(true)

    addConsoleLog({
      message: `🚀 Iniciando automatización con ${runOfShow.length} pasos`,
      type: 'info'
    })

    // Ejecutar cada paso secuencialmente
    for (let i = 0; i < runOfShow.length && this.isRunning; i++) {
      const step = runOfShow[i]
      
      // Verificar condiciones si existen
      if (step.condition) {
        addConsoleLog({
          message: `🔍 Verificando condición: ${step.condition}`,
          type: 'info'
        })
        // Aquí se implementaría la lógica de evaluación de condiciones
        // Por ahora, asumimos que la condición se cumple
      }

      // Verificar timing si existe
      if (step.time) {
        addConsoleLog({
          message: `⏰ Esperando tiempo: ${step.time}`,
          type: 'info'
        })
        // Aquí se implementaría la lógica de timing
        // Por ahora, ejecutamos inmediatamente
      }

      await this.executeStep(i)

      // Pausa entre pasos (configurable)
      if (i < runOfShow.length - 1 && this.isRunning) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    if (this.isRunning) {
      addConsoleLog({
        message: '🎉 Automatización completada',
        type: 'success'
      })
      setRunning(false)
    }

    this.isRunning = false
  }

  stopAutomation(): void {
    const { setRunning, addConsoleLog } = useVMixStore.getState()
    
    this.isRunning = false
    setRunning(false)
    
    addConsoleLog({
      message: '⏹️ Automatización detenida',
      type: 'warning'
    })
  }

  pauseAutomation(): void {
    const { addConsoleLog } = useVMixStore.getState()
    
    this.isRunning = false
    
    addConsoleLog({
      message: '⏸️ Automatización pausada',
      type: 'warning'
    })
  }

  resumeAutomation(): void {
    const { addConsoleLog } = useVMixStore.getState()
    
    this.isRunning = true
    
    addConsoleLog({
      message: '▶️ Automatización reanudada',
      type: 'info'
    })
  }

  isAutomationRunning(): boolean {
    return this.isRunning
  }
}

export const automationEngine = new AutomationEngine()
