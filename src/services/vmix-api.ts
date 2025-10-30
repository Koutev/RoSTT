import axios from 'axios'

export interface VMixInput {
  key: string
  number: number
  type: string
  title: string
  shortTitle: string
}

export interface VMixData {
  inputs: VMixInput[]
  preview: number
  active: number
}

class VMixAPI {
  private baseURL = '/api/'
  private ip = ''
  private port = 8088

  setConnection(ip: string, port: number) {
    this.ip = ip
    this.port = port
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.baseURL}?ip=${this.ip}&port=${this.port}`
      const res = await axios.get(url, {
        timeout: 5000,
        responseType: 'text',
        headers: { Accept: 'application/xml, text/xml, */*' },
      })
      const xml = String(res.data || '')
      return res.status === 200 && xml.includes('<vmix>')
    } catch (e) {
      return false
    }
  }

  async getData(): Promise<VMixData | null> {
    try {
      const url = `${this.baseURL}?ip=${this.ip}&port=${this.port}`
      const res = await axios.get(url, {
        timeout: 5000,
        responseType: 'text',
        headers: { Accept: 'application/xml, text/xml, */*' },
      })
      const xml = String(res.data || '')
      if (typeof window === 'undefined') return null
      const doc = new DOMParser().parseFromString(xml, 'application/xml')
      const vmix = doc.querySelector('vmix')
      if (!vmix) return null
      const preview = parseInt((vmix.querySelector('preview')?.textContent || '0').trim()) || 0
      const active = parseInt((vmix.querySelector('active')?.textContent || '0').trim()) || 0
      const inputsRoot = vmix.querySelector('inputs')
      const inputs: VMixInput[] = inputsRoot
        ? Array.from(inputsRoot.getElementsByTagName('input')).map((el, idx) => ({
            key: el.getAttribute('key') || `${idx}`,
            number: parseInt(el.getAttribute('number') || `${idx + 1}`),
            type: el.getAttribute('type') || '',
            title: el.getAttribute('title') || '',
            shortTitle: el.getAttribute('shortTitle') || el.getAttribute('title') || '',
          }))
        : []
      return { inputs, preview, active }
    } catch (e) {
      return null
    }
  }

  async sendCommand(
    action: string,
    input?: string,
    value?: string,
    extraParams?: Record<string, string | number | boolean>
  ): Promise<boolean> {
    try {
      const params = new URLSearchParams()
      params.append('ip', this.ip)
      params.append('port', String(this.port))
      params.append('Function', action)
      if (input) params.append('Input', input)
      if (value) params.append('Value', value)
      if (extraParams) {
        for (const [k, v] of Object.entries(extraParams)) {
          if (v !== undefined && v !== null) params.append(k, String(v))
        }
      }
      const url = `${this.baseURL}?${params.toString()}`
      const res = await axios.get(url, { timeout: 5000 })
      return res.status === 200
    } catch (e) {
      return false
    }
  }

  // Helpers mínimos
  async cut(input: string) { return this.sendCommand('Cut', input) }
  async fade(input: string, durationMs?: number) {
    return this.sendCommand('Fade', input, undefined, durationMs ? { Duration: durationMs } : undefined)
  }
}

export const vmixAPI = new VMixAPI()
