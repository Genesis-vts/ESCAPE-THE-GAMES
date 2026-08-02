import { createHash } from 'node:crypto';

/**
 * Log de auditoria WORM (append-only) com hash encadeado.
 *
 * MVP: armazenamento em memória. Em produção é uma tabela PostgreSQL sem GRANT de
 * UPDATE/DELETE, exportada diariamente para bucket com Object Lock.
 * Ver SECURITY_AND_COMPLIANCE.md §5.5.
 *
 * REGRA: `metadata` NUNCA pode conter PII nem conteúdo clínico — apenas
 * identificadores, contadores e enums.
 */
export type AuditAction =
  | 'USER_LOGIN'
  | 'CONTACT_CREATED'
  | 'CONTACT_VERIFIED'
  | 'CONTACT_VERIFY_FAILED'
  | 'CONTACT_REVOKED'
  | 'CONTACT_CODE_RESENT'
  | 'PANIC_TRIGGERED'
  | 'PANIC_NOTIFICATION_SENT'
  | 'PANIC_NOTIFICATION_FAILED'
  | 'PANIC_RESOLVED'
  | 'SCREENING_COMPLETED'
  | 'RATE_LIMIT_EXCEEDED';

export interface AuditEntry {
  seq: number;
  occurredAt: string;
  actorId: string;
  actorType: 'user' | 'contact' | 'system' | 'clinician' | 'admin';
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata: Record<string, string | number | boolean>;
  prevHash: string;
  hash: string;
}

const GENESIS_HASH = '0'.repeat(64);

/** Serialização canônica: a ordem dos campos é fixa para o hash ser reproduzível. */
function canonical(e: Omit<AuditEntry, 'hash'>): string {
  return JSON.stringify([
    e.seq,
    e.occurredAt,
    e.actorId,
    e.actorType,
    e.action,
    e.entityType,
    e.entityId,
    Object.keys(e.metadata)
      .sort()
      .map((k) => [k, e.metadata[k]]),
    e.prevHash,
  ]);
}

export class AuditLog {
  private readonly entries: AuditEntry[] = [];
  private lastHash = GENESIS_HASH;

  append(input: Omit<AuditEntry, 'seq' | 'occurredAt' | 'prevHash' | 'hash'>): AuditEntry {
    const seq = this.entries.length + 1;
    const occurredAt = new Date().toISOString();
    const prevHash = this.lastHash;
    const semHash = { seq, occurredAt, prevHash, ...input };
    const hash = createHash('sha256').update(canonical(semHash)).digest('hex');

    const entry: AuditEntry = { ...semHash, hash };
    this.entries.push(entry);
    this.lastHash = hash;
    return entry;
  }

  list(): readonly AuditEntry[] {
    return this.entries;
  }

  findByEntity(entityId: string): AuditEntry[] {
    return this.entries.filter((e) => e.entityId === entityId);
  }

  /** Verifica a integridade da cadeia. Usado em auditoria e em teste automatizado. */
  verifyChain(): { valid: boolean; brokenAtSeq?: number } {
    let prevHash = GENESIS_HASH;
    for (const entry of this.entries) {
      const hash = createHash('sha256')
        .update(canonical({ ...entry, prevHash }))
        .digest('hex');
      if (hash !== entry.hash || entry.prevHash !== prevHash) {
        return { valid: false, brokenAtSeq: entry.seq };
      }
      prevHash = hash;
    }
    return { valid: true };
  }
}
