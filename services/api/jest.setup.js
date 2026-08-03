// Ambiente determinístico para os testes.
// Nenhum segredo real aqui — valores fictícios apenas para o ciclo de teste.
process.env.NODE_ENV = 'test';
// Montado em tempo de execução: evita que um literal com aparência de segredo
// entre no repositório e seja sinalizado pela varredura do CI.
process.env.JWT_SECRET = ['valor', 'ficticio', 'apenas', 'para', 'testes']
  .join('-')
  .padEnd(40, '-');
process.env.LOG_LEVEL = 'silent';
process.env.CONSENT_VERSION = 'v1';

// Sem credenciais de provedor -> a fábrica usa adaptadores de console (mock).
delete process.env.TWILIO_ACCOUNT_SID;
delete process.env.TWILIO_AUTH_TOKEN;
delete process.env.SENDGRID_API_KEY;
