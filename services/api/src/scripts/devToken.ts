import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { DEMO_USER } from '../container';

/**
 * Gera um access token de DESENVOLVIMENTO para o usuário de demonstração.
 *
 *   npm run token:dev --workspace services/api
 *
 * Nunca use em produção: o token é assinado com o JWT_SECRET local e o usuário
 * de demonstração não existe fora de desenvolvimento.
 */
if (env.isProduction) {
  console.error('Recusado: este script não pode ser executado com NODE_ENV=production.');
  process.exit(1);
}

const token = jwt.sign({ sub: DEMO_USER.id, roles: ['user'] }, env.JWT_SECRET, {
  issuer: env.JWT_ISSUER,
  expiresIn: '12h',
});

console.log('\nUsuário de demonstração:', DEMO_USER.id, `(${DEMO_USER.displayName})`);
console.log('\nExporte o token e use nas chamadas:\n');
console.log(`export JWT="${token}"\n`);
console.log('Exemplo:');
console.log(
  `curl -s -X POST "http://localhost:${env.PORT}/api/v1/panic" \\\n` +
    '  -H "Authorization: Bearer $JWT" \\\n' +
    '  -H "Content-Type: application/json" \\\n' +
    `  -d '{"message":"Preciso de ajuda","triggerType":"tap"}'\n`,
);
