# MindHub

Ferramenta de agenda e administração de pacientes para atendimento psicológico. A implantação atual atende uma profissional; a identidade do produto é independente dela. Não armazena prontuário ou conteúdo clínico.

## Versão 1.0

Cadastro com confirmação e visualização de senha, telefone, login por perfil, pacientes, disponibilidade e agenda persistente. Solicitações bloqueiam o horário sem expiração; sinal, confirmação e devolução são registrados manualmente. Cancelamento e remarcação seguem o limite de 24 horas acordado no projeto.

- Produção: https://themindhub.netlify.app
- [Novidades da v1.0](CHANGELOG.md): perfil privado com foto, descrição e hobbies, filtros revisados e linguagem mais neutra.
- [Escopo e regras vigentes](docs/ESCOPO-VIGENTE.md)
- [Guia de uso](docs/GUIA-DE-USO.md)
- [Evidências de validação](docs/VALIDACAO-BANCA.md)

## Desenvolvimento

Node.js 24+, `corepack pnpm install --frozen-lockfile`, configurar `.env.local` conforme `.env.example`, executar `corepack pnpm dev`.

Verificações: `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm build` e `corepack pnpm test:e2e`.

Migrações em `supabase/migrations`; teste transacional em `supabase/tests/manual-booking.sql`. Nunca versionar credenciais ou dados pessoais. A configuração histórica de Sites é preservada; a implantação existente utiliza Netlify e Supabase.

Antes de disponibilizar horários reais, a profissional deve configurar a disponibilidade e as instruções de pagamento. A plataforma não cobra nem transfere valores automaticamente.
