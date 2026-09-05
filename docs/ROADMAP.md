# Roadmap

## Concluído

- Experiência pública responsiva centrada na Isadora, sem agenda exposta.
- Cadastro e autenticação de pacientes, recuperação de senha e rotas privadas.
- Painéis de paciente e profissional alimentados por dados reais.
- Supabase remoto com schema, migrações, RLS e funções transacionais aplicadas.
- Agenda, disponibilidade, bloqueios, pacientes, relatórios e reserva protegidos.
- Elevação profissional limitada à allowlist e ao perfil verificado da Isadora.
- Testes unitários, E2E responsivos, build e teste SQL de isolamento entre usuários.
- Documentação operacional, arquitetura, segurança e implantação atualizadas.

## Ativação operacional

- Criar ou confirmar a conta Auth real da Isadora e promover seu perfil por fluxo administrativo.
- Cadastrar o CRP e os demais dados profissionais verdadeiros antes de exibi-los.
- Configurar URLs de redirecionamento do Supabase Auth para produção e previews autorizados.
- Configurar SMTP e validar cadastro, confirmação e recuperação de senha ponta a ponta.
- Inserir disponibilidade real para liberar o agendamento aos pacientes.
- Configurar Mercado Pago; até lá, novas reservas permanecem desabilitadas de forma explícita.
- Configurar WhatsApp apenas após aprovação das credenciais e templates reais.

## Antes do uso com pacientes reais

- Revisão formal de LGPD, consentimento, retenção e anonimização.
- Testes de segurança, acessibilidade e concorrência com contas reais controladas.
- Backup restaurável, alertas, observabilidade e runbook de incidentes.
- Credenciais produtivas, domínio definitivo e rate limits de borda.

## Evolução posterior

- Cancelamento e remarcação pelo paciente.
- Exportações e painel de falhas.
- Calendário externo e múltiplos tipos de sessão.
- Suporte a uma segunda profissional somente após decisão explícita de produto e revisão das políticas.
