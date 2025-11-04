# Conexión vMix en Vercel

## Configuración Automática

El sistema detecta automáticamente si está ejecutándose en Vercel (HTTPS) y usa el proxy correspondiente:

- **HTTP (Local)**: Conexión directa a vMix
- **HTTPS (Vercel)**: Conexión via proxy `/api/vmix-proxy`

## Cómo Funciona

1. **Detección**: El sistema detecta `window.location.protocol === 'https:'`
2. **Proxy**: Si es HTTPS, usa `/api/vmix-proxy` automáticamente
3. **CORS**: El proxy resuelve problemas de CORS desde el servidor
4. **Timeout**: 10 segundos de timeout para conexiones lentas

## Archivos Clave

- `src/services/vmix-api.ts`: Cliente API con detección automática
- `src/app/api/vmix-proxy/route.ts`: Proxy para HTTPS/Vercel
- `src/components/VMixConnectionCompact.tsx`: Interfaz de conexión

## Uso

1. Abrir el botón vMix (esquina superior derecha)
2. Ingresar IP y puerto de vMix
3. Clic en "Conectar"
4. El sistema maneja automáticamente HTTP/HTTPS

## Mensajes de Estado

- **Local**: "Intentando conectar a 192.168.1.100:8088 (directa)..."
- **Vercel**: "Intentando conectar a 192.168.1.100:8088 (via proxy (Vercel))..."
- **Éxito**: "✅ Conectado exitosamente a vMix en 192.168.1.100:8088 via proxy"





