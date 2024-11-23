# Documentación de Cambios - Sistema de Gestión de PDFs y Validación Curricular

## 1. Estructura del Sistema

### 1.1 Componentes Principales
- **Servidor Express**: Maneja las peticiones HTTP y sirve archivos estáticos
- **Sistema de Subida de Archivos**: Gestiona la carga de PDFs
- **Agente Curricular**: Procesa y analiza contenido basado en los PDFs subidos
- **API de IA**: Integración con modelo LLama para análisis de contenido
- **Interfaz Streamlit**: Interfaz gráfica para interactuar con el sistema

### 1.2 Directorios Principales
```
/workspaces/LlamaLearn/
├── public/           # Archivos estáticos y frontend
├── src/             # Código fuente del backend
│   ├── agents/      # Agentes de procesamiento
│   ├── config/      # Configuraciones
│   ├── controllers/ # Controladores
│   ├── routes/      # Rutas de la API
│   └── services/    # Servicios
├── uploads/         # Almacenamiento de PDFs
├── streamlit_app.py # Interfaz de usuario Streamlit
└── run_services.sh  # Script para ejecutar todos los servicios
```

## 2. Cambios Implementados

### 2.1 Sistema de Subida de Archivos
- Implementación de multer para gestión de archivos
- Configuración de almacenamiento en carpeta 'uploads'
- Validación de tipos de archivo (solo PDF)
- Límite de tamaño de archivo (10MB)
- Nombres de archivo únicos usando timestamps

```javascript
// Configuración de multer en uploadRoutes.js
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});
```

### 2.2 Agente Curricular
- Integración con PDFs como base de conocimientos
- Carga automática de PDFs al iniciar
- Capacidad de recarga de base de conocimientos
- Análisis de contenido usando IA
- Formateo de respuestas para mejor legibilidad

### 2.3 Interfaz Streamlit
- Interfaz gráfica moderna y fácil de usar
- Tres secciones principales:
  1. Subida de PDFs
  2. Validación de Contenido
  3. Visualización de PDFs Disponibles
- Integración completa con el backend
- Visualización formateada de resultados

## 3. Dependencias

### 3.1 Backend (Node.js)
- `multer`: Manejo de subida de archivos
- `pdf-parse`: Extracción de texto de PDFs
- `express`: Framework web
- `axios`: Cliente HTTP para API de IA

### 3.2 Frontend (Streamlit)
- `streamlit`: Framework para la interfaz de usuario
- `requests`: Cliente HTTP para comunicación con backend
- `python-base64`: Manejo de archivos PDF en la interfaz

## 4. Uso del Sistema

### 4.1 Iniciar el Sistema
```bash
# Dar permisos de ejecución al script
chmod +x run_services.sh

# Iniciar todos los servicios
./run_services.sh
```

### 4.2 Acceso a las Interfaces
- **API Backend**: http://localhost:3000
- **Interfaz Streamlit**: http://localhost:8502

### 4.3 Funcionalidades Principales

#### Subida de PDFs
1. Acceder a la interfaz Streamlit
2. Seleccionar "Subir PDFs" en el menú lateral
3. Arrastrar o seleccionar archivos PDF
4. Los archivos se guardan automáticamente en la carpeta `uploads/`

#### Validación de Contenido
1. Seleccionar "Validar Contenido" en el menú
2. Ingresar el texto a validar
3. El sistema analizará el contenido contra la base de conocimientos
4. Se mostrará un análisis detallado con sugerencias

#### Visualización de PDFs
1. Seleccionar "Ver PDFs Disponibles"
2. Se mostrarán todos los PDFs subidos
3. Opción para descargar cada PDF

## 5. API Endpoints

#### Subida de Archivos
- `POST /api/upload`: Subida de PDFs
  - Soporta múltiples archivos
  - Validación de tipo y tamaño

#### Agente Curricular
- `POST /api/agent/validate`: Validación de contenido
- `POST /api/agent/reload-knowledge`: Recarga de base de conocimientos

## 6. Próximos Pasos y Mejoras Sugeridas
1. Mejorar el formateo de respuestas del agente
2. Implementar sistema de caché para PDFs procesados
3. Agregar validación más robusta de contenido de PDFs
4. Mejorar el manejo de errores y logging
5. Implementar sistema de autenticación
6. Optimizar el procesamiento de PDFs grandes
7. Mejorar la interfaz de usuario con más funcionalidades

## 7. Notas Importantes
- Los PDFs subidos se almacenan permanentemente en la carpeta `uploads/`
- El sistema requiere Node.js y Python con Streamlit instalado
- La API de IA debe estar configurada correctamente en `apiConfig.js`
- El servidor debe tener permisos de escritura en la carpeta `uploads/`
- Ambos servicios (Node.js y Streamlit) deben estar corriendo para el funcionamiento completo
