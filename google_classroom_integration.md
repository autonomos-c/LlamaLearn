# Plan de Integración con Google Classroom

## 1. Configuración Inicial

### 1.1 Requisitos de Google Cloud
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Classroom API
3. Configurar credenciales OAuth 2.0
4. Configurar pantalla de consentimiento

### 1.2 Dependencias Necesarias
```bash
npm install googleapis google-auth-library
```

## 2. Estructura de Integración

### 2.1 Nuevo Módulo de Classroom
```javascript
// src/services/classroomService.js
const { google } = require('googleapis');
const classroom = google.classroom('v1');

class ClassroomService {
  constructor() {
    this.auth = null;
    this.classroom = classroom;
  }

  async initialize(credentials) {
    const { client_id, client_secret, redirect_uri } = credentials;
    this.auth = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uri
    );
  }

  async getCourses() {
    const response = await classroom.courses.list({
      auth: this.auth,
      pageSize: 10,
    });
    return response.data.courses;
  }

  async createMaterial(courseId, pdfUrl, title) {
    return await classroom.courses.courseWorkMaterials.create({
      auth: this.auth,
      courseId: courseId,
      requestBody: {
        title: title,
        description: 'Material curricular validado por IA',
        materials: [{
          driveFile: {
            driveFile: {
              id: pdfUrl
            }
          }
        }],
        state: 'PUBLISHED'
      }
    });
  }

  async createAssignment(courseId, content) {
    return await classroom.courses.courseWork.create({
      auth: this.auth,
      courseId: courseId,
      requestBody: {
        title: 'Actividad generada por IA',
        description: content,
        workType: 'ASSIGNMENT',
        state: 'PUBLISHED'
      }
    });
  }
}

module.exports = new ClassroomService();
```

### 2.2 Rutas de Integración
```javascript
// src/routes/classroomRoutes.js
const express = require('express');
const router = express.Router();
const classroomService = require('../services/classroomService');
const directorCurricularAgent = require('../agents/directorCurricularAgent');

router.get('/courses', async (req, res) => {
  try {
    const courses = await classroomService.getCourses();
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/material/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { pdfUrl, title } = req.body;
    
    // Validar contenido con el agente curricular
    const validationResult = await directorCurricularAgent.validateContent(title);
    
    // Crear material en Classroom
    const material = await classroomService.createMaterial(courseId, pdfUrl, title);
    
    res.json({ 
      material,
      validation: validationResult 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 2.3 Interfaz Streamlit Actualizada
```python
# Actualización de streamlit_app.py
import streamlit as st
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow

def setup_google_auth():
    # Configuración de autenticación de Google
    flow = Flow.from_client_secrets_file(
        'client_secrets.json',
        scopes=['https://www.googleapis.com/auth/classroom.courses.readonly',
                'https://www.googleapis.com/auth/classroom.coursework.students']
    )
    
    if 'credentials' not in st.session_state:
        auth_url, _ = flow.authorization_url()
        st.markdown(f"[Autorizar acceso a Google Classroom]({auth_url})")
        return None
    
    return Credentials(**st.session_state.credentials)

def main():
    st.title("Sistema de Validación Curricular con Google Classroom 📚")
    
    # Configurar autenticación
    creds = setup_google_auth()
    if not creds:
        return
    
    # Menú principal
    option = st.sidebar.selectbox(
        "Seleccione una opción",
        ["Subir PDFs", "Validar Contenido", "Ver PDFs", "Gestionar Classroom"]
    )
    
    if option == "Gestionar Classroom":
        st.header("Google Classroom")
        
        # Listar cursos
        courses = requests.get(
            "http://localhost:3000/api/classroom/courses",
            headers={"Authorization": f"Bearer {creds.token}"}
        ).json()
        
        selected_course = st.selectbox(
            "Seleccione un curso",
            [course['name'] for course in courses['courses']]
        )
        
        # Opciones de gestión
        action = st.radio(
            "¿Qué desea hacer?",
            ["Subir material", "Crear actividad", "Ver materiales"]
        )
        
        if action == "Subir material":
            uploaded_file = st.file_uploader("Seleccione un PDF", type=['pdf'])
            title = st.text_input("Título del material")
            
            if st.button("Publicar en Classroom"):
                if uploaded_file and title:
                    # Lógica para subir y publicar
                    st.success("Material publicado exitosamente")
```

## 3. Flujo de Trabajo Integrado

### 3.1 Proceso de Validación y Publicación
1. Usuario sube PDF al sistema
2. Sistema procesa y valida contenido
3. Usuario selecciona curso de Classroom
4. Sistema publica material validado
5. Se genera reporte de validación

### 3.2 Sincronización de Contenidos
1. PDFs subidos se sincronizan con Google Drive
2. Materiales publicados se enlazan al sistema
3. Retroalimentación se integra en ambas plataformas

## 4. Implementación Paso a Paso

### Fase 1: Configuración (1-2 días)
1. Configurar proyecto en Google Cloud
2. Implementar autenticación OAuth
3. Configurar permisos y alcances

### Fase 2: Backend (2-3 días)
1. Implementar ClassroomService
2. Crear rutas de integración
3. Configurar manejo de tokens

### Fase 3: Frontend (2-3 días)
1. Actualizar interfaz Streamlit
2. Implementar flujo de autenticación
3. Agregar funcionalidades de Classroom

### Fase 4: Integración (2-3 días)
1. Conectar validación con publicación
2. Implementar sincronización
3. Pruebas de integración

## 5. Consideraciones de Seguridad

1. Manejo seguro de tokens
2. Permisos granulares
3. Validación de usuarios
4. Encriptación de datos

## 6. Próximos Pasos

1. Obtener credenciales de Google Cloud
2. Implementar autenticación OAuth
3. Crear estructura base de servicios
4. Actualizar interfaz de usuario
5. Realizar pruebas de integración

## 7. Requisitos Técnicos

1. Proyecto en Google Cloud Console
2. Credenciales OAuth 2.0
3. Permisos de API de Classroom
4. Almacenamiento para tokens
5. HTTPS para redirecciones OAuth

La integración con Google Classroom agregará una capa de funcionalidad educativa robusta al sistema, permitiendo que el contenido validado se publique y gestione directamente en la plataforma educativa.
