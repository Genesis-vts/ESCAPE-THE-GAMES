/**
 * Templates de mensagem em PT-BR.
 *
 * Fonte da verdade dos textos: docs/PANIC_BUTTON_DESIGN.md §5.
 * Qualquer alteração de texto exige revisão clínica e jurídica.
 * TODO [CLINICAL] TODO [LEGAL]
 */

export const DISCLAIMER_CURTO =
  'Este app nao e servico de emergencia. Em risco imediato ligue 192.';

export const DISCLAIMER_LONGO =
  'O ESCAPE-THE-GAMES não é serviço de emergência e não aciona socorro. ' +
  'Se houver risco imediato à vida, ligue 192 (SAMU). ' +
  'Apoio emocional gratuito e sigiloso 24 h: 188 (CVV).';

export interface PanicTemplateInput {
  userDisplayName: string;
  userPhone: string;
  contactDisplayName: string;
  timestamp: Date;
  message?: string | null;
  location?: { lat: number; lon: number } | null;
  optOutUrl: string;
  eventId: string;
  /** Quando true, o conteúdo da mensagem é omitido do SMS. Ver §6 do design. */
  riskFlag?: boolean;
}

export interface VerificationTemplateInput {
  userDisplayName: string;
  contactDisplayName: string;
  code: string;
  ttlMinutes: number;
  optOutUrl: string;
}

/**
 * Remove acentos e caracteres fora do alfabeto GSM-7.
 *
 * Motivo: um SMS com qualquer caractere fora do GSM-7 passa a ser codificado em
 * UCS-2, o que reduz o segmento de 160 para 70 caracteres e dobra o custo.
 * Ver BUSINESS_PLAN.md §5.1 (SMS é o maior custo variável).
 */
export function toGsm7(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // marcas de acentuação combinantes
    .replace(/[\u201c\u201d]/g, '"') // aspas curvas
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, '-') // travessões
    .replace(/[^\x20-\x7E\n]/g, '');
}

export function formatarDataHora(date: Date, timeZone = 'America/Sao_Paulo'): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function buildLocationUrl(location: { lat: number; lon: number }): string {
  return `https://maps.google.com/?q=${location.lat},${location.lon}`;
}

/** SMS de acionamento do botão de pânico. */
export function renderPanicSms(input: PanicTemplateInput): string {
  const linhas: string[] = [
    `[ESCAPE-THE-GAMES] ${input.userDisplayName} acionou o botao de apoio em ${formatarDataHora(input.timestamp)}.`,
  ];

  // Em evento com sinal de risco, o conteúdo NÃO vai por SMS (design §6).
  if (input.message && !input.riskFlag) {
    linhas.push(`Mensagem: "${input.message}"`);
  }

  linhas.push(`Fale com ${input.userDisplayName}: ${input.userPhone}`);

  if (input.location) {
    linhas.push(`Local: ${buildLocationUrl(input.location)}`);
  }

  linhas.push(DISCLAIMER_CURTO);
  linhas.push('Responda SAIR para nao receber mais.');

  return toGsm7(linhas.join('\n'));
}

/** SMS de convite/verificação enviado ao contato de apoio. */
export function renderVerificationSms(input: VerificationTemplateInput): string {
  return toGsm7(
    [
      `[ESCAPE-THE-GAMES] ${input.userDisplayName} indicou voce como contato de apoio.`,
      'Voce recebera um aviso quando essa pessoa pedir ajuda.',
      `Codigo de confirmacao: ${input.code} (validade ${input.ttlMinutes} min)`,
      'Nao quer participar? Responda SAIR.',
    ].join('\n'),
  );
}

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

