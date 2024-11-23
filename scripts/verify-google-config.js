require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verificando configuración de Google Cloud...\n');

// Verificar variables de entorno
const requiredEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI'
];

console.log('📋 Verificando variables de entorno...');
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Faltan las siguientes variables de entorno:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.log('\n💡 Asegúrate de crear un archivo .env basado en .env.example');
    process.exit(1);
} else {
    console.log('✅ Variables de entorno configuradas correctamente');
}

// Verificar directorio de credenciales
console.log('\n📋 Verificando estructura de directorios...');
const credentialsDir = path.join(__dirname, '../src/config/credentials');

if (!fs.existsSync(credentialsDir)) {
    console.error('❌ No se encuentra el directorio de credenciales');
    console.log(`   Crear: ${credentialsDir}`);
    process.exit(1);
}

// Verificar archivo de credenciales
const credentialsFile = path.join(credentialsDir, 'google-credentials.js');
console.log('\n📋 Verificando archivo de credenciales...');

if (!fs.existsSync(credentialsFile)) {
    console.error('❌ No se encuentra el archivo de credenciales');
    console.log(`   Crear: ${credentialsFile}`);
    console.log('\n💡 Sigue las instrucciones en google_cloud_setup.md');
    process.exit(1);
}

// Verificar permisos de directorios
console.log('\n📋 Verificando permisos de directorios...');
const uploadsDir = path.join(__dirname, '../uploads');

try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    // Intentar escribir un archivo de prueba
    const testFile = path.join(uploadsDir, '.test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Permisos de directorio correctos');
} catch (error) {
    console.error('❌ Error en permisos de directorio:', error.message);
    process.exit(1);
}

// Verificar dependencias
console.log('\n📋 Verificando dependencias...');
const requiredDependencies = [
    'express-session',
    'googleapis',
    'google-auth-library'
];

try {
    const packageJson = require('../package.json');
    const missingDeps = requiredDependencies.filter(dep => 
        !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
    );

    if (missingDeps.length > 0) {
        console.error('❌ Faltan las siguientes dependencias:');
        missingDeps.forEach(dep => {
            console.error(`   - ${dep}`);
        });
        console.log('\n💡 Ejecuta: npm install ' + missingDeps.join(' '));
        process.exit(1);
    }
    console.log('✅ Todas las dependencias están instaladas');
} catch (error) {
    console.error('❌ Error al verificar dependencias:', error.message);
    process.exit(1);
}

// Verificación completa
console.log('\n✨ Verificación completa exitosa!');
console.log('\n📝 Próximos pasos:');
console.log('1. Configura las credenciales de Google Cloud Console');
console.log('2. Inicia el servidor: npm start');
console.log('3. Accede a la aplicación: http://localhost:3000');
console.log('\n🚀 ¡Todo listo para comenzar!\n');
