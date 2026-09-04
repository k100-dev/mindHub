# Plano de ação concentrado — finalização do MindHub

## Objetivo de entrega

Transformar a fundação demonstrativa existente em um MVP integrado, reproduzível e apresentável: uma psicóloga ativa configura disponibilidade; um paciente autenticado reserva um horário; o pagamento sandbox confirma o agendamento por webhook; o sistema registra a notificação e ambos visualizam o resultado persistido.

Este plano prioriza somente o que prova essa jornada. Recursos intermediários ou avançados ficam fora até o fluxo principal estar aprovado.

## Estado de partida verificado

| Frente | Estado atual | Lacuna essencial |
|---|---|---|
| Interface | Páginas públicas, painel e hub responsivos; UC01/UC02 funcionais em modo demonstrativo | Conectar as telas críticas ao Supabase para o gate de produção |
| Banco | Migração, RLS e funções SQL versionadas | Migração ainda não executada contra Supabase local/teste |
| Autenticação | Fluxos e guards implementados | Falta validar e-mail, convite e recuperação com projeto real |
| Agenda | Cadastro, visões dia/semana/mês, disponibilidade, bloqueios e prevenção de conflito demonstráveis | Falta integração E2E com banco e teste concorrente real |
| Pagamento | Checkout e webhook implementados | Falta credencial sandbox e teste assinado real |
| WhatsApp | Adaptador, webhook e retry implementados | Falta template/credencial e teste real ou sandbox aprovado |
| Deploy | OpenAI Sites/Cloudflare vinculado, build validado e publicação acadêmica disponível | Falta Supabase de teste e smoke autenticado remoto |

## Sequência crítica

### Marco 0 — Publicação e fonte única

Prazo sugerido: 30 minutos.

- Publicar a branch `main` no repositório privado.
- Confirmar README, documentação, migração e workflow de CI no GitHub.
- Proteger `.env*`, resultados de teste e temporários.
- Tratar o repositório como fonte canônica do software; o acervo acadêmico continua como fonte dos entregáveis da banca.

Critério de saída: clone limpo instala dependências e executa `pnpm check`.

### Marco 1 — Supabase funcional

Prazo sugerido: 3–5 horas.

- Criar projeto Supabase exclusivo de teste.
- Preencher somente localmente as variáveis de `.env.local`.
- Executar a migração do zero e revisar avisos SQL.
- Criar uma psicóloga fictícia allowlisted e dois pacientes fictícios.
- Testar RLS: psicóloga A não acessa dados externos; paciente vê somente os próprios agendamentos.
- Adicionar testes SQL para sobreposição, vínculos e transições.

Critério de saída: banco recriável, contas autenticam e testes negativos de autorização passam.

Evidências: log da migração, matriz RLS, captura das contas fictícias e relatório de testes sem dados reais.

### Marco 2 — Remover dados demonstrativos dos fluxos essenciais

Prazo sugerido: 5–8 horas.

- Conectar dashboard, pacientes, agenda e hub às APIs existentes.
- Implementar carregamento, vazio, erro, acesso negado e sucesso.
- Persistir edição de perfil, disponibilidade, bloqueios e paciente.
- Fazer a agenda pública consumir os slots reais por slug.
- Manter fixtures apenas em testes e modo explicitamente demonstrativo.

Critério de saída: atualizar o banco altera imediatamente as telas correspondentes; nenhuma tela crítica depende de `demo-data.ts`.

Evidências: gravação curta da jornada, consultas antes/depois e E2E autenticado.

### Marco 3 — Reserva concorrente

Prazo sugerido: 3–4 horas.

- Validar disponibilidade recorrente, bloqueios, expiração e fuso.
- Executar pelo menos 20 solicitações simultâneas para o mesmo slot.
- Garantir exatamente uma reserva e respostas 409 para as demais.
- Automatizar expiração de reservas vencidas.

Critério de saída: nenhum cenário produz double-booking; o horário volta à agenda após expiração.

Evidências: teste concorrente automatizado e consulta ao banco mostrando um único registro ocupante.

### Marco 4 — Mercado Pago sandbox

Prazo sugerido: 4–6 horas.

