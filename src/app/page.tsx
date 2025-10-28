'use client'

import { useEffect } from 'react'
import VMixConnectionCompact from '@/components/VMixConnectionCompact'
import ShowPlanner from '@/components/ShowPlanner'
import { useVMixStore } from '@/store/vmix-store'
import { automationEngine } from '@/services/automation-engine'

export default function Home() {
  const { connection, isRunning, addConsoleLog } = useVMixStore()

  // Polling para mantener la conexión activa
  useEffect(() => {
    if (!connection.connected) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://${connection.ip}:${connection.port}/api`)
        if (!response.ok) {
          addConsoleLog({
            message: 'Conexión perdida con vMix',
            type: 'error'
          })
        }
      } catch (error) {
        addConsoleLog({
          message: 'Error de conexión con vMix',
          type: 'error'
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [connection.connected, connection.ip, connection.port, addConsoleLog])

  // Manejar la ejecución automática
  useEffect(() => {
    if (isRunning) {
      automationEngine.startAutomation()
    } else {
      automationEngine.stopAutomation()
    }
  }, [isRunning])

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header compacto */}
      <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                vMix Automation Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Automatiza y controla tu show de vMix con precisión
              </p>
            </div>
            <VMixConnectionCompact />
          </div>
        </div>
      </div>

      {/* Panel principal - Solo rundown */}
      <div className="flex-1 overflow-hidden">
        <ShowPlanner />
      </div>
    </div>
  )
}
