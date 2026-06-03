// AS-TASK-17: Tests de encriptación de contraseñas con bcrypt
// Framework: Jest
// Objetivo: Validar hash y comparación de contraseñas

const bcrypt = require('bcrypt');

describe('AS-TASK-17: Bcrypt - Encriptación de contraseñas', () => {
  const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
  const testPassword = 'SecurePass123!';

  describe('bcrypt.hash() - Encriptación de contraseñas', () => {
    
    it('Debería generar un hash válido desde una contraseña', async () => {
      const hash = await bcrypt.hash(testPassword, SALT_ROUNDS);

      // Validar que el hash existe y tiene formato correcto
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
      
      // Hash bcrypt siempre empieza con $2a$, $2b$ o $2y$
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('Debería incluir el número de salt rounds en el hash', async () => {
      const hash = await bcrypt.hash(testPassword, SALT_ROUNDS);
      
      // El formato bcrypt incluye: $2b$rounds$salt+hash
      // Extraer rounds del hash
      const hashParts = hash.split('$');
      const rounds = parseInt(hashParts[2]);
      
      expect(rounds).toBe(SALT_ROUNDS);
    });

    it('Debería generar hashes diferentes para la misma contraseña (por salt único)', async () => {
      const hash1 = await bcrypt.hash(testPassword, SALT_ROUNDS);
      const hash2 = await bcrypt.hash(testPassword, SALT_ROUNDS);

      // Los hashes deben ser diferentes debido al salt aleatorio
      expect(hash1).not.toBe(hash2);
      
      // Pero ambos deben ser válidos para la misma password
      const isValid1 = await bcrypt.compare(testPassword, hash1);
      const isValid2 = await bcrypt.compare(testPassword, hash2);
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });

    it('Debería generar hash de longitud consistente (~60 caracteres)', async () => {
      const hash = await bcrypt.hash(testPassword, SALT_ROUNDS);
      
      // Hash bcrypt siempre tiene 60 caracteres
      expect(hash.length).toBe(60);
    });

    it('Debería manejar contraseñas con caracteres especiales', async () => {
      const specialPassword = 'P@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await bcrypt.hash(specialPassword, SALT_ROUNDS);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(60);
      
      // Verificar que el hash es válido
      const isValid = await bcrypt.compare(specialPassword, hash);
      expect(isValid).toBe(true);
    });

    it('Debería manejar contraseñas muy largas (hasta 72 bytes)', async () => {
      // Bcrypt tiene límite de 72 bytes (caracteres ASCII)
      const longPassword = 'A'.repeat(72);
      const hash = await bcrypt.hash(longPassword, SALT_ROUNDS);

      expect(hash).toBeDefined();
      
      const isValid = await bcrypt.compare(longPassword, hash);
      expect(isValid).toBe(true);
    });

  });

  describe('bcrypt.compare() - Verificación de contraseñas', () => {

    let hashedPassword;

    beforeAll(async () => {
      // Crear hash una vez para todos los tests de verificación
      hashedPassword = await bcrypt.hash(testPassword, SALT_ROUNDS);
    });

    it('Debería retornar true cuando la contraseña coincide con el hash', async () => {
      const isValid = await bcrypt.compare(testPassword, hashedPassword);
      
      expect(isValid).toBe(true);
    });

    it('Debería retornar false cuando la contraseña NO coincide', async () => {
      const wrongPassword = 'WrongPassword123!';
      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
      
      expect(isValid).toBe(false);
    });

    it('Debería ser case-sensitive (diferencia mayúsculas/minúsculas)', async () => {
      const lowercasePassword = testPassword.toLowerCase();
      const isValid = await bcrypt.compare(lowercasePassword, hashedPassword);
      
      expect(isValid).toBe(false);
    });

    it('Debería retornar false con contraseña vacía', async () => {
      const isValid = await bcrypt.compare('', hashedPassword);
      
      expect(isValid).toBe(false);
    });

    it('Debería retornar false con contraseña muy similar pero incorrecta', async () => {
      // Cambiar solo un carácter
      const similarPassword = 'SecurePass123?'; // ! → ?
      const isValid = await bcrypt.compare(similarPassword, hashedPassword);
      
      expect(isValid).toBe(false);
    });

    it('Debería rechazar hash inválido o malformado', async () => {
      const invalidHash = 'invalid-hash-format';
      
      // bcrypt.compare debería lanzar error con hash inválido
      await expect(
        bcrypt.compare(testPassword, invalidHash)
      ).rejects.toThrow();
    });

  });

  describe('Seguridad - Mejores prácticas', () => {

    it('Salt rounds debería ser mayor o igual a 10 para seguridad', () => {
      // Valor recomendado: 10-12 rounds para balance seguridad/performance
      expect(SALT_ROUNDS).toBeGreaterThanOrEqual(10);
      expect(SALT_ROUNDS).toBeLessThanOrEqual(15); // Máximo razonable para no afectar performance
    });

    it('Mismo password con diferente salt genera hashes totalmente diferentes', async () => {
      const hash1 = await bcrypt.hash(testPassword, SALT_ROUNDS);
      const hash2 = await bcrypt.hash(testPassword, SALT_ROUNDS);

      // No debe haber partes comunes significativas (excepto prefijo $2b$rounds)
      expect(hash1.substring(7)).not.toBe(hash2.substring(7));
    });

    it('Hash no debe contener la contraseña original en texto plano', async () => {
      const hash = await bcrypt.hash(testPassword, SALT_ROUNDS);
      
      // El hash no debe incluir la contraseña original
      expect(hash).not.toContain(testPassword);
      expect(hash.toLowerCase()).not.toContain(testPassword.toLowerCase());
    });

  });

  describe('Integración con aplicación (UserService)', () => {

    it('Debería simular flujo completo: registro → hash → login → compare', async () => {
      // Simular registro de usuario
      const userPassword = 'NewUser2024!';
      const hashedPassword = await bcrypt.hash(userPassword, SALT_ROUNDS);

      // Simular login: usuario ingresa password correcta
      const loginAttempt = 'NewUser2024!';
      const isValidLogin = await bcrypt.compare(loginAttempt, hashedPassword);
      expect(isValidLogin).toBe(true);

      // Simular login fallido: password incorrecta
      const wrongAttempt = 'NewUser2024?';
      const isInvalidLogin = await bcrypt.compare(wrongAttempt, hashedPassword);
      expect(isInvalidLogin).toBe(false);
    });

    it('Debería usar salt rounds configurado en variable de entorno', () => {
      // Verificar que SALT_ROUNDS viene de process.env (configurado en tests/setup.js)
      expect(process.env.BCRYPT_SALT_ROUNDS).toBeDefined();
      expect(SALT_ROUNDS).toBe(10); // Valor en tests/setup.js
    });

  });

  describe('Performance y límites', () => {

    it('Hash debería completarse en tiempo razonable (< 500ms con 10 rounds)', async () => {
      const startTime = Date.now();
      await bcrypt.hash(testPassword, SALT_ROUNDS);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      // Con 10 rounds, debería ser rápido (< 500ms)
      expect(duration).toBeLessThan(500);
    });

    it('Compare debería ser rápido (< 100ms)', async () => {
      const hash = await bcrypt.hash(testPassword, SALT_ROUNDS);
      
      const startTime = Date.now();
      await bcrypt.compare(testPassword, hash);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      // Compare es más rápido que hash
      expect(duration).toBeLessThan(100);
    });

  });

});
