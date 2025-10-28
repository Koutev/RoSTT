'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useVMixStore } from '@/store/vmix-store'
import { Play, Pause, Square, SkipForward } from 'lucide-react'

export default function ExecutionControl() {
  const { 
    runOfShow, 
    isRunning, 
    currentStepIndex, 
    setRunning, 
    setCurrentStepIndex,
    connection 
  } = useVMixStore()

  const currentStep = currentStepIndex >= 0 ? runOfShow[currentStepIndex] : null
  const progress = runOfShow.length > 0 ? ((currentStepIndex + 1) / runOfShow.length) * 100 : 0

  const handleStart = () => {
    if (runOfShow.length === 0) return
    setRunning(true)
    setCurrentStepIndex(0)
  }

  const handlePause = () => {
    setRunning(false)
  }

  const handleResume = () => {
    setRunning(true)
  }

  const handleStop = () => {
    setRunning(false)
    setCurrentStepIndex(-1)
  }

  const handleNextStep = () => {
    if (currentStepIndex < runOfShow.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      handleStop()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control de Ejecución</CardTitle>
        <CardDescription>
          Controla la ejecución automática del Run of Show
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado de conexión */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Estado:</span>
          <Badge variant={connection.connected ? 'success' : 'destructive'}>
            {connection.connected ? 'Conectado' : 'Desconectado'}
          </Badge>
          {connection.connected && (
            <span className="text-sm text-muted-foreground">
              {connection.ip}:{connection.port}
            </span>
          )}
        </div>

        {/* Progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso del Show</span>
            <span>{currentStepIndex + 1} de {runOfShow.length}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Paso actual */}
        {currentStep && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Paso Actual</Badge>
              <span className="font-medium">{currentStep.title}</span>
            </div>
            {currentStep.description && (
              <p className="text-sm text-muted-foreground">{currentStep.description}</p>
            )}
            {currentStep.time && (
              <p className="text-sm">
                <span className="font-medium">Tiempo:</span> {currentStep.time}
              </p>
            )}
            {currentStep.condition && (
              <p className="text-sm">
                <span className="font-medium">Condición:</span> {currentStep.condition}
              </p>
            )}
            <div className="mt-2">
              <span className="text-sm font-medium">Acciones ({currentStep.actions.length}):</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentStep.actions.map((action, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {action.action}
                    {action.target && ` (${action.target})`}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-2">
          {!isRunning ? (
            <>
              <Button 
                onClick={handleStart} 
                disabled={runOfShow.length === 0 || !connection.connected}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Iniciar Show
              </Button>
              {currentStepIndex >= 0 && (
                <Button 
                  onClick={handleResume}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Reanudar
                </Button>
              )}
            </>
          ) : (
            <Button 
              onClick={handlePause}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              Pausar
            </Button>
          )}

          {currentStepIndex >= 0 && (
            <>
              <Button 
                onClick={handleNextStep}
                variant="outline"
                className="flex items-center gap-2"
              >
                <SkipForward className="h-4 w-4" />
                Siguiente
              </Button>
              <Button 
                onClick={handleStop}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Detener
              </Button>
            </>
          )}
        </div>

        {/* Información del show */}
        <div className="text-sm text-muted-foreground">
          <p>Total de pasos: {runOfShow.length}</p>
          {runOfShow.length > 0 && (
            <p>Duración estimada: {runOfShow.length * 2} minutos</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
