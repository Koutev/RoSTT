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
    
    // Detectar si estamos en Vercel/HTTPS
    const isVercel = typeof window !== 'undefined' && window.location.protocol === 'https:'
    const connectionType = isVercel ? 'via proxy (Vercel)' : 'directa'
    
    addConsoleLog({
      message: `Intentando conectar a ${ip}:${portNumber} (${connectionType})...`,
      type: 'info'
    })

    try {
      const isConnected = await vmixAPI.testConnection()
      
      if (isConnected) {
        setConnected(true)
        addConsoleLog({
          message: `✅ Conectado exitosamente a vMix en ${ip}:${portNumber}${isVercel ? ' via proxy' : ''}`,
          type: 'success'
        })
        setIsOpen(false)
      } else {
        setConnected(false)
        addConsoleLog({
          message: `❌ No se pudo conectar a vMix en ${ip}:${portNumber}. Verifica:` +
            `\n• vMix está ejecutándose` +
            `\n• Web Controller está habilitado` +
            `\n• IP y puerto son correctos` +
            `\n• No hay firewall bloqueando` +
            `${isVercel ? '\n• El proxy de Vercel está funcionando' : ''}`,
          type: 'error'
        })
      }
    } catch (error: any) {
      setConnected(false)
      console.error('Error de conexión:', error)
      
      let errorMessage = `❌ Error de conexión: ${error.message}`
      
      // Manejar errores específicos del proxy
      if (error.response?.data?.code) {
        const errorData = error.response.data
        switch (errorData.code) {
          case 'TIMEOUT':
            errorMessage = `❌ Timeout: vMix no responde en ${ip}:${portNumber}.\nVerifica que vMix esté ejecutándose y el Web Controller esté habilitado.`
            break
          case 'CONNECTION_REFUSED':
            errorMessage = `❌ Conexión rechazada: No se puede conectar a ${ip}:${portNumber}.\nVerifica que vMix esté ejecutándose.`
            break
          case 'HOST_NOT_FOUND':
            errorMessage = `❌ IP no encontrada: ${ip} no es accesible.\nVerifica la dirección IP.`
            break
          case 'VMIX_ERROR':
            errorMessage = `❌ Error de vMix: ${errorData.details}`
            break
          default:
            errorMessage = `❌ Error: ${errorData.error || error.message}`
        }
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = `❌ Conexión rechazada. Verifica que vMix esté ejecutándose y el puerto ${portNumber} esté abierto.`
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = `❌ IP no encontrada. Verifica que ${ip} sea la dirección correcta de vMix.`
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = `❌ Timeout. vMix no responde en ${ip}:${portNumber}. Verifica la conexión de red.`
      } else if (isVercel && error.message.includes('proxy')) {
        errorMessage = `❌ Error del proxy de Vercel. Intenta nuevamente o verifica la configuración.`
      }
      
      addConsoleLog({
        message: errorMessage,
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
    <div className="relative z-[100]">
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
        <div className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-lg shadow-lg z-[9999] p-4">
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
          className="fixed inset-0 z-[9998]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