- Configurar aplicação e credenciais sandbox.
- Confirmar o formato vigente da assinatura do webhook.
- Testar pagamento aprovado, pendente, rejeitado, repetido e fora de ordem.
- Garantir que a página de retorno apenas consulta e apresenta o estado.
- Reconciliar `payments`, `appointments`, `appointment_events` e `webhook_events`.

Critério de saída: um pagamento aprovado confirma exatamente uma vez; replay não duplica evento, notificação ou mudança de estado.

Evidências: IDs sandbox mascarados, eventos persistidos e E2E da confirmação.

### Marco 5 — WhatsApp e lembretes

Prazo sugerido: 3–6 horas, condicionado à Meta.

- Definir consentimento e aprovar templates sem conteúdo sensível.
- Configurar número e credenciais de teste.
- Enviar confirmação após pagamento e lembrete agendado.
- Testar indisponibilidade, retry e limite de tentativas.
- Confirmar que falha de mensagem não altera o agendamento.

Critério de saída: job termina como `SENT` ou `FAILED` auditável, sem dados pessoais nos logs.

Alternativa acadêmica se a Meta bloquear: executar o adaptador fake, mostrar o registro completo do job e documentar a dependência externa como bloqueio de produção — sem afirmar envio real.

### Marco 6 — Estabilização e entrega

Prazo sugerido: 4–6 horas.

- Publicar uma nova versão no OpenAI Sites/Cloudflare e conectar o Supabase de teste.
- Executar CI, E2E autenticado, acessibilidade por teclado e responsividade.
- Revisar erros, vazios, datas, moeda e fuso.
- Executar smoke test, backup e ensaio de rollback.
- Atualizar rastreabilidade e gravar demonstração de 3–5 minutos.

Critério de saída: a jornada crítica passa integralmente no ambiente remoto com dados fictícios.

## Ordem de prioridade diária

| Ordem | Bloco | Pode avançar em paralelo? | Responsável principal |
|---:|---|---|---|
| 1 | GitHub + Supabase de teste | Não | Implementador + proprietário das contas |
| 2 | RLS e autenticação real | Parcialmente com interface | Implementador |
| 3 | Telas conectadas e reserva | Pacientes e agenda podem dividir execução | Implementador |
| 4 | Concorrência | Não; depende do banco real | Implementador |
| 5 | Mercado Pago | Sim, após reserva estável | Implementador + proprietário das credenciais |
| 6 | WhatsApp | Sim com pagamento | Implementador + proprietário da Meta |
| 7 | Preview, QA e vídeo | Não; consolida tudo | Implementador + revisão do aluno |

## Gates de decisão

- Não conectar provedores antes de RLS e reserva passarem no banco de teste.
- Não usar dados reais em nenhuma etapa.
- Não promover para produção com integração em modo `fake`.
- Não considerar pagamento confirmado pelo retorno do navegador.
- Não declarar WhatsApp real sem ID de mensagem do provedor.
- Não iniciar recursos da versão intermediária enquanto a jornada crítica falhar.

## Itens que ficam fora da finalização concentrada

- Múltiplas psicólogas operacionais.
- Secretária, clínicas e permissões delegadas.
- Calendário externo, unidades e tipos variados de sessão.
- Reembolso automatizado, exportações avançadas e aplicativo móvel.
- Qualquer informação clínica ou prontuário.

## Definition of Done do MVP

- Repositório privado organizado e CI verde.
- Supabase de teste recriável por migração.
- Autorização negativa e RLS verificadas.
- Telas críticas sem dados demonstrativos.
- Concorrência comprova uma única reserva por slot.
- Webhook sandbox confirma pagamento exatamente uma vez.
- Confirmação/lembrete possui resultado auditável.
- Preview remoto passa no E2E com dados fictícios.
- Backup, smoke test, rollback e rastreabilidade documentados.
- Demonstração acadêmica apresenta a jornada completa sem expor credenciais ou dados pessoais.

## Próxima ação do agente implementador

Começar pelo Marco 1: criar o ambiente Supabase de teste, executar a migração e produzir uma matriz objetiva de testes RLS. Nenhuma integração externa deve ser configurada antes desse gate.
