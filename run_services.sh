#!/bin/bash

# Iniciar el servidor Node.js en segundo plano
echo "Iniciando servidor Node.js..."
node src/app.js &
NODE_PID=$!

# Esperar un momento para asegurarse de que el servidor Node.js esté funcionando
sleep 2

# Iniciar Streamlit
echo "Iniciando interfaz Streamlit..."
streamlit run streamlit_app.py

# Cuando Streamlit se detenga, también detener el servidor Node.js
kill $NODE_PID
