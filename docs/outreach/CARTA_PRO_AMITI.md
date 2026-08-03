# Carta de apresentação — PRO-AMITI / PRO-AMJO (IPq HC-FMUSP)

> **Ação nº 1 do plano de [DATA_SOURCES.md §8](../DATA_SOURCES.md)** e o Caminho 1 do
> [PUBLIC_SECTOR_STRATEGY.md](../PUBLIC_SECTOR_STRATEGY.md). Destrava o épico E9
> inteiro, o instrumento de triagem e a credibilidade externa — que é o único ativo
> que este produto não consegue comprar.

## Antes de enviar — três regras

**1. Ofereça, não peça.** Um serviço universitário recebe muitos pedidos de validação
de app. Poucos chegam oferecendo uma pergunta de pesquisa que interessa a eles. A
nossa é boa: **o efeito telescópio se manteve depois da aposta online?**

**2. Não peça consultoria paga.** É proposta de colaboração científica. Se virar
prestação de serviço, muda a natureza da relação e some a independência que nos
interessa.

**3. Nada de promessa de exclusividade ou de propriedade sobre resultado.** Se a
parceria avançar, a publicação é deles tanto quanto nossa, e a metodologia é pública.
Isso está no `PUBLIC_SECTOR_STRATEGY.md` §7 como mitigação de captura.

**Contatos:** https://www.proamiti.com.br/ · IPq HC-FMUSP, Programas e Grupos.
`TODO`: confirmar o e-mail institucional atual antes de enviar.

---

## Texto da carta

**Assunto:** Proposta de colaboração científica — camada digital de acompanhamento
entre consultas em transtorno do jogo

Prezado Prof. Dr. Hermano Tavares e equipe do PRO-AMITI / PRO-AMJO,

Escrevo em nome do projeto ESCAPE-THE-GAMES, uma iniciativa de software voltada a
pessoas em recuperação de uso problemático de apostas e jogos. Procuro o programa não
para pedir avaliação de um produto, mas para propor uma colaboração de pesquisa — e
para submeter à crítica de vocês uma pergunta que nos parece relevante e que hoje não
tem resposta no Brasil.

**O que construímos, e por quê**

Ao estudar o cenário brasileiro, chegamos a uma conclusão que reorientou o projeto: o
Estado já entregou a camada episódica do cuidado — a Plataforma Centralizada de
Autoexclusão, o Guia de Cuidado do Ministério da Saúde, a triagem no Meu SUS Digital e
o teleatendimento. O que não existe é a camada **contínua**: o que acontece entre uma
consulta e a seguinte, na madrugada do dia 12, quando a pessoa já se autoexcluiu e
está sozinha.

É essa camada que estamos construindo: rede de apoio verificada com consentimento em
duplo opt-in, plano escrito em estado frio e recuperável no estado quente, preparo do
familiar sobre como responder, e telemetria de baixa intrusão. O código é aberto e a
métrica que adotamos é deliberadamente hostil ao engajamento — sucesso é a pessoa
precisar menos do aplicativo.

**Por que procuramos o programa de vocês**

Três motivos concretos.

Primeiro, **rigor sobre instrumentos**. Implementamos o rastreio de três itens
derivado da dissertação de Juan David Tovar Velásquez, orientada por V. Sa., e também
a versão brasileira do OGD-Q. Registramos explicitamente, no código e na documentação,
o limite declarado pelos próprios autores: a acurácia do primeiro foi estabelecida em
apostadores de loteria e não se generaliza para apostadores online. Não usamos nenhum
dos dois como diagnóstico. Gostaríamos da orientação de vocês sobre qual instrumento
aplicar em qual momento da jornada.

Segundo, **governança clínica**. Nosso módulo de crise está deliberadamente bloqueado
para lançamento. Ele não sobe sem diretor clínico responsável nomeado, plantão humano
definido e critérios de detecção revisados por quem tem competência para isso. Detectar
risco sem ter como responder é a pior combinação possível, e preferimos não lançar a
lançar mal.

Terceiro, e é o que de fato traz esta carta: **uma pergunta de pesquisa**.

**A pergunta**

A literatura registra o efeito telescópio — a progressão do jogo social ao patológico
sendo substancialmente mais rápida em mulheres do que em homens. A referência
brasileira nesse recorte é anterior à aposta online: descreve a era do bingo e do
caça-níquel, com amostra clínica.

Desde então mudou o que talvez seja a variável mais importante: o acesso. Como a Dra.
Nora Volkow formulou, o acesso móvel comprimiu o ciclo de desejo, oportunidade e ação
para segundos.

Então: **o efeito telescópio se manteve, encurtou, ou desapareceu depois da aposta
online? E ele se comporta do mesmo modo nos dois sexos, quando o cassino cabe no
bolso?**

A resposta tem consequência prática direta. Se a janela entre o primeiro sinal e o
quadro instalado encolheu, então toda estratégia de prevenção baseada em agir cedo
precisa ser recalibrada — inclusive a nossa, que hoje está desenhada para uma janela
que talvez não exista mais.

**O que podemos oferecer**

Vocês têm a coorte, os instrumentos validados, o comitê de ética e duas décadas de
prática clínica. Nós temos a camada de software que opera continuamente entre as
consultas e que pode registrar, com consentimento e sem intrusão, exatamente o tipo de
dado longitudinal que esse tipo de pergunta exige.

Colocamos à disposição: o desenvolvimento sem custo de instrumentos de coleta conforme
a especificação de vocês; a infraestrutura de registro com trilha de auditoria
íntegra, adequada a exigência de comitê de ética; e o código-fonte aberto, auditável
por qualquer pessoa.

Não buscamos validação comercial, selo, nem exclusividade. Buscamos fazer isso do modo
correto, e temos consciência de que não é possível fazer sozinhos.

**Próximo passo**

Se houver interesse, gostaríamos de propor uma conversa de trinta minutos, presencial
ou remota, em que apresentaríamos o que existe hoje e — mais importante — ouviríamos
onde estamos errados. Estamos preparados para descobrir que parte do que construímos
não se sustenta clinicamente; é justamente por isso que preferimos ouvir agora, e não
depois de lançar.

Agradeço a atenção e coloco-me à disposição.

Atenciosamente,

[nome] · [cargo] · ESCAPE-THE-GAMES
[e-mail] · [telefone]
Repositório: [URL]

---

## O que anexar

| Documento                                   | Por quê                                                            |
| ------------------------------------------- | ------------------------------------------------------------------ |
| [CRISIS_PROTOCOL.md](../CRISIS_PROTOCOL.md) | Mostra que os portões de governança são levados a sério            |
| [DATA_SOURCES.md](../DATA_SOURCES.md)       | Mostra a disciplina de procedência — nenhum número sem fonte       |
| `modules/screening/` (link)                 | Mostra o instrumento implementado com os limites no próprio código |

**Não anexe** o plano de negócios na primeira conversa. A colaboração é científica; o
modelo de receita entra depois, se entrar.

## Se a resposta for não

Alternativas na mesma linha, em ordem: grupos de pesquisa em saúde mental digital da
UFRGS (GEAT — adições tecnológicas), o grupo da PUC-Rio que validou o OGD-Q BR
(Sanvicente-Vieira e colegas), Unifesp/UNIAD (LENAD), e Fiocruz. O OGD-Q BR é a porta
mais natural depois do IPq — implementamos o instrumento deles, e essa é uma boa
primeira frase.
