'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useVMixStore } from '@/store/vmix-store'
import { showTimer } from '@/services/show-timer'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'

export default function ShowControlButton() {
  const { 
    showStatus, 
    currentBlockIndex, 
    rundown, 
    startShow, 
    pauseShow, 
    resumeShow, 
    stopShow 
  } = useVMixStore()

  // Manejar cambios de estado del show
  useEffect(() => {
    switch (showStatus) {
      case 'running':
        if (currentBlockIndex >= 0) {
          showTimer.startBlockTimer(currentBlockIndex)
        }
        break
      case 'paused':
        showTimer.pauseTimer()
        break
      case 'idle':
      case 'completed':
        showTimer.stopTimer()
        break
    }
  }, [showStatus, currentBlockIndex])

  const handleStart = () => {
    if (rundown.rows.length === 0) {
      alert('No hay bloques en el rundown para ejecutar')
      return
    }
    startShow()
  }

  const handlePause = () => {
    pauseShow()
  }

  const handleResume = () => {
    resumeShow()
    showTimer.resumeTimer()
  }

  const handleStop = () => {
    stopShow()
  }

  const getButtonContent = () => {
    switch (showStatus) {
      case 'idle':
        return (
          <Button
            onClick={handleStart}
            className="inline-flex items-center justify-center h-12 px-5 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Iniciar Show
          </Button>
        )
      
      case 'running':
        return (
          <div className="flex gap-2">
            <Button
              onClick={handlePause}
              className="inline-flex items-center justify-center h-12 px-4 rounded-full bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg"
            >
              <Pause className="h-5 w-5 mr-2" />
              Pausar
            </Button>
            <Button
              onClick={handleStop}
              className="inline-flex items-center justify-center h-12 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
            >
              <Square className="h-5 w-5 mr-2" />
              Detener
            </Button>
          </div>
        )
      
      case 'paused':
        return (
          <div className="flex gap-2">
            <Button
              onClick={handleResume}
              className="inline-flex items-center justify-center h-12 px-4 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Reanudar
            </Button>
            <Button
              onClick={handleStop}
              className="inline-flex items-center justify-center h-12 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
            >
              <Square className="h-5 w-5 mr-2" />
              Detener
            </Button>
          </div>
        )
      
      case 'completed':
        return (
          <Button
            onClick={handleStart}
            className="inline-flex items-center justify-center h-12 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reiniciar Show
          </Button>
        )
      
      default:
        return null
    }
  }

  const getStatusText = () => {
    if (showStatus === 'running' && currentBlockIndex >= 0) {
      const currentBlock = rundown.rows[currentBlockIndex]
      return `Ejecutando: ${currentBlock?.title || 'Bloque desconocido'}`
    }
    
    switch (showStatus) {
      case 'idle': return 'Listo para iniciar'
      case 'paused': return 'Show pausado'
      case 'completed': return 'Show completado'
      default: return ''
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end gap-2">
        {/* Estado del show */}
        {showStatus !== 'idle' && (
          <div className="px-3 py-1 bg-black/80 text-white text-sm rounded-full">
            {getStatusText()}
          </div>
        )}
        
        {/* Botones de control */}
        {getButtonContent()}
      </div>
    </div>
  )
}


