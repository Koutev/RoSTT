'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, XCircle, Clock, Wifi, WifiOff } from 'lucide-react'

export default function VMixDiagnostic() {
  const [ip, setIp] = useState('')
  const [port, setPort] = useState('8088')
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const runDiagnostic = async () => {
    setTesting(true)
    setResults([])
    
    const tests = [
      {
        name: 'Validar IP y Puerto',
        test: () => {
          if (!ip || !port) {
            return { success: false, message: 'IP y puerto son requeridos' }
          }
          const portNum = parseInt(port)
          if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
            return { success: false, message: 'Puerto debe ser un número entre 1 y 65535' }
          }
          return { success: true, message: 'IP y puerto válidos' }
        }
      },
      {
        name: 'Probar conexión directa',
        test: async () => {
          try {
            const url = `http://${ip}:${port}/api`
            const response = await fetch(url, { 
              method: 'GET',
              signal: AbortSignal.timeout(3000)
            })
            
            if (response.ok) {
              const data = await response.json()
              return { 
                success: true, 
                message: `Conexión directa exitosa. vMix versión: ${data.version || 'Desconocida'}` 
              }
            } else {
              return { 
                success: false, 
                message: `Error HTTP ${response.status}: ${response.statusText}` 
              }
            }
          } catch (error: any) {
            if (error.name === 'AbortError') {
              return { success: false, message: 'Timeout: vMix no responde en 3 segundos' }
            }
            return { success: false, message: `Error: ${error.message}` }
          }
        }
      },
      {
        name: 'Probar conexión via proxy',
        test: async () => {
          try {
            const url = `/api/vmix-proxy?ip=${ip}&port=${port}`
            const response = await fetch(url, { 
              method: 'GET',
              signal: AbortSignal.timeout(5000)
            })
            
            if (response.ok) {
              const data = await response.json()
              return { 
                success: true, 
                message: `Proxy exitoso. vMix versión: ${data.version || 'Desconocida'}` 
              }
            } else {
              const errorData = await response.json().catch(() => ({}))
              return { 
                success: false, 
                message: `Error del proxy: ${errorData.error || response.statusText}` 
              }
            }
          } catch (error: any) {
            if (error.name === 'AbortError') {
              return { success: false, message: 'Timeout del proxy: vMix no responde' }
            }
            return { success: false, message: `Error del proxy: ${error.message}` }
          }
        }
      },
      {
        name: 'Verificar configuración de red',
        test: () => {
          const isLocalhost = ip === 'localhost' || ip === '127.0.0.1'
          const isLocalNetwork = ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')
          
          if (isLocalhost) {
            return { 
              success: true, 
              message: 'Usando localhost - solo funciona si vMix está en la misma máquina' 
            }
          } else if (isLocalNetwork) {
            return { 
              success: true, 
              message: 'IP de red local detectada - funciona si estás en la misma red' 
            }
          } else {
            return { 
              success: false, 
              message: 'IP externa detectada - necesitas configurar port forwarding en tu router' 
            }
          }
        }
      }
    ]

    for (const test of tests) {
      try {
        const result = await test.test()
        setResults(prev => [...prev, {
          name: test.name,
          success: result.success,
          message: result.message,
          timestamp: new Date().toLocaleTimeString()
        }])
      } catch (error: any) {
        setResults(prev => [...prev, {
          name: test.name,
          success: false,
          message: `Error inesperado: ${error.message}`,
          timestamp: new Date().toLocaleTimeString()
        }])
      }
    }
    
    setTesting(false)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Diagnóstico de Conexión vMix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="diag-ip">IP de vMix</Label>
            <Input
              id="diag-ip"
              type="text"
              placeholder="192.168.1.100"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              disabled={testing}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="diag-port">Puerto</Label>
            <Input
              id="diag-port"
              type="number"
              placeholder="8088"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              disabled={testing}
            />
          </div>
        </div>

        <Button 
          onClick={runDiagnostic} 
          disabled={testing || !ip || !port}
          className="w-full"
        >
          {testing ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Ejecutando diagnóstico...
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              Ejecutar Diagnóstico
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Resultados del Diagnóstico:</h4>
            {results.map((result, index) => (
              <div key={index} className={`p-3 rounded-md border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-0.5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{result.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {result.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Instrucciones para vMix:</strong></p>
          <p>1. Abre vMix</p>
          <p>2. Ve a Settings → Web Controller</p>
          <p>3. Marca "Enable Web Controller"</p>
          <p>4. Verifica que el puerto sea 8088</p>
          <p>5. Encuentra tu IP con: ipconfig (Windows) o ifconfig (Mac/Linux)</p>
        </div>
      </CardContent>
    </Card>
  )
}
