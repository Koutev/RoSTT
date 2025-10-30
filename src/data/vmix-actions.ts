export interface VMixActionCatalogItem {
  value: string
  label: string
  category: string
}

// Catálogo centralizado de acciones vMix.
// Basado en la referencia de la API/shortcuts (vmixapi.com). Puede ampliarse sin tocar la UI.
export const VMIX_ACTIONS_CATALOG: VMixActionCatalogItem[] = [
  // General
  { value: 'Cut', label: 'Cut - Cambio directo', category: 'General' },
  { value: 'Fade', label: 'Fade - Transición suave', category: 'General' },
  { value: 'Merge', label: 'Merge - Transición', category: 'General' },
  { value: 'Stinger1', label: 'Stinger 1', category: 'General' },
  { value: 'Stinger2', label: 'Stinger 2', category: 'General' },
  { value: 'FadeToBlack', label: 'Fade to Black', category: 'General' },
  { value: 'FadeFromBlack', label: 'Fade from Black', category: 'General' },

  // Input / Playback
  { value: 'PlayInput', label: 'Play Input', category: 'Input' },
  { value: 'PauseInput', label: 'Pause Input', category: 'Input' },
  { value: 'StopInput', label: 'Stop Input', category: 'Input' },
  { value: 'RestartInput', label: 'Restart Input', category: 'Input' },
  { value: 'LoopInput', label: 'Loop Input', category: 'Input' },
  { value: 'PreviewInput', label: 'Preview Input', category: 'Input' },
  { value: 'ActiveInput', label: 'Active Input', category: 'Input' },

  // Overlay
  { value: 'OverlayInput1In', label: 'Overlay 1 In', category: 'Overlay' },
  { value: 'OverlayInput1Out', label: 'Overlay 1 Out', category: 'Overlay' },
  { value: 'OverlayInput2In', label: 'Overlay 2 In', category: 'Overlay' },
  { value: 'OverlayInput2Out', label: 'Overlay 2 Out', category: 'Overlay' },
  { value: 'OverlayInput3In', label: 'Overlay 3 In', category: 'Overlay' },
  { value: 'OverlayInput3Out', label: 'Overlay 3 Out', category: 'Overlay' },
  { value: 'OverlayInput4In', label: 'Overlay 4 In', category: 'Overlay' },
  { value: 'OverlayInput4Out', label: 'Overlay 4 Out', category: 'Overlay' },

  // Audio
  { value: 'AudioOn', label: 'Audio On', category: 'Audio' },
  { value: 'AudioOff', label: 'Audio Off', category: 'Audio' },
  { value: 'AudioToggle', label: 'Audio Toggle', category: 'Audio' },
  { value: 'SetVolume', label: 'Set Volume', category: 'Audio' },
  { value: 'SetAudioLevel', label: 'Set Audio Level', category: 'Audio' },
  { value: 'SetAudioBalance', label: 'Set Audio Balance', category: 'Audio' },
  { value: 'SetAudioBus', label: 'Set Audio Bus', category: 'Audio' },
  { value: 'SetAudioGain', label: 'Set Audio Gain', category: 'Audio' },
  { value: 'SoloOn', label: 'Solo On', category: 'Audio' },
  { value: 'SoloOff', label: 'Solo Off', category: 'Audio' },

  // Title / GT
  { value: 'SetText', label: 'Set Text', category: 'Title' },
  { value: 'SetTextColor', label: 'Set Text Color', category: 'Title' },
  { value: 'SetTextSize', label: 'Set Text Size', category: 'Title' },
  { value: 'SetTextPosition', label: 'Set Text Position', category: 'Title' },
  { value: 'TitleBeginAnimation', label: 'Title Begin Animation', category: 'Title' },
  { value: 'TitleContinueAnimation', label: 'Title Continue Animation', category: 'Title' },
  { value: 'TitleEndAnimation', label: 'Title End Animation', category: 'Title' },

  // Position
  { value: 'SetPosition', label: 'Set Position', category: 'Position' },
  { value: 'SetZoom', label: 'Set Zoom', category: 'Position' },
  { value: 'SetPanX', label: 'Set Pan X', category: 'Position' },
  { value: 'SetPanY', label: 'Set Pan Y', category: 'Position' },
  { value: 'SetRotation', label: 'Set Rotation', category: 'Position' },

  // Recording
  { value: 'StartRecording', label: 'Start Recording', category: 'Recording' },
  { value: 'StopRecording', label: 'Stop Recording', category: 'Recording' },
  { value: 'RecordPause', label: 'Record Pause', category: 'Recording' },

  // Streaming
  { value: 'StartStreaming', label: 'Start Streaming', category: 'Streaming' },
  { value: 'StopStreaming', label: 'Stop Streaming', category: 'Streaming' },
  { value: 'StreamStartStop', label: 'Stream Start/Stop Toggle', category: 'Streaming' },

  // MultiView
  { value: 'SetMultiViewOverlay', label: 'Set MultiView Overlay', category: 'MultiView' },
  { value: 'SetMultiViewInput', label: 'Set MultiView Input', category: 'MultiView' },

  // External / Fullscreen
  { value: 'SetExternal', label: 'Set External', category: 'External' },
  { value: 'ExternalStartStop', label: 'External Start/Stop Toggle', category: 'External' },
  { value: 'FullscreenStartStop', label: 'Fullscreen Start/Stop Toggle', category: 'External' },

  // Browser / Web (placeholder comunes)
  { value: 'BrowserReload', label: 'Browser Reload', category: 'Browser' },
  { value: 'BrowserNavigate', label: 'Browser Navigate', category: 'Browser' },

  // List
  { value: 'ListNext', label: 'List Next', category: 'List' },
  { value: 'ListPrevious', label: 'List Previous', category: 'List' },
  { value: 'ListPlay', label: 'List Play', category: 'List' },

  // Call
  { value: 'CallAudioSource', label: 'Call Audio Source', category: 'Call' },
  { value: 'CallVideoSource', label: 'Call Video Source', category: 'Call' },
  { value: 'CallPassword', label: 'Call Password', category: 'Call' },
]

export const VMIX_CATEGORIES = Array.from(
  new Set(VMIX_ACTIONS_CATALOG.map(a => a.category))
).sort()


