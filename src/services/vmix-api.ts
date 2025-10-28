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

  setConnection(ip: string, port: number) {
    this.baseURL = `http://${ip}:${port}/api`
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}`, { timeout: 5000 })
      return response.status === 200
    } catch (error) {
      console.error('Error testing vMix connection:', error)
      return false
    }
  }

  async getData(): Promise<VMixData | null> {
    try {
      const response = await axios.get(`${this.baseURL}`, { timeout: 5000 })
      return response.data
    } catch (error) {
      console.error('Error fetching vMix data:', error)
      return null
    }
  }

  async sendCommand(action: string, input?: string, value?: string): Promise<boolean> {
    try {
      let url = `${this.baseURL}?Function=${action}`
      
      if (input) {
        url += `&Input=${input}`
      }
      
      if (value) {
        url += `&Value=${value}`
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
