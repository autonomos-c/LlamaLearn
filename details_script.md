# Documentación de Cambios - Sistema de Gestión de PDFs y Validación Curricular

## 1. Estructura del Sistema

### 1.1 Componentes Principales
- **Servidor Express**: Maneja las peticiones HTTP y sirve archivos estáticos
- **Sistema de Subida de Archivos**: Gestiona la carga de PDFs
- **Agente Curricular**: Procesa y analiza contenido basado en los PDFs subidos
- **API de IA**: Integración con modelo LLama para análisis de contenido

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
└── uploads/         # Almacenamiento de PDFs
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

```javascript
// Ejemplo de carga de PDFs en directorCurricularAgent.js
async loadAllPdfs() {
  const files = await fs.readdir(this.pdfCacheDir);
  const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
  const contents = await Promise.all(
    pdfFiles.map(async file => {
      const filePath = path.join(this.pdfCacheDir, file);
      const content = await this.loadPdfContent(filePath);
      return `[${file}]: ${content}`;
    })
  );
  this.knowledgeBase = contents.join('\n\n');
}
```

### 2.3 API Endpoints

#### Subida de Archivos
- `POST /api/upload`: Subida de PDFs
  - Soporta múltiples archivos
  - Validación de tipo y tamaño
  - Respuesta con detalles de archivos subidos

#### Agente Curricular
- `POST /api/agent/validate`: Validación de contenido
  - Análisis basado en PDFs cargados
  - Respuesta estructurada con análisis detallado
- `POST /api/agent/reload-knowledge`: Recarga de base de conocimientos
  - Actualización dinámica sin reinicio del servidor

## 3. Dependencias Agregadas
- `multer`: Manejo de subida de archivos
- `pdf-parse`: Extracción de texto de PDFs
- Otras dependencias existentes:
  - `express`: Framework web
  - `axios`: Cliente HTTP para API de IA

## 4. Uso del Sistema

### 4.1 Subida de Archivos
1. Acceder a la interfaz web en `http://localhost:3000`
2. Seleccionar archivos PDF
3. Los archivos se guardan en la carpeta `uploads/`

### 4.2 Validación de Contenido
```bash
# Ejemplo de uso de la API
curl -X POST http://localhost:3000/api/agent/validate \
  -H "Content-Type: application/json" \
  -d '{"content": "Los alumnos deben aprender sobre la importancia de la lectura comprensiva"}'
```

### 4.3 Recarga de Base de Conocimientos
```bash
# Actualizar base de conocimientos
curl -X POST http://localhost:3000/api/agent/reload-knowledge
```

## 5. Próximos Pasos y Mejoras Sugeridas
1. Mejorar el formateo de respuestas del agente
2. Implementar sistema de caché para PDFs procesados
3. Agregar validación más robusta de contenido de PDFs
4. Mejorar el manejo de errores y logging
5. Implementar sistema de autenticación
6. Optimizar el procesamiento de PDFs grandes

## 6. Notas Importantes
- Los PDFs subidos se almacenan permanentemente en la carpeta `uploads/`
- El sistema requiere Node.js y las dependencias instaladas
- La API de IA debe estar configurada correctamente en `apiConfig.js`
- El servidor debe tener permisos de escritura en la carpeta `uploads/`
