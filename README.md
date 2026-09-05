# MindHub

Aplicação Next.js de agenda e administração de pacientes exclusiva de Isadora Bezerra. O sistema usa Supabase Auth/PostgreSQL/RLS e pode integrar Mercado Pago e WhatsApp Cloud API. Não armazena prontuário nem informação clínica.

## Estado atual

- Página pública centrada no atendimento de Isadora, sem agenda pública ou alegações profissionais não verificadas.
- Cadastro público somente para paciente; cadastro profissional desativado.
- Painel profissional e hub do paciente fechados quando a sessão ou o perfil autorizado não existe.
- Agenda, pacientes, disponibilidade, bloqueios, relatórios e perfis ligados ao Supabase real.
- Reserva concorrente protegida no PostgreSQL e motivos de bloqueio invisíveis para pacientes.
- Recuperação de senha por PKCE, callback interno validado e redirecionamento `next` preservado por papel.
- Integrações externas falham de forma explícita quando não configuradas; não há confirmação simulada.
- 13 tabelas com RLS, grants explícitos e testes SQL com dois pacientes isolados.

## Desenvolvimento

Requisitos: Node.js 24+ e pnpm.

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Verificação completa:

```powershell
pnpm check
pnpm test:e2e
```

As migrações ficam em `supabase/migrations` e o teste de isolamento em `supabase/tests/rls.sql`. Nunca versione `.env.local`, tokens, chaves ou dados pessoais.

## Operação

A produção existente é [themindhub.netlify.app](https://themindhub.netlify.app/). O arquivo `.openai/hosting.json` é preservado apenas por compatibilidade histórica e não define o destino de publicação deste sistema.

Antes de aceitar agendamentos reais, é obrigatório provisionar a conta de Isadora, configurar `PSYCHOLOGIST_ALLOWLIST`, criar a disponibilidade e validar credenciais reais ou sandbox do Mercado Pago. WhatsApp deve permanecer identificado como não habilitado até credenciais e templates aprovados existirem.

Consulte [Guia de uso](docs/GUIA-DE-USO.md), [Implantação](docs/DEPLOYMENT.md), [Arquitetura](docs/ARQUITETURA.md) e [Segurança](SECURITY.md).

