// Test básico de bcrypt
import bcrypt from 'bcrypt';

describe('Bcrypt - Hash de contraseñas', () => {
  
  it('Debería generar un hash válido', async () => {
    const password = 'MiPassword123!';
    const hash = await bcrypt.hash(password, 10);
    
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password);
  });

  it('Debería comparar correctamente password y hash', async () => {
    const password = 'MiPassword123!';
    const hash = await bcrypt.hash(password, 10);
    
    const esValido = await bcrypt.compare(password, hash);
    expect(esValido).toBe(true);
  });

  it('Debería rechazar password incorrecta', async () => {
    const password = 'MiPassword123!';
    const hash = await bcrypt.hash(password, 10);
    
    const esValido = await bcrypt.compare('PasswordIncorrecta', hash);
    expect(esValido).toBe(false);
  });

});
