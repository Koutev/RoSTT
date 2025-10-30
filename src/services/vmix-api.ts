import axios from 'axios'

export interface VMixInput {
  key: string
  number: number
  type: string
  title: string
  shortTitle: string
  state: string
  position: number
  duration: number
  loop: boolean
  muted: boolean
  volume: number
  balance: number
  solo: boolean
  audiobusses: string
  meterF1: number
  meterF2: number
  gainDb: number
  fadeToBlack: boolean
  selectedIndex: number
  lastFrame: string
  lastFrameTime: number
}

export interface VMixOverlay {
  number: number
  input: string
  preset: string
}

export interface VMixData {
  version: string
  edition: string
  preset: string
  inputs: VMixInput[]
  overlays: VMixOverlay[]
  preview: number
  active: number
  fadeToBlack: boolean
  recording: boolean
  external: boolean
  streaming: boolean
  playList: boolean
  multiCorder: boolean
  fullscreen: boolean
  audio: {
    master: {
      volume: number
      muted: boolean
      meterF1: number
      meterF2: number
    }
  }
}

class VMixAPI {
  private baseURL: string = ''
  private ip: string = ''
  private port: number = 8088
  private useProxy: boolean = false

  setConnection(ip: string, port: number) {
    this.ip = ip
    this.port = port
    
    // Usar proxy HTTPS en producción (Vercel)
    this.useProxy = typeof window !== 'undefined' && window.location.protocol === 'https:'
    
    if (this.useProxy) {
      this.baseURL = '/api/vmix-proxy'
    } else {
      // Formato correcto según documentación oficial: http://IP:PORT/api/
      this.baseURL = `http://${ip}:${port}/api`
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = this.useProxy 
        ? `${this.baseURL}?ip=${this.ip}&port=${this.port}`
        : this.baseURL
        
      console.log(`[VMix API] Testing connection to: ${url}`)
        
      const response = await axios.get(url, { 
        timeout: 5000,
        responseType: 'text',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
        }
      })
      
      // vMix devuelve XML, verificar que recibimos contenido válido
      if (response.status === 200) {
        const xmlData = response.data
        console.log(`[VMix API] Connection successful, XML received:`, xmlData.substring(0, 200) + '...')
        
        // Verificar que recibimos XML válido de vMix
        if (typeof xmlData === 'string' && (xmlData.includes('<vmix>') || xmlData.includes('<vmixStatus>'))) {
          return true
        } else {
          console.error('Respuesta no válida de vMix - no es XML')
          return false
        }
      }
      
      return false
    } catch (error: any) {
      console.error('Error testing vMix connection:', error)
      
      // Log específico del tipo de error
      if (error.code === 'ECONNREFUSED') {
        console.error('Conexión rechazada - Verificar IP y puerto')
      } else if (error.code === 'ENOTFOUND') {
        console.error('IP no encontrada - Verificar dirección IP')
      } else if (error.code === 'ECONNABORTED') {
        console.error('Timeout - vMix puede estar ocupado o no responder')
      } else if (error.response?.status === 403) {
        console.error('Acceso denegado - Verificar permisos en vMix')
      } else if (error.response?.status === 404) {
        console.error('Endpoint no encontrado - Verificar configuración de vMix')
      }
      
      return false
    }
  }

  async getData(): Promise<VMixData | null> {
    try {
      const url = this.useProxy 
        ? `${this.baseURL}?ip=${this.ip}&port=${this.port}`
        : this.baseURL

      const response = await axios.get(url, { 
        timeout: 5000,
        responseType: 'text',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
        }
      })

      const xml = response.data as string
      if (typeof xml !== 'string') return null

      // Parse XML (browser DOMParser)
      const parser = new DOMParser()
      const doc = parser.parseFromString(xml, 'application/xml')
      const vmixEl = doc.querySelector('vmix')
      if (!vmixEl) return null

      const inputsEl = vmixEl.querySelector('inputs')
      const inputNodes = inputsEl ? Array.from(inputsEl.getElementsByTagName('input')) : []
      const inputs: VMixInput[] = inputNodes.map((el: Element, idx: number) => ({
        key: el.getAttribute('key') || `${idx}`,
        number: parseInt(el.getAttribute('number') || `${idx+1}`),
        type: el.getAttribute('type') || '',
        title: el.getAttribute('title') || '',
        shortTitle: el.getAttribute('shortTitle') || el.getAttribute('title') || '',
        state: el.getAttribute('state') || '',
        position: parseInt(el.getAttribute('position') || '0'),
        duration: parseInt(el.getAttribute('duration') || '0'),
        loop: (el.getAttribute('loop') || 'False') === 'True',
        muted: (el.getAttribute('muted') || 'False') === 'True',
        volume: parseInt(el.getAttribute('volume') || '0'),
        balance: parseInt(el.getAttribute('balance') || '0'),
        solo: (el.getAttribute('solo') || 'False') === 'True',
        audiobusses: el.getAttribute('audiobusses') || '',
        meterF1: parseInt(el.getAttribute('meterF1') || '0'),
        meterF2: parseInt(el.getAttribute('meterF2') || '0'),
        gainDb: parseInt(el.getAttribute('gainDb') || '0'),
        fadeToBlack: (el.getAttribute('fadeToBlack') || 'False') === 'True',
        selectedIndex: parseInt(el.getAttribute('selectedIndex') || '0'),
        lastFrame: el.getAttribute('lastFrame') || '',
        lastFrameTime: parseInt(el.getAttribute('lastFrameTime') || '0'),
      }))

      const overlays: VMixOverlay[] = [] // opcional: parsear <overlays>
      const preview = parseInt(vmixEl.getAttribute('preview') || '0')
      const active = parseInt(vmixEl.getAttribute('active') || '0')
      const fadeToBlack = (vmixEl.getAttribute('fadeToBlack') || 'False') === 'True'
      const recording = (vmixEl.getAttribute('recording') || 'False') === 'True'
      const external = (vmixEl.getAttribute('external') || 'False') === 'True'
      const streaming = (vmixEl.getAttribute('streaming') || 'False') === 'True'
      const playList = (vmixEl.getAttribute('playList') || 'False') === 'True'
      const multiCorder = (vmixEl.getAttribute('multiCorder') || 'False') === 'True'
      const fullscreen = (vmixEl.getAttribute('fullscreen') || 'False') === 'True'

      const data: VMixData = {
        version: vmixEl.getAttribute('version') || '',
        edition: vmixEl.getAttribute('edition') || '',
        preset: vmixEl.getAttribute('preset') || '',
        inputs,
        overlays,
        preview,
        active,
        fadeToBlack,
        recording,
        external,
        streaming,
        playList,
        multiCorder,
        fullscreen,
        audio: { master: { volume: 0, muted: false, meterF1: 0, meterF2: 0 } },
      }

      return data
    } catch (error) {
      console.error('Error fetching vMix data:', error)
      return null
    }
  }

  async sendCommand(action: string, input?: string, value?: string): Promise<boolean> {
    try {
      let url: string
      
      if (this.useProxy) {
        const params = new URLSearchParams({
          ip: this.ip,
          port: this.port.toString(),
          Function: action
        })
        if (input) params.append('Input', input)
        if (value) params.append('Value', value)
        url = `${this.baseURL}?${params.toString()}`
      } else {
        url = `${this.baseURL}?Function=${action}`
        if (input) url += `&Input=${input}`
        if (value) url += `&Value=${value}`
      }

      const response = await axios.get(url, { timeout: 5000 })
      return response.status === 200
    } catch (error) {
      console.error('Error sending vMix command:', error)
      return false
    }
  }

  // Comandos específicos de vMix
  async cut(input: string): Promise<boolean> {
    return this.sendCommand('Cut', input)
  }

  async fade(input: string): Promise<boolean> {
    return this.sendCommand('Fade', input)
  }

  async overlayInputIn(overlay: number, input: string): Promise<boolean> {
    return this.sendCommand(`OverlayInput${overlay}In`, input)
  }

  async overlayInputOut(overlay: number): Promise<boolean> {
    return this.sendCommand(`OverlayInput${overlay}Out`)
  }

  async playInput(input: string): Promise<boolean> {
    return this.sendCommand('PlayInput', input)
  }

  async pauseInput(input: string): Promise<boolean> {
    return this.sendCommand('PauseInput', input)
  }

  async setVolume(input: string, volume: number): Promise<boolean> {
    return this.sendCommand('SetVolume', input, volume.toString())
  }

  async setText(input: string, text: string): Promise<boolean> {
    return this.sendCommand('SetText', input, text)
  }

  async setPosition(input: string, position: number): Promise<boolean> {
    return this.sendCommand('SetPosition', input, position.toString())
  }
}

export const vmixAPI = new VMixAPI()
