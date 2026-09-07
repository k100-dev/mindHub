> Histórico anterior à revisão de 06/09/2026. Para comportamento e implantação vigentes, consulte `docs/ESCOPO-VIGENTE.md` e o README da raiz. Regras de webhook, reserva temporária e identidade exclusiva foram substituídas nesta entrega.

# Matriz única de entregáveis — Estágio MindHub

Data-base: 22/08/2026  
Objetivo: permitir que o Planner coordene documentos acadêmicos e software sem confundir “arquivo preparado”, “revisado”, “enviado” e “validado pelo professor”.

## Convenção de status

- `PRONTO LOCAL`: arquivo finalizado tecnicamente, ainda não enviado.
- `REVISÃO DO ALUNO`: exige decisão, conferência ou informação pessoal.
- `BLOQUEADO EXTERNO`: depende de professor, ferramenta ou credencial.
- `AUSENTE`: não localizado no acervo auditado.
- `ENVIADO`: usar somente com evidência no Classroom/Drive.
- `ACEITO`: usar somente após confirmação do professor/banca.

Nenhum item deve saltar de `PRONTO LOCAL` para `ACEITO`. O status atual não comprova envio ao Classroom.

## Entregáveis críticos de Estágio I

| ID | Entregável | Prazo | Estado atual | Evidência existente | Próxima ação | Responsável | Gate de conclusão |
|---|---|---:|---|---|---|---|---|
| EST-SEQ | Diagramas de Sequência UC01/UC02 | 22/08 23:59 | REVISÃO DO ALUNO | DOCX, 2 PNG e 2 PUML no pacote Estágio I | Conferir escopo e coerência com casos de uso | Aluno | PDF/DOCX revisado e anexação confirmada |
| EST-EST | Diagramas de Estado UC01/UC02 | 22/08 23:59 | REVISÃO DO ALUNO | DOCX, 2 PNG e 2 PUML | Aprovar ou corrigir transições marcadas como inferência | Aluno + Planner | Matriz de transição aprovada e envio confirmado |
| EST-IMP | Diagrama de Implantação | 22/08 23:59 | PRONTO LOCAL | DOCX e PNG validados | Revisão rápida e anexação | Aluno | Evidência do envio no Classroom |
| EST-CLS | Diagrama de Classes | vencido 15/08 | BLOQUEADO EXTERNO | DOCX e PNG preparados | Confirmar reabertura com professor | Aluno/professor | Atividade reaberta e arquivo enviado |
| EST-DER | DER | vencido 15/08 | BLOQUEADO EXTERNO | DOCX, PDF e visualização | Confirmar reabertura com professor | Aluno/professor | Atividade reaberta e arquivo enviado |
| EST-BANCA | Pacote da banca | 29/08 | REVISÃO DO ALUNO | 15 PDFs e checklist parcial | Resolver ausências e documentos históricos | Planner + aluno | Checklist sem lacunas críticas e pasta compartilhável |

## Lacunas do pacote da banca

| Item | Situação | Decisão necessária | Ação mínima segura |
|---|---|---|---|
| RPOD | AUSENTE | Confirmar exigência e modelo | Solicitar ao responsável ou localizar fora do backup auditado |
| 2 Casos de Uso Funcionais | AUSENTE | Confirmar quais UCs e formato | Produzir somente após numeração oficial |
| Relatório de Estágio atualizado | AUSENTE | Confirmar template e período | Obter modelo oficial antes de redigir |
| Documento de Visão | LEGADO LUMOHUB | Não usar como MindHub | Já foi retirado da pasta canônica e preservado no histórico |
| Especificação Suplementar | LEGADO LUMOHUB | Não usar como MindHub | Já foi retirada da pasta canônica e preservada no histórico |
| Glossário | REVISÃO HISTÓRICA | Validar bot/secretária | Remover atores fora do MVP ou marcar como evolução futura |
| Diagrama de Caso de Uso | CONFLITO DE VERSÃO | Definir fonte oficial | Usar o PNG atual com UC01/UC02 até decisão documentada |

## Entregáveis do software MindHub

