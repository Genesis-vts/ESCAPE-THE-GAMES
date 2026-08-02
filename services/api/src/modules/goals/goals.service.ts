import type { Container } from '../../container';
import type { UsageGoal } from '../../domain/types';
import { AppError } from '../../errors/AppError';
import { newId } from '../../utils/crypto';
import type { CreateGoalInput, RegisterLapseInput } from './goals.schema';

const UM_DIA_MS = 24 * 60 * 60 * 1000;

export interface GoalProgress {
  currentStreakDays: number;
  targetDays: number;
  longestStreakDays: number;
  currentStreakStartedAt: string;
}

/**
 * Autorregulação sem gamificação.
 *
 * ── Duas decisões que se afastam de um desenho de "streak" convencional ──
 *
 * 1. **Recaída é declarada pelo usuário; NUNCA inferida do botão de pânico.**
 *    Acionar o botão é pedir ajuda — é o comportamento que o produto existe
 *    para incentivar. Se pedir ajuda zerasse a contagem, o produto puniria
 *    exatamente o que quer ensinar, e a pessoa aprenderia a não acionar. Por
 *    isso a recaída tem rota própria e explícita.
 *
 * 2. **A melhor sequência nunca diminui, e a contagem atual não é "perdida".**
 *    Contador de sequência é mecânica de engajamento, e quebrar sequência ativa
 *    aversão à perda: transforma um deslize em fracasso total e é fator
 *    conhecido de abandono. Mantemos a contagem porque ela é informação
 *    legítima de progresso, mas `longestStreakDays` preserva o que a pessoa já
 *    conquistou — o histórico não é apagado por um dia ruim.
 *
 * O que **não** existe aqui, deliberadamente: pontos, níveis, conquistas,
 * medalhas, recompensa variável ou qualquer reforço intermitente. É o mesmo
 * mecanismo que torna a aposta aditiva, e usá-lo "do bem" continua sendo
 * treinar o circuito que estamos tentando acalmar. Ver AI_COACHING_TEAM.md.
 *
 * `TODO [CLINICAL]`: se mostrar a contagem ao usuário ajuda ou atrapalha em
 * recaída é pergunta empírica. Medir antes de tratar como benefício.
 */
export class GoalsService {
  constructor(private readonly deps: Container) {}

  async create(userId: string, input: CreateGoalInput): Promise<UsageGoal> {
    const user = await this.deps.users.findById(userId);
    if (!user) throw AppError.unauthorized('Usuário não encontrado ou inativo.');

    const agora = new Date().toISOString();
    const inicio = input.startedAt ?? agora;

    if (new Date(inicio).getTime() > Date.now()) {
      throw AppError.validation('A data de início não pode estar no futuro.');
    }

    const existente = await this.deps.goals.findByUser(userId);
    const meta: UsageGoal = {
      id: existente?.id ?? newId('gl'),
      userId,
      targetDaysFree: input.targetDaysFree,
      currentStreakStartedAt: inicio,
      // Trocar de meta não apaga o que já foi conquistado.
      longestStreakDays: Math.max(
        existente?.longestStreakDays ?? 0,
        diasEntre(inicio, agora),
        existente ? this.diasCorrentes(existente) : 0,
      ),
      createdAt: existente?.createdAt ?? agora,
      updatedAt: agora,
    };

    return this.deps.goals.save(meta);
  }

  async getProgress(userId: string): Promise<GoalProgress> {
    const meta = await this.deps.goals.findByUser(userId);
    if (!meta) throw AppError.notFound('Nenhuma meta definida.');

    const currentStreakDays = this.diasCorrentes(meta);
    return {
      currentStreakDays,
      targetDays: meta.targetDaysFree,
      // A melhor sequência considera também a corrente, que pode já ser recorde.
      longestStreakDays: Math.max(meta.longestStreakDays, currentStreakDays),
      currentStreakStartedAt: meta.currentStreakStartedAt,
    };
  }

  /**
   * Registra uma recaída declarada. Reinicia a contagem atual e **preserva** a
   * melhor sequência já alcançada.
   */
  async registerLapse(userId: string, input: RegisterLapseInput): Promise<GoalProgress> {
    const meta = await this.deps.goals.findByUser(userId);
    if (!meta) throw AppError.notFound('Nenhuma meta definida.');

    const quando = input.occurredAt ?? new Date().toISOString();
    if (new Date(quando).getTime() > Date.now()) {
      throw AppError.validation('A data da recaída não pode estar no futuro.');
    }

    const atualizada: UsageGoal = {
      ...meta,
      longestStreakDays: Math.max(meta.longestStreakDays, this.diasCorrentes(meta)),
      currentStreakStartedAt: quando,
      updatedAt: new Date().toISOString(),
    };
    await this.deps.goals.save(atualizada);

    // Auditoria sem conteúdo clínico: apenas o fato, para prestação de contas.
    this.deps.audit.append({
      actorId: userId,
      actorType: 'user',
      action: 'GOAL_LAPSE_REGISTERED',
      entityType: 'usage_goal',
      entityId: meta.id,
      metadata: {},
    });

    return this.getProgress(userId);
  }

  private diasCorrentes(meta: UsageGoal): number {
    return diasEntre(meta.currentStreakStartedAt, new Date().toISOString());
  }
}

/** Dias completos entre dois instantes ISO. Nunca negativo. */
function diasEntre(inicioIso: string, fimIso: string): number {
  const delta = new Date(fimIso).getTime() - new Date(inicioIso).getTime();
  return delta <= 0 ? 0 : Math.floor(delta / UM_DIA_MS);
}
