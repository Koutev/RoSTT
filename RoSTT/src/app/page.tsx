'use client'

import { useEffect } from 'react'
import VMixConnectionCompact from '@/components/VMixConnectionCompact'
import ShowPlanner from '@/components/ShowPlanner'
import ConsoleLog from '@/components/ConsoleLog'
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header con conexión compacta */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                vMix Automation Dashboard
              </h1>
              <p className="text-muted-foreground">
                Automatiza y controla tu show de vMix con precisión
              </p>
            </div>
            <VMixConnectionCompact />
          </div>
        </div>

        {/* Panel principal vertical */}
        <div className="space-y-6">
          <ShowPlanner />
          <ConsoleLog />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Desarrollado para automatizar shows de vMix usando la API oficial
          </p>
          <p className="mt-1">
            Documentación de la API: 
            <a 
              href="https://vmixapi.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              vmixapi.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
