# Configuración de Google Cloud para Integración con Classroom

## 1. Crear Proyecto en Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Hacer clic en "Seleccionar proyecto" en la barra superior
3. Clic en "Nuevo proyecto"
4. Nombre del proyecto: "LlamaLearn-Classroom"
5. Crear proyecto

## 2. Habilitar APIs Necesarias

1. En el menú lateral, ir a "APIs y servicios" > "Biblioteca"
2. Buscar y habilitar las siguientes APIs:
   - Google Classroom API
   - Google Drive API (necesaria para manejo de archivos)
   - Google Sheets API (opcional, para exportar datos)

## 3. Configurar Pantalla de Consentimiento

1. Ir a "APIs y servicios" > "Pantalla de consentimiento de OAuth"
2. Seleccionar "Externo" como tipo de usuario
3. Completar información requerida:
   - Nombre de la app: "LlamaLearn"
   - Correo de soporte
   - Logo de la app (opcional)
   - Dominio de la app
4. En "Permisos", agregar los siguientes scopes:
   ```
   https://www.googleapis.com/auth/classroom.courses
   https://www.googleapis.com/auth/classroom.coursework.students
   https://www.googleapis.com/auth/classroom.rosters
   https://www.googleapis.com/auth/drive.file
   ```

## 4. Crear Credenciales OAuth

1. Ir a "APIs y servicios" > "Credenciales"
2. Clic en "Crear credenciales" > "ID de cliente de OAuth"
3. Seleccionar "Aplicación web"
4. Configurar:
   - Nombre: "LlamaLearn Web Client"
   - Orígenes autorizados de JavaScript:
     ```
     http://localhost:3000
     http://localhost:8502
     ```
   - URIs de redirección autorizados:
     ```
     http://localhost:3000/auth/google/callback
     http://localhost:8502/auth/google/callback
     ```

## 5. Guardar Credenciales

1. Descargar el archivo JSON de credenciales
2. Crear archivo de configuración en el proyecto:

```bash
mkdir -p src/config/credentials
```

3. Crear archivo para credenciales (NO subir a git):

```javascript
// src/config/credentials/google-credentials.js
module.exports = {
    web: {
        client_id: "TU_CLIENT_ID",
        project_id: "TU_PROJECT_ID",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "TU_CLIENT_SECRET",
        redirect_uris: [
            "http://localhost:3000/auth/google/callback",
            "http://localhost:8502/auth/google/callback"
        ],
        javascript_origins: [
            "http://localhost:3000",
            "http://localhost:8502"
        ]
    }
};
```

## 6. Configurar Variables de Entorno

1. Crear archivo .env:

```bash
# .env
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

## 7. Actualizar .gitignore

```bash
# .gitignore
src/config/credentials/
.env
```

## 8. Verificación de Configuración

1. Crear script de verificación:

```javascript
// scripts/verify-google-config.js
require('dotenv').config();
const credentials = require('../src/config/credentials/google-credentials');

console.log('Verificando configuración de Google Cloud...');

const requiredEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('Faltan las siguientes variables de entorno:', missingVars);
    process.exit(1);
}

if (!credentials.web) {
    console.error('Archivo de credenciales no encontrado o inválido');
    process.exit(1);
}

console.log('Configuración correcta!');
```

## 9. Próximos Pasos

1. Ejecutar verificación de configuración:
```bash
node scripts/verify-google-config.js
```

2. Si la verificación es exitosa, proceder con la implementación del servicio de Classroom

## 10. Notas Importantes

1. **Seguridad**:
   - Nunca compartir credenciales
   - No subir archivos de credenciales a git
   - Usar variables de entorno en producción

2. **Desarrollo**:
   - Usar cuentas de prueba para desarrollo
   - Mantener scopes mínimos necesarios
   - Documentar cambios en configuración

3. **Producción**:
   - Actualizar URIs para producción
   - Configurar dominios verificados
   - Implementar manejo seguro de tokens

## 11. Solución de Problemas

1. **Error de Credenciales**:
   - Verificar que el archivo JSON está correctamente formateado
   - Confirmar que las URIs coinciden exactamente

2. **Error de Permisos**:
   - Verificar que las APIs están habilitadas
   - Confirmar que los scopes son correctos
   - Revisar la configuración de la pantalla de consentimiento

3. **Error de Redirección**:
   - Verificar que las URIs de redirección están correctamente configuradas
   - Confirmar que el servidor está corriendo en el puerto correcto

Una vez completada esta configuración, podremos proceder con la implementación del servicio de Classroom en nuestro sistema.
