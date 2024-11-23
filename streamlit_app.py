import streamlit as st
import requests
import json
import os
import base64

st.set_page_config(
    page_title="Sistema de Validación Curricular",
    page_icon="📚",
    layout="wide"
)

def get_pdf_download_link(file_path):
    with open(file_path, "rb") as f:
        bytes = f.read()
        b64 = base64.b64encode(bytes).decode()
        filename = os.path.basename(file_path)
        return f'<a href="data:application/pdf;base64,{b64}" download="{filename}">Descargar {filename}</a>'

def main():
    st.title("Sistema de Validación Curricular 📚")
    
    # Sidebar
    st.sidebar.header("Opciones")
    option = st.sidebar.selectbox(
        "Seleccione una opción",
        ["Subir PDFs", "Validar Contenido", "Ver PDFs Disponibles"]
    )

    if option == "Subir PDFs":
        st.header("Subir Archivos PDF")
        uploaded_files = st.file_uploader("Seleccione los archivos PDF", type=['pdf'], accept_multiple_files=True)
        
        if uploaded_files:
            for uploaded_file in uploaded_files:
                files = {'pdfs': uploaded_file}
                try:
                    response = requests.post('http://localhost:3000/api/upload', files=files)
                    if response.status_code == 200:
                        st.success(f"Archivo {uploaded_file.name} subido exitosamente!")
                    else:
                        st.error(f"Error al subir {uploaded_file.name}: {response.json().get('message', 'Error desconocido')}")
                except Exception as e:
                    st.error(f"Error de conexión: {str(e)}")

    elif option == "Validar Contenido":
        st.header("Validar Contenido")
        content = st.text_area("Ingrese el contenido a validar", height=150)
        
        if st.button("Validar"):
            if content:
                try:
                    response = requests.post(
                        'http://localhost:3000/api/agent/validate',
                        json={"content": content}
                    )
                    if response.status_code == 200:
                        result = response.json()
                        if not result.get('error'):
                            analisis = result['resultado']['analisis']
                            
                            st.subheader("Análisis de Alineación Curricular")
                            st.write(analisis['alineacionCurricular'])
                            
                            st.subheader("Aspectos Específicos")
                            st.write(analisis['aspectosEspecificos'])
                            
                            st.subheader("Sugerencias")
                            if analisis['sugerencias']['mejoras']:
                                st.write("Mejoras Generales:")
                                for mejora in analisis['sugerencias']['mejoras']:
                                    st.write(f"• {mejora}")
                            
                            if analisis['sugerencias']['educacionFinanciera']:
                                st.write("Sugerencias para Educación Financiera:")
                                for sug in analisis['sugerencias']['educacionFinanciera']:
                                    st.write(f"• {sug}")
                        else:
                            st.error("Error en la validación")
                    else:
                        st.error("Error en la solicitud")
                except Exception as e:
                    st.error(f"Error de conexión: {str(e)}")
            else:
                st.warning("Por favor, ingrese contenido para validar")

    elif option == "Ver PDFs Disponibles":
        st.header("PDFs Disponibles")
        uploads_dir = 'uploads'
        if os.path.exists(uploads_dir):
            pdf_files = [f for f in os.listdir(uploads_dir) if f.endswith('.pdf')]
            if pdf_files:
                for pdf in pdf_files:
                    pdf_path = os.path.join(uploads_dir, pdf)
                    st.markdown(get_pdf_download_link(pdf_path), unsafe_allow_html=True)
            else:
                st.info("No hay archivos PDF disponibles")
        else:
            st.error("Directorio de uploads no encontrado")

if __name__ == "__main__":
    main()
