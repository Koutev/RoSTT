# vMix Automation Dashboard

Un dashboard web completo para automatizar y controlar vMix usando la API oficial. Permite crear Run of Shows (RoS) con acciones automatizadas basadas en timing y condiciones lógicas.

## 🚀 Características

- **Conexión a vMix**: Conecta a una o más instancias de vMix via IP
- **Run of Show**: Crea y edita pasos de automatización con timing y condiciones
- **Acciones vMix**: Ejecuta comandos como Cut, Fade, Overlay, Play, etc.
- **Control de Ejecución**: Inicia, pausa, reanuda y detiene la automatización
- **Consola en Tiempo Real**: Monitorea todas las acciones ejecutadas
- **Interfaz Moderna**: UI limpia y responsiva con TailwindCSS y Shadcn/UI

## 📋 Requisitos

- Node.js 18+ 
- vMix con API habilitada
- Navegador web moderno

## 🛠️ Instalación

1. **Clona el repositorio**
   ```bash
   git clone <repository-url>
   cd vmix-automation-dashboard
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Ejecuta el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador**
   ```
   http://localhost:3000
   ```

## 🎯 Uso

### 1. Conexión a vMix

1. Asegúrate de que vMix esté ejecutándose con la API habilitada
2. En el panel de conexión, ingresa la IP y puerto de vMix (por defecto 8088)
3. Haz clic en "Conectar" para establecer la conexión
4. Usa "Probar" para verificar la conexión

### 2. Crear Run of Show

1. En el panel "Run of Show", agrega pasos con:
   - **Título**: Nombre descriptivo del paso
   - **Tiempo**: Tiempo de ejecución (HH:MM:SS)
   - **Condición**: Condición lógica opcional
   - **Descripción**: Descripción del paso
   - **Acciones**: Lista de acciones a ejecutar

2. Para cada acción, selecciona:
   - **Tipo**: Cut, Fade, Overlay, Play, etc.
   - **Target**: Input o elemento objetivo
   - **Value**: Valor opcional (volumen, texto, etc.)

### 3. Ejecutar Automatización

1. En el panel "Control de Ejecución":
   - Verifica que la conexión esté activa
   - Haz clic en "Iniciar Show" para comenzar
   - Usa "Pausar", "Reanudar" o "Detener" según necesites
   - "Siguiente" para avanzar manualmente

2. Monitorea el progreso en:
   - Barra de progreso
   - Paso actual mostrado
   - Consola de logs en tiempo real

## 🔧 Acciones Disponibles

- **Cut**: Cambio directo a un input
- **Fade**: Transición suave a un input
- **OverlayInput1In/Out**: Mostrar/ocultar overlay
- **PlayInput**: Reproducir un input
- **PauseInput**: Pausar un input
- **SetVolume**: Establecer volumen
- **SetText**: Establecer texto en un input

## 📚 API de vMix

Esta aplicación usa la API oficial de vMix. Para más información:
- [Documentación oficial](https://vmixapi.com/)
- [Lista completa de comandos](https://vmixapi.com/)

## 🏗️ Arquitectura

- **Frontend**: Next.js 14 + React + TypeScript
- **UI**: TailwindCSS + Shadcn/UI
- **Estado**: Zustand
- **HTTP**: Axios
- **Iconos**: Lucide React

## 📁 Estructura del Proyecto

```
src/
├── app/                 # App Router de Next.js
├── components/          # Componentes React
│   ├── ui/             # Componentes base de UI
│   ├── VMixConnection.tsx
│   ├── RunOfShowPanel.tsx
│   ├── ExecutionControl.tsx
│   └── ConsoleLog.tsx
├── services/           # Servicios y lógica de negocio
│   ├── vmix-api.ts
│   └── automation-engine.ts
├── store/              # Estado global (Zustand)
│   └── vmix-store.ts
└── styles/             # Estilos globales
```

## 🚀 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter de código

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación de la API de vMix
2. Verifica que vMix esté ejecutándose con la API habilitada
3. Comprueba la conectividad de red
4. Revisa la consola de logs en la aplicación

---

**Desarrollado con ❤️ para la comunidad de vMix**
