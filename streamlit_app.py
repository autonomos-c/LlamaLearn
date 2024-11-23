import streamlit as st
import requests
import os

st.title("Sistema de Validación Curricular")

# Opciones simples sin estilos adicionales
option = st.radio(
    "Seleccione una opción",
    ["Subir PDFs", "Validar Contenido", "Ver PDFs", "Google Classroom"]
)

if option == "Subir PDFs":
    uploaded_files = st.file_uploader("Seleccione archivos PDF", type=['pdf'], accept_multiple_files=True)
    if uploaded_files:
        for file in uploaded_files:
            with open(os.path.join('uploads', file.name), 'wb') as f:
                f.write(file.getbuffer())
            st.success(f"Archivo {file.name} subido")

elif option == "Google Classroom":
    try:
        # Verificar estado de autenticación
        auth_status = requests.get("http://localhost:3000/classroom/auth-status")
        if auth_status.ok and not auth_status.json().get('isAuthenticated'):
            # Si no está autenticado, mostrar botón de inicio de sesión
            if st.button("Conectar con Google Classroom"):
                try:
                    # Iniciar proceso de autenticación
                    init_response = requests.post("http://localhost:3000/classroom/init")
                    if init_response.ok:
                        auth_url = init_response.json().get('authUrl')
                        if auth_url:
                            # Redirigir a la URL de autenticación de Google
                            st.markdown(f'<meta http-equiv="refresh" content="0;url={auth_url}">', unsafe_allow_html=True)
                            st.write("Redirigiendo a Google...")
                        else:
                            st.error("Error al obtener URL de autenticación")
                except Exception as e:
                    st.error(f"Error al conectar con Google Classroom: {str(e)}")
        else:
            st.success("Conectado a Google Classroom")
            try:
                # Obtener lista de cursos
                courses = requests.get("http://localhost:3000/classroom/courses")
                if courses.ok:
                    course_list = courses.json().get('courses', [])
                    if course_list:
                        st.write("Cursos disponibles:")
                        for course in course_list:
                            st.write(f"- {course.get('name')}")
                    else:
                        st.info("No hay cursos disponibles")
            except Exception as e:
                st.error(f"Error al obtener cursos: {str(e)}")
    except Exception as e:
        st.error(f"Error de conexión: {str(e)}")

elif option == "Validar Contenido":
    if st.button("Validar"):
        try:
            response = requests.post("http://localhost:3000/ai/generate", 
                                  json={"prompt": "Analizar contenido"})
            if response.ok:
                st.write(response.json().get('content'))
            else:
                st.error("Error al validar contenido")
        except Exception as e:
            st.error(f"Error: {str(e)}")