| ID | Entregável | Estado atual | Dependência | Evidência para encerrar |
|---|---|---|---|---|
| SW-GIT | Repositório privado e CI | PRONTO LOCAL; publicação pendente | Confirmação de criação no GitHub | URL, branch `main` e execução verde |
| SW-DB | Supabase de teste e migração | PLANEJADO | Conta/projeto Supabase | Banco recriado e log de migração |
| SW-AUTH | Autenticação e RLS reais | IMPLEMENTADO, NÃO INTEGRADO | SW-DB | Matriz de autorização negativa passando |
| SW-UI | Telas críticas com dados reais | PARCIAL | SW-AUTH | Ausência de `demo-data` na jornada crítica |
| SW-RSV | Reserva sem double-booking | IMPLEMENTADO, NÃO VALIDADO NO BANCO | SW-DB, SW-UI | Teste com 20 requisições e um vencedor |
| SW-PAY | Mercado Pago sandbox | IMPLEMENTADO, NÃO CONFIGURADO | SW-RSV, credenciais | Webhook aprovado/idempotente com evidência |
| SW-WPP | WhatsApp e lembretes | IMPLEMENTADO, NÃO CONFIGURADO | SW-PAY, Meta | Job auditável e ID do provedor, ou bloqueio documentado |
| SW-DEP | Preview remoto | PLANEJADO | SW-DB a SW-WPP | URL Vercel, E2E e smoke test |
| SW-DEMO | Vídeo/roteiro de demonstração | PLANEJADO | SW-DEP | Vídeo de 3–5 minutos e roteiro de contingência |

## Cronograma concentrado até 29/08

### 22/08 — preservar prazos do dia

1. Revisar Sequência, Estado e Implantação.
2. Anexar somente as versões aprovadas pelo aluno.
3. Registrar evidência de envio; não confundir com aceite.
4. Confirmar se a mensagem de reabertura de Classe/DER já foi enviada.

### 23–24/08 — fechar autoridade documental

1. Resolver UC03/UC04 e matriz de estados.
2. Decidir a versão oficial do Diagrama de Caso de Uso.
3. Obter template/requisitos de RPOD, Casos Funcionais e Relatório.
4. Atualizar Glossário, Visão e Especificação Suplementar somente com fonte MindHub.

### 25–26/08 — ambiente de software

1. Publicar repositório e criar Supabase de teste.
2. Executar migração, RLS e autenticação.
3. Conectar agenda/pacientes/hub e testar reserva concorrente.

### 27–28/08 — integrações e pacote final

1. Validar Mercado Pago sandbox.
2. Validar WhatsApp ou registrar bloqueio externo com demonstração fake honesta.
3. Regerar PDFs alterados e atualizar índice/checklist da banca.
4. Executar E2E, acessibilidade e smoke test do preview.

### 29/08 — entrega e contingência

1. Congelar versões e calcular inventário final.
2. Conferir abertura de todos os PDFs e links.
3. Gravar demonstração e gerar cópia offline.
4. Entregar somente após checklist do aluno.
5. Registrar o que foi enviado, quando e por qual link.

## Quadro de decisões que o Planner deve manter

| Decisão | Dono | Prazo sugerido | Impacto se não decidir |
|---|---|---:|---|
| Numeração oficial UC03/UC04 | Aluno/professor | 23/08 | Bloqueia casos funcionais e consistência dos diagramas |
| Transições administrativas finais | Aluno | 23/08 | Mantém diagramas de estado em revisão |
| Autoridade do Caso de Uso PNG/PDF | Aluno + Planner | 24/08 | Risco de pacote contraditório |
| Modelo de RPOD e Relatório | Professor/instituição | 24/08 | Pacote da banca permanece incompleto |
| Reabertura Classe/DER | Professor | Imediato | Entregas continuam bloqueadas |
| Supabase/Vercel de teste | Proprietário das contas | 25/08 | Software permanece apenas demonstrativo |
| Credenciais sandbox Mercado Pago | Proprietário da conta | 27/08 | Pagamento real não pode ser demonstrado |
| Aprovação Meta/WhatsApp | Proprietário da conta/Meta | 27/08 | Exige contingência documentada |

## Checklist de handoff entre Planner e Implementador

O Planner entrega ao Implementador:

- prioridade atual e ID da tarefa;
- requisito/documento que possui autoridade;
- critério de aceite observável;
- arquivos permitidos para alteração;
- dependências e credenciais já disponíveis;
- evidência esperada e ponto de parada.

O Implementador devolve ao Planner:

- commit ou caminho dos arquivos alterados;
- testes executados e resultado;
- divergências encontradas;
- status `concluído`, `aguardando revisão` ou `bloqueado`;
- evidência reproduzível e próximo risco.

## Próxima decisão executiva

Antes de iniciar novas funcionalidades, confirmar três fatos: publicação do GitHub, criação do Supabase de teste e situação real do envio/reabertura das atividades de Estágio I. Esses três pontos determinam todo o caminho crítico até 29/08.
