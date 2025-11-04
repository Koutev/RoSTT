'use client'

import { useState, useEffect } from 'react'
import { useVMixStore } from '@/store/vmix-store'
import { Clock, Play, Pause } from 'lucide-react'

export default function Timeline() {
  const { showStatus, currentBlockIndex, rundown } = useVMixStore()
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [totalDuration, setTotalDuration] = useState<number>(0)

  // Obtener todos los bloques (excluyendo ITEMs, incluyendo sus children)
  const getAllBlocks = () => {
    const allBlocks: typeof rundown.rows = []
    for (const row of rundown.rows) {
      if (row.type === 'item') {
        if (row.children) {
          allBlocks.push(...row.children)
        }
      } else {
        allBlocks.push(row)
      }
    }
    return allBlocks
  }

  // Función para convertir duración a segundos
  const parseDurationToSeconds = (duration: string): number => {
    const parts = duration.split(':').map(Number)
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1]
    } else if (parts.length === 1) {
      // SS
      return parts[0]
    }
    return 0
  }

  // Función para formatear segundos a MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Función para calcular el progreso (0-100)
  const getProgress = (): number => {
    if (totalDuration === 0) return 0
    return ((totalDuration - timeRemaining) / totalDuration) * 100
  }

  // Efecto para manejar el timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (showStatus === 'running' && currentBlockIndex >= 0) {
      const allBlocks = getAllBlocks()
      const currentBlock = allBlocks[currentBlockIndex]
      if (currentBlock && currentBlock.duration) {
        const durationInSeconds = parseDurationToSeconds(currentBlock.duration)
        setTotalDuration(durationInSeconds)
        setTimeRemaining(durationInSeconds)

        // Timer que cuenta hacia atrás cada segundo
        intervalId = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              // Tiempo agotado, el ShowTimer se encargará del siguiente bloque
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } else if (showStatus === 'paused') {
      // Mantener el tiempo actual cuando está pausado
    } else {
      // Reset cuando está idle o completed
      setTimeRemaining(0)
      setTotalDuration(0)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [showStatus, currentBlockIndex, rundown.rows])

  // Reset cuando cambia el bloque actual
  useEffect(() => {
    if (currentBlockIndex >= 0 && showStatus === 'running') {
      const allBlocks = getAllBlocks()
      const currentBlock = allBlocks[currentBlockIndex]
      if (currentBlock && currentBlock.duration) {
        const durationInSeconds = parseDurationToSeconds(currentBlock.duration)
        setTotalDuration(durationInSeconds)
        setTimeRemaining(durationInSeconds)
      }
    }
  }, [currentBlockIndex, showStatus, rundown.rows])

  // No mostrar si no hay show en ejecución
  if (showStatus === 'idle' || showStatus === 'completed') {
    return null
  }

  const allBlocks = getAllBlocks()
  const currentBlock = currentBlockIndex >= 0 ? allBlocks[currentBlockIndex] : null
  const progress = getProgress()

  return (
    <div className="flex-shrink-0 border-b border-border bg-gradient-to-r from-red-50 to-orange-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Información del bloque actual */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {showStatus === 'running' ? (
                <Play className="h-5 w-5 text-green-600" />
              ) : (
                <Pause className="h-5 w-5 text-yellow-600" />
              )}
              <span className="text-sm font-medium text-muted-foreground">
                {showStatus === 'running' ? 'Ejecutando' : 'Pausado'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Bloque {currentBlockIndex + 1}: {currentBlock?.title || 'Desconocido'}
              </span>
            </div>
          </div>

          {/* Timer principal */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs text-muted-foreground">
                Tiempo restante
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-medium text-muted-foreground">
                {formatTime(totalDuration)}
              </div>
              <div className="text-xs text-muted-foreground">
                Duración total
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Indicadores de tiempo */}
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(totalDuration)}</span>
            <span className="font-medium">
              {progress.toFixed(1)}% completado
            </span>
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}





