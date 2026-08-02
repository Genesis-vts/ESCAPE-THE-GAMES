import type { Container } from '../../container';
import type { JournalEntry } from '../../domain/types';
import { AppError } from '../../errors/AppError';
import { newId } from '../../utils/crypto';
import type { CreateJournalEntryInput, ListJournalQuery } from './journal.schema';

export interface JournalEntryView {
  id: string;
  triggerType: string;
  intensity: number | null;
  notes: string | null;
  createdAt: string;
}

export interface JournalPage {
  entries: JournalEntryView[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Diário de gatilhos — autoconhecimento, não vigilância.
 *
 * Decisões de projeto, deliberadas:
 *
 * 1. Registrar um gatilho **não** aciona ninguém e **não** dispara alerta. É
 *    informação da pessoa para ela mesma. Transformar o diário em gatilho de
 *    notificação faria dele um delator, e ninguém escreve a verdade num
 *    caderno que fala com terceiros.
 * 2. A auditoria registra **que houve** registro, nunca o conteúdo — nem
 *    `notes`, nem `triggerType`. O tipo de gatilho é dado de saúde.
 */
export class JournalService {
  constructor(private readonly deps: Container) {}

  async create(userId: string, input: CreateJournalEntryInput): Promise<JournalEntryView> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw AppError.unauthorized('Usuário não encontrado ou inativo.');

    const entrada: JournalEntry = {
      id: newId('je'),
      userId,
      triggerType: input.triggerType,
      intensity: input.intensity ?? null,
      notes: input.notes ?? null,
      createdAt: new Date().toISOString(),
    };

    await this.deps.journal.create(entrada);

    // Sem PII e sem conteúdo clínico: só o fato e o identificador.
    this.deps.audit.append({
      actorId: userId,
      actorType: 'user',
      action: 'JOURNAL_ENTRY_CREATED',
      entityType: 'journal_entry',
      entityId: entrada.id,
      metadata: { hasNotes: entrada.notes !== null },
    });

    return this.view(entrada);
  }

  async list(userId: string, query: ListJournalQuery): Promise<JournalPage> {
    const entradas = await this.deps.journal.listByUser(userId, query.limit, query.offset);
    return {
      entries: entradas.map((e) => this.view(e)),
      total: await this.deps.journal.countByUser(userId),
      limit: query.limit,
      offset: query.offset,
    };
  }

  private view(entrada: JournalEntry): JournalEntryView {
    return {
      id: entrada.id,
      triggerType: entrada.triggerType,
      intensity: entrada.intensity,
      notes: entrada.notes,
      createdAt: entrada.createdAt,
    };
  }
}
