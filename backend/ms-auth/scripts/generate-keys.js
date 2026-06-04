/**
 * Script para generar par de claves RSA para JWT
 * Genera:
 * - private.key: Clave privada (solo en ms-auth para FIRMAR tokens)
 * - public.key: Clave pública (compartida con BFF para VERIFICAR tokens)
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const keysDir = path.join(__dirname, '..', 'keys');

// Crear directorio si no existe
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

console.log('🔐 Generando par de claves RSA para JWT...\n');

// Generar par de claves RSA (2048 bits)
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Guardar clave privada
const privateKeyPath = path.join(keysDir, 'private.key');
fs.writeFileSync(privateKeyPath, privateKey);
console.log(`✅ Clave privada generada: ${privateKeyPath}`);
console.log('   → Usar en ms-auth para FIRMAR tokens\n');

// Guardar clave pública
const publicKeyPath = path.join(keysDir, 'public.key');
fs.writeFileSync(publicKeyPath, publicKey);
console.log(`✅ Clave pública generada: ${publicKeyPath}`);
console.log('   → Copiar a BFF para VERIFICAR tokens\n');

console.log('⚠️  IMPORTANTE:');
console.log('   1. La clave PRIVADA debe mantenerse segura (solo en ms-auth)');
console.log('   2. La clave PÚBLICA se puede compartir (copiar a BFF)');
console.log('   3. Agregar keys/*.key al .gitignore\n');

console.log('📋 Próximos pasos:');
console.log('   1. Copiar public.key a backend/bff/keys/public.key');
console.log('   2. Agregar keys/*.key a .gitignore');
console.log('   3. Actualizar código para usar RS256 en vez de HS256');
