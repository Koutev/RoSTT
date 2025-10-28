import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ip = searchParams.get('ip')
  const port = searchParams.get('port')
  const functionParam = searchParams.get('Function')
  const inputParam = searchParams.get('Input')
  const valueParam = searchParams.get('Value')

  if (!ip || !port) {
    return NextResponse.json(
      { error: 'IP y puerto son requeridos' },
      { status: 400 }
    )
  }

  try {
    // Construir URL de vMix
    let vmixUrl = `http://${ip}:${port}/api`
    
    // Agregar parámetros si existen
    const params = new URLSearchParams()
    if (functionParam) params.append('Function', functionParam)
    if (inputParam) params.append('Input', inputParam)
    if (valueParam) params.append('Value', valueParam)
    
    if (params.toString()) {
      vmixUrl += `?${params.toString()}`
    }

    // Hacer petición a vMix desde el servidor (sin problemas de CORS)
    const response = await fetch(vmixUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      throw new Error(`vMix responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })

  } catch (error: any) {
    console.error('Proxy error:', error)
    
    return NextResponse.json(
      { 
        error: 'Error conectando con vMix',
        details: error.message,
        code: error.code || 'UNKNOWN'
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

