const { execSync } = require('child_process');

const PORT = process.env.PORT || 3001;

function killPort() {
  try {
    console.log(`🔍 Verificando puerto ${PORT}...`);
    
    // Comando para encontrar el proceso en el puerto
    const findCommand = process.platform === 'win32'
      ? `netstat -ano | findstr :${PORT}`
      : `lsof -ti:${PORT}`;
    
    try {
      const result = execSync(findCommand, { encoding: 'utf8' });
      
      if (result) {
        // En Windows, extraer el PID de la salida de netstat
        if (process.platform === 'win32') {
          const lines = result.split('\n').filter(line => line.includes('LISTENING'));
          
          if (lines.length > 0) {
            const pid = lines[0].trim().split(/\s+/).pop();
            console.log(`⚠️  Puerto ${PORT} en uso por proceso PID ${pid}`);
            console.log(`🔨 Matando proceso ${pid}...`);
            
            execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf8' });
            console.log(`✅ Proceso ${pid} terminado exitosamente`);
          }
        } else {
          // En Linux/Mac, lsof devuelve directamente el PID
          const pid = result.trim();
          console.log(`⚠️  Puerto ${PORT} en uso por proceso PID ${pid}`);
          console.log(`🔨 Matando proceso ${pid}...`);
          
          execSync(`kill -9 ${pid}`, { encoding: 'utf8' });
          console.log(`✅ Proceso ${pid} terminado exitosamente`);
        }
        
        // Esperar un momento para que el puerto se libere
        console.log('⏳ Esperando que el puerto se libere...');
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        return sleep(1000);
      } else {
        console.log(`✅ Puerto ${PORT} está libre`);
      }
    } catch (error) {
      // No hay proceso en el puerto, está libre
      console.log(`✅ Puerto ${PORT} está libre`);
    }
  } catch (error) {
    console.error('❌ Error al verificar/liberar el puerto:', error.message);
    process.exit(1);
  }
}

// Ejecutar y retornar una promesa
killPort().then(() => {
  console.log('✨ Puerto listo para usar\n');
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
