'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useVMixStore } from '@/store/vmix-store'
import { vmixAPI } from '@/services/vmix-api'
import { Wifi, WifiOff, Settings, TestTube } from 'lucide-react'

export default function VMixConnectionCompact() {
  const { connection, setConnection, setConnected, addConsoleLog } = useVMixStore()
  const [isOpen, setIsOpen] = useState(false)
  const [ip, setIp] = useState(connection.ip)
  const [port, setPort] = useState(connection.port.toString())
  const [testing, setTesting] = useState(false)

  const handleConnect = async () => {
    const portNumber = parseInt(port)
    if (!ip || !portNumber) {
      addConsoleLog({
        message: 'Por favor ingresa una IP y puerto válidos',
        type: 'error'
      })
      return
    }

    setConnection(ip, portNumber)
    vmixAPI.setConnection(ip, portNumber)
    
    setTesting(true)
    addConsoleLog({
      message: `Intentando conectar a ${ip}:${portNumber}...`,
      type: 'info'
    })

    const isConnected = await vmixAPI.testConnection()
    
    if (isConnected) {
      setConnected(true)
      addConsoleLog({
        message: `Conectado exitosamente a vMix en ${ip}:${portNumber}`,
        type: 'success'
      })
      setIsOpen(false) // Cerrar el menú al conectar
    } else {
      setConnected(false)
      addConsoleLog({
        message: `No se pudo conectar a vMix en ${ip}:${portNumber}`,
        type: 'error'
      })
    }
    
    setTesting(false)
  }

  const handleTestConnection = async () => {
    if (!connection.connected) {
      addConsoleLog({
        message: 'No hay conexión activa para probar',
        type: 'warning'
      })
      return
    }

    setTesting(true)
    addConsoleLog({
      message: 'Probando conexión...',
      type: 'info'
    })

    const isConnected = await vmixAPI.testConnection()
    
    if (isConnected) {
      addConsoleLog({
        message: 'Conexión verificada correctamente',
        type: 'success'
      })
    } else {
      setConnected(false)
      addConsoleLog({
        message: 'Conexión perdida',
        type: 'error'
      })
    }
    
    setTesting(false)
  }

  const handleDisconnect = () => {
    setConnected(false)
    addConsoleLog({
      message: 'Desconectado de vMix',
      type: 'info'
    })
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Botón principal */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 ${
          connection.connected 
            ? 'border-green-500 text-green-600 hover:bg-green-50' 
            : 'border-red-500 text-red-600 hover:bg-red-50'
        }`}
      >
        {connection.connected ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="text-xs">
          {connection.connected ? 'vMix' : 'vMix'}
        </span>
        <Settings className="h-3 w-3" />
      </Button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Conexión vMix</h3>
              <Badge variant={connection.connected ? 'success' : 'destructive'}>
                {connection.connected ? 'Conectado' : 'Desconectado'}
              </Badge>
            </div>

            {connection.connected && (
              <div className="text-sm text-muted-foreground">
                {connection.ip}:{connection.port}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="ip-compact" className="text-xs">IP</Label>
                <Input
                  id="ip-compact"
                  type="text"
                  placeholder="192.168.1.100"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  disabled={connection.connected}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="port-compact" className="text-xs">Puerto</Label>
                <Input
                  id="port-compact"
                  type="number"
                  placeholder="8088"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  disabled={connection.connected}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {!connection.connected ? (
                <Button 
                  onClick={handleConnect} 
                  disabled={testing || !ip || !port}
                  size="sm"
                  className="flex-1"
                >
                  {testing ? 'Conectando...' : 'Conectar'}
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleTestConnection}
                    disabled={testing}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <TestTube className="h-3 w-3" />
                    {testing ? 'Probando...' : 'Probar'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDisconnect}
                    size="sm"
                    className="flex-1"
                  >
                    Desconectar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar el menú */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
