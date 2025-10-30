import { RunOfShowStep, VMixAction, BlockStyle, CustomField } from '@/store/vmix-store'

export interface BlockTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: string
  step: Omit<RunOfShowStep, 'id'>
  style?: BlockStyle
  // Campos personalizados por defecto asociados a esta plantilla
  customFields?: CustomField[]
}

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    id: 'starting-soon',
    name: 'Starting Soon',
    description: 'Pantalla de espera antes del show',
    icon: '⏰',
    category: 'Intro',
    step: {
      title: 'STARTING SOON',
      duration: '05:00',
      description: 'Pantalla de espera con música de fondo',
      actions: [
        { id: '1', action: 'Fade', target: 'StartingSoon', value: '', delay: 0 },
        { id: '2', action: 'SetVolume', target: 'StartingSoon', value: '0.8', delay: 1 }
      ]
    },
    style: {
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      borderColor: '#1d4ed8',
      borderWidth: 2,
      borderRadius: 8
    }
  },
  {
    id: 'show-intro',
    name: 'Show Intro',
    description: 'Introducción del programa',
    icon: '🎬',
    category: 'Intro',
    step: {
      title: 'SHOW INTRO',
      duration: '02:00',
      description: 'Intro con logo y música del programa',
      actions: [
        { id: '1', action: 'Cut', target: 'ShowIntro', value: '', delay: 0 },
        { id: '2', action: 'OverlayInput1In', target: 'Logo', value: '', delay: 2 },
        { id: '3', action: 'OverlayInput1Out', target: '', value: '', delay: 8 }
      ]
    },
    style: {
      backgroundColor: '#10b981',
      textColor: '#ffffff',
      borderColor: '#059669',
      borderWidth: 2,
      borderRadius: 8
    }
  },
  {
    id: 'camera-cut',
    name: 'Camera Cut',
    description: 'Cambio de cámara simple',
    icon: '📹',
    category: 'Camera',
    step: {
      title: 'CAMERA CUT',
      duration: '00:05',
      description: 'Cambio directo de cámara',
      actions: [
        { id: '1', action: 'Cut', target: 'Camera1', value: '', delay: 0 }
      ]
    },
    style: {
      backgroundColor: '#f59e0b',
      textColor: '#000000',
      borderColor: '#d97706',
      borderWidth: 1,
      borderRadius: 6
    }
  },
  {
    id: 'lower-third',
    name: 'Lower Third',
    description: 'Overlay de información inferior',
    icon: '📝',
    category: 'Graphics',
    step: {
      title: 'LOWER THIRD',
      duration: '00:10',
      description: 'Mostrar información del presentador',
      actions: [
        { id: '1', action: 'OverlayInput1In', target: 'LowerThird1', value: '', delay: 0 },
        { id: '2', action: 'OverlayInput1Out', target: '', value: '', delay: 8 }
      ]
    },
    style: {
      backgroundColor: '#8b5cf6',
      textColor: '#ffffff',
      borderColor: '#7c3aed',
      borderWidth: 1,
      borderRadius: 6
    }
  },
  {
    id: 'break',
    name: 'Break',
    description: 'Pausa comercial o intermedio',
    icon: '⏸️',
    category: 'Break',
    step: {
      title: 'BREAK',
      duration: '03:00',
      description: 'Pausa comercial',
      actions: [
        { id: '1', action: 'Fade', target: 'Break', value: '', delay: 0 },
        { id: '2', action: 'StartRecording', target: '', value: '', delay: 1 }
      ]
    },
    style: {
      backgroundColor: '#6b7280',
      textColor: '#ffffff',
      borderColor: '#4b5563',
      borderWidth: 1,
      borderRadius: 6
    }
  },
  {
    id: 'interview',
    name: 'Interview',
    description: 'Segmento de entrevista',
    icon: '🎤',
    category: 'Content',
    step: {
      title: 'INTERVIEW',
      duration: '10:00',
      description: 'Entrevista con invitado',
      actions: [
        { id: '1', action: 'Cut', target: 'Interview', value: '', delay: 0 },
        { id: '2', action: 'SetVolume', target: 'Interview', value: '0.9', delay: 1 }
      ]
    },
    style: {
      backgroundColor: '#ec4899',
      textColor: '#ffffff',
      borderColor: '#db2777',
      borderWidth: 2,
      borderRadius: 8
    }
  },
  {
    id: 'end-show',
    name: 'End Show',
    description: 'Cierre del programa',
    icon: '🏁',
    category: 'Outro',
    step: {
      title: 'END OF SHOW',
      duration: '01:00',
      description: 'Cierre y despedida',
      actions: [
        { id: '1', action: 'Fade', target: 'EndShow', value: '', delay: 0 },
        { id: '2', action: 'StopRecording', target: '', value: '', delay: 2 }
      ]
    },
    style: {
      backgroundColor: '#ef4444',
      textColor: '#ffffff',
      borderColor: '#dc2626',
      borderWidth: 2,
      borderRadius: 8
    }
  },
  {
    id: 'custom',
    name: 'Custom Block',
    description: 'Bloque personalizado desde cero',
    icon: '⚙️',
    category: 'Custom',
    step: {
      title: 'CUSTOM BLOCK',
      duration: '02:00',
      description: 'Bloque personalizado',
      actions: []
    }
  }
]

export const getTemplatesByCategory = () => {
  const categories = Array.from(new Set(BLOCK_TEMPLATES.map(t => t.category)))
  return categories.map(category => ({
    category,
    templates: BLOCK_TEMPLATES.filter(t => t.category === category)
  }))
}
