# MindHub

Aplicação web para gestão administrativa de pacientes, agenda, sinal de consulta e lembretes de uma psicóloga. O MVP é um monólito modular em Next.js, com PostgreSQL/Auth no Supabase, Checkout Pro do Mercado Pago e WhatsApp Cloud API.

> O MindHub não é prontuário. Não registre diagnósticos, evolução clínica, prescrições ou outros dados sensíveis de saúde.

## Estado implementado

- Interface pública, portal da psicóloga e hub do paciente responsivos.
- Cadastro, login, confirmação de e-mail e recuperação de senha via Supabase Auth.
- Ativação profissional controlada por `PSYCHOLOGIST_ALLOWLIST`.
- Schema PostgreSQL completo, RLS, auditoria, histórico de estados e migração reproduzível.
- Disponibilidade recorrente, bloqueios, agenda e slots públicos.
- Reserva temporária transacional com restrição anti-double-booking no banco.
- Checkout Pro com modos `fake`, `sandbox` e `production`.
- Webhooks autenticados e idempotentes; retorno do navegador não confirma pagamento.
- Adaptador WhatsApp e processamento de notificações com retry.
- APIs de pacientes, agenda, acompanhamento e relatórios básicos.
- Testes unitários, smoke E2E, lint, tipos e build em CI.
- Gate acadêmico navegável de UC01 e UC02: pacientes podem ser cadastrados, buscados, inativados e reativados; agendamentos podem ser criados nas visões de dia, semana e mês, com bloqueio de conflito.

Sem credenciais, UC01 e UC02 operam em **modo demonstrativo**, identificado na interface e persistido apenas no `localStorage` do navegador. Com Supabase configurado, os formulários e APIs usam a camada persistente. O modo demonstrativo comprova a jornada acadêmica, mas não equivale à prontidão de produção.

## Roteiro rápido da banca

1. Abra `/app/pacientes`, busque um cadastro e altere seu estado.
2. Use `+ Novo paciente` para criar um registro fictício.
3. Abra `/app/agenda`, alterne entre dia, semana e mês e crie um agendamento.
4. Repita paciente, data e horário para demonstrar o bloqueio de conflito.
5. Abra `/app/disponibilidade` para salvar a grade semanal e registrar um bloqueio.
6. Use `/projeto` para apresentar a separação entre o gate acadêmico demonstrável e o gate de produção.

## Executar localmente

Requisitos: Node.js 24+, pnpm e, para persistência, Supabase CLI/Docker.

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Acesse `http://localhost:3000`. A agenda demonstrativa está em `/p/dra-isadora-bezerra` e o estado real da entrega está em `/projeto`.

Para o banco local:

```powershell
supabase start
supabase db reset
```

Copie as chaves retornadas pelo Supabase para `.env.local`. Nunca versione `.env.local`.

## Qualidade

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm sites:build
```

O comando `sites:build` gera o pacote compatível com OpenAI Sites/Cloudflare Workers. O vínculo de hospedagem fica versionado em `.openai/hosting.json`; credenciais e tokens nunca entram no repositório. A publicação acadêmica vigente é [mindhub-agenda.comercialeliarachave.chatgpt.site](https://mindhub-agenda.comercialeliarachave.chatgpt.site).

## Regras de produção

- Separe a hospedagem da interface e os projetos Supabase de teste e produção.
- Configure os modos de pagamento e WhatsApp explicitamente; produção nunca faz fallback para simulação.
- Cadastre os webhooks em `/api/webhooks/mercadopago` e `/api/webhooks/whatsapp`.
- Acione `/api/internal/process-notifications` apenas com `Authorization: Bearer <CRON_SECRET>`.
- Faça backup e teste rollback antes de migração destrutiva.
- Use somente dados fictícios até revisão formal de segurança, LGPD, retenção e consentimento.

## Estrutura

- `src/app`: páginas e APIs.
- `src/components`: componentes visuais e formulários.
- `src/lib/domain`: regras puras do domínio.
- `src/lib/integrations`: adaptadores externos.
- `src/lib/supabase`: clientes e sessão.
- `supabase/migrations`: schema, funções transacionais e RLS.
- `supabase/functions`: trabalho agendado.
- `e2e`: testes da jornada pública e responsividade.
- `.openai/hosting.json` e `vite.config.ts`: empacotamento e vínculo com OpenAI Sites.

## Documentação

- [Arquitetura](docs/ARQUITETURA.md)
- [Roadmap](docs/ROADMAP.md)
- [Plano de ação concentrado](docs/PLANO-DE-ACAO-CONCENTRADO.md)
- [Matriz de entregáveis do estágio](docs/MATRIZ-DE-ENTREGAVEIS-DO-ESTAGIO.md)
- [Rastreabilidade](docs/RASTREABILIDADE.md)
- [Implantação e rollback](docs/DEPLOYMENT.md)
- [Reconciliação inicial](docs/REC-01-RECONCILIACAO.md)
- [Política de segurança](SECURITY.md)
- [Como contribuir](CONTRIBUTING.md)

## Decisões pendentes antes do lançamento real

- Prazo final de reserva, cancelamento e remarcação.
- Política jurídica de retenção, anonimização e exclusão.
- Consentimento e templates aprovados do WhatsApp.
- Credenciais produtivas e plano de backup.
- Numeração acadêmica oficial de UC03/UC04.
