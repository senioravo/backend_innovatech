// @ts-nocheck
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import express from 'express';
const router = express.Router();
import fs from 'fs';
import crypto from 'crypto';
/**
 * Endpoint JWKS (JSON Web Key Set) - RFC 7517
 * Sirve la clave PÚBLICA en formato JWK para que KrakenD valide tokens
 *
 * KrakenD consulta este endpoint para obtener la clave pública RSA
 * y verificar la firma de los tokens JWT
 */
/**
 * @openapi
 * /.well-known/jwks.json:
 *   get:
 *     tags: [JWKS]
 *     summary: Clave pública RSA en formato JWK para verificación de tokens
 *     responses:
 *       200:
 *         description: JWKS con clave pública
 */
router.get('/.well-known/jwks.json', (req, res) => {
    try {
        // Leer clave pública RSA
        const publicKeyPath = path.join(__dirname, '..', '..', 'keys', 'public.key');
        const publicKeyPEM = fs.readFileSync(publicKeyPath, 'utf8');
        // Convertir PEM a JWK (JSON Web Key)
        const publicKey = crypto.createPublicKey(publicKeyPEM);
        const jwk = publicKey.export({ format: 'jwk' });
        // Agregar metadata requerida para JWKS
        const jwks = {
            keys: [
                {
                    ...jwk,
                    alg: 'RS256',
                    use: 'sig',
                    kid: 'innovatech-auth-key-1'
                }
            ]
        };
        console.log('[JWKS] Clave pública servida a cliente:', req.ip);
        res.json(jwks);
    }
    catch (error) {
        console.error('[JWKS] Error al generar JWKS:', error);
        res.status(500).json({
            error: 'Failed to generate JWKS',
            message: 'Could not read or convert public key'
        });
    }
});
export default router;
