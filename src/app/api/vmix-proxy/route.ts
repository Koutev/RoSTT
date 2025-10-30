import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ip = searchParams.get('ip')
  const port = searchParams.get('port')
  const functionParam = searchParams.get('Function')

  // Log mínimo para depuración (no logueamos todos los params por privacidad)
  console.log(`[VMix Proxy] Request received:`, { ip, port, Function: functionParam })

  if (!ip || !port) {
    console.log(`[VMix Proxy] Missing IP or port`)
    return NextResponse.json(
      { error: 'IP y puerto son requeridos' },
      { status: 400 }
    )
  }

  try {
    // Formato correcto según documentación oficial: http://IP:PORT/api/
    let vmixUrl = `http://${ip}:${port}/api/`
    
    // Reenviar TODOS los parámetros (excepto ip y port) para soportar Duration y otros
    const params = new URLSearchParams()
    for (const [key, value] of Array.from(searchParams.entries())) {
      if (key === 'ip' || key === 'port') continue
      if (!value) continue
      params.append(key, value)
    }
    
    if (params.toString()) {
      vmixUrl += `?${params.toString()}`
    }

    console.log(`[VMix Proxy] Attempting connection to: ${vmixUrl}`)

    // Hacer petición a vMix desde el servidor (sin problemas de CORS)
    const response = await fetch(vmixUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, text/xml, */*',
        'Content-Type': 'application/xml',
      },
      // Timeout de 5 segundos (reducido para mejor UX)
      signal: AbortSignal.timeout(5000)
    })

    console.log(`[VMix Proxy] Response status: ${response.status}`)

    if (!response.ok) {
      console.log(`[VMix Proxy] vMix responded with error: ${response.status} ${response.statusText}`)
      throw new Error(`vMix responded with status: ${response.status} - ${response.statusText}`)
    }

    // vMix devuelve XML, lo devolvemos tal cual (passthrough)
    const xmlData = await response.text()
    console.log(`[VMix Proxy] Successfully connected to vMix`)

    return new NextResponse(xmlData, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error: any) {
    console.error(`[VMix Proxy] Error connecting to ${ip}:${port}:`, error.message)
    
    let errorMessage = 'Error conectando con vMix'
    let errorCode = 'UNKNOWN'
    
    if (error.name === 'TimeoutError') {
      errorMessage = `Timeout: vMix no responde en ${ip}:${port}. Verifica que vMix esté ejecutándose y el Web Controller esté habilitado.`
      errorCode = 'TIMEOUT'
    } else if (error.message.includes('ECONNREFUSED')) {
      errorMessage = `Conexión rechazada: No se puede conectar a ${ip}:${port}. Verifica que vMix esté ejecutándose.`
      errorCode = 'CONNECTION_REFUSED'
    } else if (error.message.includes('ENOTFOUND')) {
      errorMessage = `IP no encontrada: ${ip} no es accesible. Verifica la dirección IP.`
      errorCode = 'HOST_NOT_FOUND'
    } else if (error.message.includes('status:')) {
      errorMessage = `vMix respondió con error: ${error.message}`
      errorCode = 'VMIX_ERROR'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
        code: errorCode,
        ip,
        port
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

