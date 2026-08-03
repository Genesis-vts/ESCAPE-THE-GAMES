import {
  buildWhatsappDeepLink,
  renderPanicEmail,
  renderPanicPush,
  renderPanicSms,
  renderVerificationSms,
  toGsm7,
  type PanicTemplateInput,
} from '../notifications/templates';

const base: PanicTemplateInput = {
  userDisplayName: 'Rafael',
  userPhone: '+5511988887777',
  contactDisplayName: 'Cláudia',
  timestamp: new Date('2026-03-21T23:41:00.000Z'),
  message: 'Preciso de ajuda agora',
  location: null,
  optOutUrl: 'https://app.example/opt-out?c=ct_1',
  eventId: 'pe_123',
};

describe('toGsm7', () => {
  it('remove acentuação mantendo a legibilidade', () => {
    expect(toGsm7('Você não está sozinho — respire')).toBe('Voce nao esta sozinho - respire');
  });

  it('produz apenas caracteres ASCII imprimíveis', () => {
    const saida = toGsm7('Ação 😀 “aspas” ‘simples’');
    expect(saida).toMatch(/^[\x20-\x7E\n]*$/);
    expect(saida).not.toContain('😀');
  });
});

describe('renderPanicSms', () => {
  it('inclui quem acionou, a mensagem, o telefone, o disclaimer e o opt-out', () => {
    const sms = renderPanicSms(base);

    expect(sms).toContain('[ESCAPE-THE-GAMES] Rafael acionou o botao de apoio');
    expect(sms).toContain('Preciso de ajuda agora');
    expect(sms).toContain('+5511988887777');
    expect(sms).toContain('Este app nao e servico de emergencia');
    expect(sms).toContain('Responda SAIR');
  });

  it('não usa acentos (evita UCS-2 e custo dobrado de SMS)', () => {
    const sms = renderPanicSms({ ...base, message: 'Não estou bem, ansiedade forte' });
    expect(sms).toMatch(/^[\x20-\x7E\n]*$/);
  });

  it('omite a linha de mensagem quando o usuário não escreve nada', () => {
    const sms = renderPanicSms({ ...base, message: null });
    expect(sms).not.toContain('Mensagem:');
  });

  it('inclui o link de localização apenas quando autorizada', () => {
    expect(renderPanicSms(base)).not.toContain('Local:');
    const comLocal = renderPanicSms({ ...base, location: { lat: -23.55052, lon: -46.633308 } });
    expect(comLocal).toContain('Local: https://maps.google.com/?q=-23.55052,-46.633308');
  });

  it('omite o conteúdo da mensagem quando há sinal de risco', () => {
    const sms = renderPanicSms({ ...base, message: 'quero me machucar', riskFlag: true });
    expect(sms).not.toContain('me machucar');
    expect(sms).toContain('Fale com Rafael');
  });
});

describe('renderPanicEmail', () => {
  it('traz assunto, orientação de apoio, disclaimer e link de descadastro', () => {
    const email = renderPanicEmail(base);

    expect(email.subject).toContain('Rafael pediu apoio agora');
    expect(email.text).toContain('O QUE COSTUMA AJUDAR');
    expect(email.text).toContain('O QUE EVITAR');
    expect(email.text).toContain('188 (CVV)');
    expect(email.text).toContain(base.optOutUrl);
    expect(email.html).toContain(base.optOutUrl);
  });

  it('escapa HTML vindo da mensagem do usuário', () => {
    const email = renderPanicEmail({ ...base, message: '<script>alert(1)</script>' });
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;');
  });
});

describe('renderPanicPush', () => {
  it('não expõe conteúdo sensível na notificação', () => {
    const push = renderPanicPush({ ...base, message: 'conteudo clinico sensivel' });
    expect(`${push.title} ${push.body}`).not.toContain('conteudo clinico sensivel');
    expect(push.data.type).toBe('panic_alert');
    expect(push.data.eventId).toBe('pe_123');
  });
});

describe('renderVerificationSms', () => {
  it('explica o convite, mostra o código e oferece saída', () => {
    const sms = renderVerificationSms({
      userDisplayName: 'Rafael',
      contactDisplayName: 'Cláudia',
      code: '123456',
      ttlMinutes: 15,
      optOutUrl: 'https://app.example/opt-out',
    });

    expect(sms).toContain('indicou voce como contato de apoio');
    expect(sms).toContain('Codigo de confirmacao: 123456');
    expect(sms).toContain('Responda SAIR');
  });
});

describe('buildWhatsappDeepLink', () => {
  it('monta a URL com o número sem formatação e o texto codificado', () => {
    const url = buildWhatsappDeepLink('+55 (11) 91111-2222', 'Preciso de apoio agora');
    expect(url).toBe('https://wa.me/5511911112222?text=Preciso%20de%20apoio%20agora');
  });
});
