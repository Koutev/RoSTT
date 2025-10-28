'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useVMixStore } from '@/store/vmix-store'
import { Trash2, Terminal } from 'lucide-react'
import { format } from 'date-fns'

export default function ConsoleLog() {
  const { consoleLogs, clearConsoleLogs } = useVMixStore()

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  const getLogVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'success' as const
      case 'error':
        return 'destructive' as const
      case 'warning':
        return 'warning' as const
      default:
        return 'secondary' as const
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Consola de Logs
        </CardTitle>
        <CardDescription>
          Monitorea la ejecución y estado de las acciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controles */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {consoleLogs.length} entradas
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearConsoleLogs}
              disabled={consoleLogs.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>

          {/* Lista de logs */}
          <div className="h-64 overflow-y-auto border rounded-lg bg-muted/20 p-4 space-y-2">
            {consoleLogs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No hay logs disponibles
              </div>
            ) : (
              consoleLogs.slice().reverse().map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-2 rounded border bg-background"
                >
                  <span className="text-lg">{getLogIcon(log.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getLogVariant(log.type)} className="text-xs">
                        {log.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(log.timestamp, 'HH:mm:ss')}
                      </span>
                    </div>
                    <p className="text-sm">{log.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Información adicional */}
          <div className="text-xs text-muted-foreground">
            <p>• Los logs se muestran en orden cronológico inverso</p>
            <p>• Los timestamps están en tiempo real</p>
            <p>• Los logs se mantienen durante la sesión</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
