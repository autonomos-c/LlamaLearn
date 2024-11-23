#!/bin/bash

# Función para limpiar procesos al salir
cleanup() {
    echo "Deteniendo servicios..."
    kill $NODE_PID 2>/dev/null
    kill $STREAMLIT_PID 2>/dev/null
    exit 0
}

# Configurar trap para SIGINT (Ctrl+C)
trap cleanup SIGINT

# Verificar configuración
echo "Verificando configuración..."
node scripts/verify-google-config.js
if [ $? -ne 0 ]; then
    echo "Error en la verificación. Por favor, revisa la configuración."
    exit 1
fi

# Iniciar el servidor Node.js
echo "Iniciando servidor Node.js..."
node src/app.js &
NODE_PID=$!

# Esperar a que el servidor Node.js esté listo
sleep 2

# Verificar si el servidor Node.js está corriendo
if ! kill -0 $NODE_PID 2>/dev/null; then
    echo "Error: El servidor Node.js no pudo iniciarse"
    cleanup
    exit 1
fi

# Iniciar Streamlit
echo "Iniciando interfaz Streamlit..."
streamlit run streamlit_app.py &
STREAMLIT_PID=$!

# Esperar a que Streamlit esté listo
sleep 5

# Verificar si Streamlit está corriendo
if ! kill -0 $STREAMLIT_PID 2>/dev/null; then
    echo "Error: Streamlit no pudo iniciarse"
    cleanup
    exit 1
fi

echo "🚀 Servicios iniciados correctamente!"
echo "📝 Accede a:"
echo "   - Backend: http://localhost:3000"
echo "   - Interfaz: http://localhost:8502"

# Mantener el script corriendo
wait
