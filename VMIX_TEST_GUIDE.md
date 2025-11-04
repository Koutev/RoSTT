# Prueba de Conexión vMix - Formato Oficial

## 🧪 Comandos de Prueba

### 1. Prueba Básica de Conexión
```bash
# Desde tu PC (debería funcionar)
curl "http://localhost:8088/api/"

# Desde otra PC en la misma red
curl "http://TU_IP_LOCAL:8088/api/"
```

### 2. Prueba con Función Específica
```bash
# Ejemplo: Transición Fade
curl "http://localhost:8088/api/?Function=Fade&Duration=1000"

# Ejemplo: Cambiar Input
curl "http://localhost:8088/api/?Function=Cut&Input=1"
```

### 3. Prueba desde la Aplicación Web

**Configuración Local:**
- IP: `localhost` o `127.0.0.1`
- Puerto: `8088`

**Configuración con ngrok:**
- IP: `abc123.ngrok.io` (la URL que te dé ngrok)
- Puerto: `80`

## 🔧 Configuración de vMix

1. **Abrir vMix**
2. **Settings → Web Controller**
3. **✅ Enable Web Controller**
4. **Puerto: 8088**
5. **✅ Allow external connections** (si está disponible)

## 📋 Formato Correcto según Documentación

Según la [documentación oficial de vMix](https://www.vmix.com/help25/index.htm?DeveloperAPI.html):

### URL Base
```
http://IP:PORT/api/
```

### Parámetros Principales
- **Function**: Función a ejecutar (ej: `Fade`, `Cut`, `PlayInput`)
- **Duration**: Tiempo en milisegundos para transiciones
- **Input**: Entrada por número, nombre o GUID
- **Value**: Valor específico (texto, volumen, etc.)

### Ejemplos de Comandos
```
# Transición Fade de 1 segundo
http://localhost:8088/api/?Function=Fade&Duration=1000

# Cut al input 1
http://localhost:8088/api/?Function=Cut&Input=1

# Reproducir input 2
http://localhost:8088/api/?Function=PlayInput&Input=2

# Cambiar volumen del input 3 a 50%
http://localhost:8088/api/?Function=SetVolume&Input=3&Value=50
```

## 🚀 Solución para Vercel

### Opción 1: ngrok (Recomendado)
1. **Descargar ngrok**: https://ngrok.com/
2. **Instalar**: Extrae `ngrok.exe`
3. **Configurar**: `ngrok config add-authtoken TU_TOKEN`
4. **Ejecutar**: `ngrok http 8088`
5. **Usar URL**: En la app web, usa la URL de ngrok como "IP"

### Opción 2: App Local
1. **Ejecutar**: `npm run dev`
2. **Acceder**: http://localhost:3002
3. **Usar IP local**: Tu IP local + puerto 8088

## ✅ Verificación

Si la conexión funciona, deberías ver:
- **Respuesta XML** de vMix con el estado actual
- **Logs exitosos** en la consola
- **Estado "Conectado"** en la interfaz

Si no funciona, verifica:
- ✅ vMix está ejecutándose
- ✅ Web Controller está habilitado
- ✅ Puerto 8088 está abierto
- ✅ No hay firewall bloqueando
- ✅ IP y puerto son correctos





