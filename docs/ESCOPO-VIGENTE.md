# Escopo vigente - revisão de 06/09/2026

Esta especificação substitui as regras anteriores de exclusividade de identidade, expiração de reservas e confirmação por webhook nesta entrega. Os documentos anteriores são histórico de decisões.

## Produto e acesso

MindHub é uma ferramenta de organização de atendimentos. Isadora Bezerra é a profissional da implantação inicial. Não há cadastro público de profissionais nem cobrança de assinatura nesta versão. Pacientes criam contas e acessam apenas seus dados. A profissional precisa de conta ativa, perfil verificado e e-mail autorizado na configuração do servidor.

## Regras acordadas

1. Sessão inicial de 60 minutos a R$ 150, sinal de R$ 75. Duração, preço e sinal configuráveis separadamente. Cada agendamento conserva uma cópia desses valores.
2. Solicitar um horário cria imediatamente um agendamento pendente e bloqueia o intervalo. Não há expiração automática. O dashboard destaca a pendência e atualiza enquanto estiver aberto.
3. A interface mostra “Agendamento pendente” e “A psicóloga irá confirmar seu horário em breve!”. A profissional confere o pagamento externo, registra o total recebido, entra em contato e confirma o atendimento. Registrar dinheiro recebido não confirma a consulta.
4. O paciente pode cancelar um atendimento futuro. Com pelo menos 24 horas de antecedência, o total efetivamente pago fica pendente de devolução manual. Abaixo de 24 horas não há reembolso pela regra definida para o projeto. A plataforma não executa a transferência.
5. A profissional registra a devolução somente após realizá-la. Se um pagamento anterior ao cancelamento ainda não estiver registrado, pode registrá-lo e processar a pendência. Cancelamento pela profissional gera devolução integral do valor recebido.
6. O paciente pode remarcar com pelo menos 24 horas de antecedência do horário atual. O mesmo agendamento muda de intervalo, conserva sinal e preço e volta a pendente. Abaixo desse prazo a tela orienta contato com a profissional.
7. Uma transação única valida e altera o horário. Se houver conflito, o agendamento original é conservado. Intervalos adjacentes são permitidos; intervalos sobrepostos não.
8. A profissional define disponibilidade e bloqueios, gerencia vínculos de pacientes, edita dados administrativos e registra conclusão ou ausência após o fim previsto.

## Limites

Pagamentos automáticos, videochamadas, prontuários, assinatura SaaS e envio automático de notificações por WhatsApp são evoluções futuras. A notificação desta versão é a pendência no dashboard. As regras de cancelamento aqui documentadas são requisitos definidos para o projeto, não parecer jurídico.

## Fonte executável

Autenticação Supabase; autorização no servidor por perfil; leituras protegidas por RLS; mutações críticas por funções PostgreSQL acessíveis somente ao servidor. Migrações de fluxo manual e proteção de privilégios fazem parte desta revisão. Motivos de bloqueios internos não aparecem ao paciente.
