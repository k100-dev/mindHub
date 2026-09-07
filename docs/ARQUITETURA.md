> Histórico anterior à revisão de 06/09/2026. Para comportamento e implantação vigentes, consulte `docs/ESCOPO-VIGENTE.md` e o README da raiz. Regras de webhook, reserva temporária e identidade exclusiva foram substituídas nesta entrega.

# Arquitetura do MindHub

## Visão geral

O MindHub é um monólito modular em Next.js. A aplicação web, os contratos HTTP e a integração com o Supabase ficam no mesmo repositório, reduzindo a complexidade de implantação sem misturar as regras de domínio aos adaptadores externos.

```text
Navegador
  ├─ Área pública
  ├─ Portal da psicóloga
  └─ Hub do paciente
        │
        ▼
Next.js — páginas, validação e Route Handlers
  ├─ Domínio de agenda e agendamentos
  ├─ Adaptador Mercado Pago
  └─ Adaptador WhatsApp Cloud API
        │
        ▼
Supabase — Auth, PostgreSQL, RLS, Cron e Edge Functions
```

## Limites dos módulos

- `src/app`: apresentação e contratos HTTP.
- `src/components`: interface reutilizável e estados de interação.
- `src/lib/domain`: regras puras, sem dependência de rede.
- `src/lib/integrations`: Mercado Pago e WhatsApp atrás de adaptadores.
- `src/lib/supabase`: sessão, cliente público e cliente administrativo.
- `supabase/migrations`: fonte executável do modelo e das garantias transacionais.

## Jornada crítica

1. O paciente ativo e autenticado consulta slots privados.
2. `create_appointment_hold` valida disponibilidade e cria uma reserva temporária.
3. Uma restrição GiST no PostgreSQL impede sobreposição concorrente.
4. O checkout é criado no Mercado Pago.
5. Somente o webhook assinado consulta o provedor e confirma o agendamento.
6. A confirmação cria um job de WhatsApp; falha de mensagem não desfaz pagamento.

## Segurança estrutural

- RLS isola perfis, vínculos, pacientes e agendamentos.
- Operações administrativas exigem psicóloga ativa.
- Webhooks têm autenticação, idempotência e hash de payload.
- Dados pessoais não aparecem em mensagens de erro; telefones são mascarados nos jobs.
- Nenhum modo de integração pode usar simulação quando `APP_ENV=production`.
