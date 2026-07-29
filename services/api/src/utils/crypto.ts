import { createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';

/** Identificador opaco para eventos, contatos e notificações. */
export function newId(prefix?: string): string {
  const uuid = randomUUID();
  return prefix ? `${prefix}_${uuid}` : uuid;
}

/** Token aleatório url-safe (ex.: verificationToken). */
export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString('base64url');
}

/** Código numérico de verificação com N dígitos, gerado por CSPRNG. */
export function randomNumericCode(digits = 6): string {
  const max = 10 ** digits;
  return String(randomInt(0, max)).padStart(digits, '0');
}

/**
 * Hash de valores curtos e não secretos por si (códigos, destinos) para busca e
 * comparação. Códigos e tokens só existem em hash no banco — nunca em claro.
 * Para SENHAS use Argon2id, nunca esta função.
 */
export function sha256(value: string, salt = ''): string {
  return createHash('sha256').update(`${salt}${value}`).digest('hex');
}

/** Comparação em tempo constante entre dois hashes hexadecimais. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Normaliza telefone para E.164 assumindo Brasil quando não há DDI.
 * Simplificação consciente do MVP — na v1 usar `libphonenumber-js` com o país
 * do perfil do usuário. Ver TODO no backlog (épico E3).
 */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (input.trim().startsWith('+')) {
    return digits.length >= 10 && digits.length <= 15 ? `+${digits}` : null;
  }
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  if (digits.length === 12 || digits.length === 13) return `+${digits}`;
  return null;
}

/** Mascara o destino para exibição em UI/API: nunca devolvemos o valor completo. */
export function maskDestination(channel: string, destination: string): string {
  if (channel === 'email') {
    const [local = '', dominio = ''] = destination.split('@');
    const visivel = local.slice(0, 1);
    return `${visivel}${'*'.repeat(Math.max(local.length - 1, 1))}@${dominio}`;
  }
  const digits = destination.replace(/\D/g, '');
  const finais = digits.slice(-4);
  return `${destination.startsWith('+') ? '+' : ''}${digits.slice(0, 4)}*****${finais}`;
}