/** E-mail de acionamento, com orientação de como apoiar. */
export function renderPanicEmail(input: PanicTemplateInput): EmailContent {
  const quando = formatarDataHora(input.timestamp);
  const subject = `${input.userDisplayName} pediu apoio agora (${quando})`;

  const blocoMensagem = input.message ? `Mensagem deixada:\n"${input.message}"\n` : '';
  const blocoLocal = input.location
    ? `Local compartilhado: ${buildLocationUrl(input.location)}\n`
    : '';

  const text = `Olá, ${input.contactDisplayName}.

${input.userDisplayName} acionou o botão de apoio do ESCAPE-THE-GAMES em ${quando}.

${blocoMensagem}
Como falar agora: ${input.userPhone}
${blocoLocal}
O QUE COSTUMA AJUDAR
- Responda rápido, mesmo que curto: "Tô aqui, me liga."
- Ouça sem julgar. A pessoa já sabe que quer mudar.
- Pergunte o que ela precisa agora, em vez de propor solução.

O QUE EVITAR
- Cobrar, ameaçar ou lembrar de promessas anteriores.
- Prometer o que você não pode cumprir.

IMPORTANTE
${DISCLAIMER_LONGO}

Você recebe este aviso porque confirmou ser contato de apoio de ${input.userDisplayName}.
Para sair a qualquer momento: ${input.optOutUrl}

Identificador do evento: ${input.eventId}
`;

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.5; color:#1a1a1a;">
    <p>Olá, ${escapeHtml(input.contactDisplayName)}.</p>
    <p><strong>${escapeHtml(input.userDisplayName)}</strong> acionou o botão de apoio do
       ESCAPE-THE-GAMES em ${escapeHtml(quando)}.</p>
    ${input.message ? `<blockquote style="border-left:3px solid #ccc;padding-left:12px;">${escapeHtml(input.message)}</blockquote>` : ''}
    <p>Como falar agora: <strong>${escapeHtml(input.userPhone)}</strong></p>
    ${input.location ? `<p>Local compartilhado: <a href="${buildLocationUrl(input.location)}">abrir no mapa</a></p>` : ''}
    <h3>O que costuma ajudar</h3>
    <ul>
      <li>Responda rápido, mesmo que curto: "Tô aqui, me liga."</li>
      <li>Ouça sem julgar. A pessoa já sabe que quer mudar.</li>
      <li>Pergunte o que ela precisa agora, em vez de propor solução.</li>
    </ul>
    <h3>O que evitar</h3>
    <ul>
      <li>Cobrar, ameaçar ou lembrar de promessas anteriores.</li>
      <li>Prometer o que você não pode cumprir.</li>
    </ul>
    <p style="background:#fff4e5;padding:12px;border-radius:6px;"><strong>Importante:</strong>
       ${escapeHtml(DISCLAIMER_LONGO)}</p>
    <p style="font-size:12px;color:#666;">
      Você recebe este aviso porque confirmou ser contato de apoio de
      ${escapeHtml(input.userDisplayName)}.<br />
      <a href="${input.optOutUrl}">Não quero mais receber</a> ·
      Evento ${escapeHtml(input.eventId)}
    </p>
  </body>
</html>`;

  return { subject, text, html };
}

/** E-mail de convite/verificação do contato de apoio. */
export function renderVerificationEmail(input: VerificationTemplateInput): EmailContent {
  const subject = `${input.userDisplayName} indicou você como contato de apoio`;
  const text = `Olá, ${input.contactDisplayName}.

${input.userDisplayName} está usando o ESCAPE-THE-GAMES para reduzir o tempo de jogo e
indicou você como contato de apoio.

Se você confirmar, receberá um aviso quando essa pessoa acionar o botão de apoio.
Você não receberá nada até confirmar.

Código de confirmação: ${input.code}
Validade: ${input.ttlMinutes} minutos

Não quer participar? Ignore este e-mail ou use o link: ${input.optOutUrl}

${DISCLAIMER_LONGO}
`;
  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="font-family: system-ui, sans-serif; line-height:1.5;">
    <p>Olá, ${escapeHtml(input.contactDisplayName)}.</p>
    <p><strong>${escapeHtml(input.userDisplayName)}</strong> está usando o ESCAPE-THE-GAMES para
       reduzir o tempo de jogo e indicou você como contato de apoio.</p>
    <p>Se você confirmar, receberá um aviso quando essa pessoa acionar o botão de apoio.
       <strong>Você não receberá nada até confirmar.</strong></p>
    <p style="font-size:28px;letter-spacing:6px;"><strong>${escapeHtml(input.code)}</strong></p>
    <p>Validade: ${input.ttlMinutes} minutos.</p>
    <p style="font-size:12px;color:#666;">Não quer participar?
       <a href="${input.optOutUrl}">Recuse aqui</a>.<br />${escapeHtml(DISCLAIMER_LONGO)}</p>
  </body>
</html>`;
  return { subject, text, html };
}

export interface PushContent {
  title: string;
  body: string;
  data: Record<string, string>;
}

/** Push para o contato de apoio. Sem conteúdo sensível na notificação. */
export function renderPanicPush(input: PanicTemplateInput): PushContent {
  return {
    title: `${input.userDisplayName} pediu apoio`,
    body: 'Acionou o botão de apoio agora. Toque para ver como ajudar.',
    data: { type: 'panic_alert', eventId: input.eventId },
  };
}

/** Push de confirmação para o próprio usuário. */
export function renderPanicConfirmationPush(count: number): PushContent {
  return {
    title: 'Seu apoio foi avisado',
    body: `Avisamos ${count} pessoa(s). Respire com a gente enquanto isso.`,
    data: { type: 'panic_confirmation', count: String(count) },
  };
}

/**
 * Deep link do WhatsApp.
 *
 * O MVP NÃO envia mensagem por WhatsApp a partir do servidor: isso exigiria a
 * WhatsApp Business API com template aprovado e opt-in registrado. Aqui apenas
 * devolvemos a URL para o app abrir, com envio manual pelo usuário.
 * Ver ARCHITECTURE.md ADR-006. TODO [LEGAL]
 */
export function buildWhatsappDeepLink(phoneE164: string, texto: string): string {
  const numero = phoneE164.replace(/\D/g, '');
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
