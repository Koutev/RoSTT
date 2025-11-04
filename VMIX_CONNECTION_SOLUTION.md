# Solución para Conexión vMix desde Vercel

## 🚀 Solución Recomendada: ngrok

El problema es que Vercel (en internet) no puede conectarse directamente a tu red local. **ngrok** crea un túnel seguro que permite que Vercel acceda a tu vMix.

### 📋 Pasos para Configurar ngrok

1. **Descargar ngrok**:
   - Ve a https://ngrok.com/
   - Crea una cuenta gratuita
   - Descarga ngrok para Windows

2. **Instalar ngrok**:
   ```bash
   # Extrae ngrok.exe en una carpeta (ej: C:\ngrok\)
   ```

3. **Configurar ngrok**:
   ```bash
   # En la carpeta donde está ngrok.exe
   ngrok config add-authtoken TU_TOKEN_AQUI
   ```

4. **Crear túnel para vMix**:
   ```bash
   # Esto expone tu vMix al internet
   ngrok http 8088
   ```

5. **Usar la URL de ngrok**:
   - ngrok te dará una URL como: `https://abc123.ngrok.io`
   - En la aplicación web, usa esta URL como "IP"
   - Puerto: `80` (por defecto de ngrok)

### 🔄 Flujo de Conexión con ngrok

```
Tu PC: vMix (localhost:8088)
    ↓
ngrok: https://abc123.ngrok.io → localhost:8088
    ↓
Internet
    ↓
Vercel: https://rostt.vercel.app/
    ↓
Proxy: /api/vmix-proxy
    ↓
ngrok: https://abc123.ngrok.io
    ↓
Tu PC: vMix (localhost:8088)
```

## 🎯 Alternativa: Port Forwarding

Si prefieres no usar ngrok, puedes configurar port forwarding en tu router:

1. **Accede a tu router** (192.168.1.1 o similar)
2. **Configura port forwarding**:
   - Puerto externo: 8088
   - IP interna: Tu IP local (ej: 192.168.1.100)
   - Puerto interno: 8088
3. **Usa tu IP pública** en la aplicación

## ⚡ Solución Rápida: Usar la App Localmente

Si quieres probar inmediatamente sin configuración:

1. **Ejecuta la app localmente**:
   ```bash
   npm run dev
   ```

2. **Accede a**: http://localhost:3002

3. **Usa tu IP local** (192.168.1.100:8088)

4. **Funcionará perfectamente** porque estás en la misma red

## 🔧 Configuración de vMix

Asegúrate de que vMix esté configurado:

1. **Abrir vMix**
2. **Settings → Web Controller**
3. **✅ Enable Web Controller**
4. **Puerto: 8088**
5. **✅ Allow external connections** (si está disponible)

## 📱 Prueba Rápida

Para verificar que vMix funciona:

```bash
# Desde tu PC (debería funcionar)
curl http://localhost:8088/api

# Desde otra PC en la misma red
curl http://TU_IP_LOCAL:8088/api
```

Si estos comandos funcionan, entonces vMix está bien configurado y el problema es solo la conectividad desde internet.





