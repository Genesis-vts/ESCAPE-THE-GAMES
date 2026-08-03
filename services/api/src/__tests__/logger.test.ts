import { redact } from '../utils/logger';

/**
 * Teste de conformidade: nenhum dado pessoal ou clínico pode entrar em log.
 * Este teste é bloqueante para o lançamento (SECURITY_AND_COMPLIANCE.md §9).
 */
describe('redact', () => {
  it('remove campos sensíveis em qualquer profundidade', () => {
    const entrada = {
      eventId: 'pe_1',
      message: 'conteúdo clínico',
      contato: {
        destination: '+5511999998888',
        email: 'alguem@example.com',
        nested: { code: '123456', token: 'abc', lat: -23.5, lon: -46.6 },
      },
      lista: [{ password: 'x' }, { authorization: 'Bearer y' }],
    };

    const saida = JSON.stringify(redact(entrada));

    expect(saida).toContain('pe_1');
    expect(saida).not.toContain('conteúdo clínico');
    expect(saida).not.toContain('+5511999998888');
    expect(saida).not.toContain('alguem@example.com');
    expect(saida).not.toContain('123456');
    expect(saida).not.toContain('Bearer y');
    expect(saida).not.toContain('-23.5');
  });

  it('é insensível a maiúsculas no nome do campo', () => {
    expect(JSON.stringify(redact({ Destination: 'x@y.com', DevCode: '999999' }))).not.toContain(
      'x@y.com',
    );
  });

  it('preserva valores operacionais', () => {
    const saida = redact({ requestId: 'req_1', status: 200, duracaoMs: 42 }) as Record<
      string,
      unknown
    >;
    expect(saida).toEqual({ requestId: 'req_1', status: 200, duracaoMs: 42 });
  });
});
