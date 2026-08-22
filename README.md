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

As páginas usam dados fictícios para permitir demonstração visual sem credenciais. Operações persistentes informam quando o Supabase ainda não está configurado.

## Executar localmente

Requisitos: Node.js 24+, pnpm e, para persistência, Supabase CLI/Docker.

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Acesse `http://localhost:3000`. A agenda demonstrativa está em `/p/dra-isadora-bezerra`.

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
```

## Regras de produção

- Separe os projetos Vercel e Supabase de teste e produção.
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
