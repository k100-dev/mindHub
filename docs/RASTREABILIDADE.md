> Histórico anterior à revisão de 06/09/2026. Para comportamento e implantação vigentes, consulte `docs/ESCOPO-VIGENTE.md` e o README da raiz. Regras de webhook, reserva temporária e identidade exclusiva foram substituídas nesta entrega.

# Rastreabilidade do MVP

| Capacidade | Página | Persistência/contrato | Teste principal |
|---|---|---|---|
| Cadastro e acesso | `/entrar`, `/cadastro/*` | Supabase Auth, `profiles` | autorização negativa |
| Pacientes (UC01) | `/app/pacientes` | `/api/patients`, vínculos e auditoria | duplicidade/inativação |
| Agenda (UC02) | `/app/agenda`, `/app/disponibilidade` | regras, bloqueios e `/api/agenda` | conflito e fuso |
| Agendamento público | `/p/[slug]` | slots e `create_appointment_hold` | concorrência |
| Pagamento | `/pagamento/retorno` | checkout, `payments`, webhook | assinatura/replay |
| Acompanhamento | `/hub/agendamentos` | `/api/patient/appointments` | isolamento por proprietário |
| Status | detalhe do agendamento | `transition_appointment` | transição inválida 409 |
| WhatsApp | integrações | jobs e webhooks | retry/falha externa |
| Relatórios | `/app/relatorios` | `/api/reports/summary` | reconciliação de contagens |
