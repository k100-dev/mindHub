# Validação da revisão para banca

Data: 06/09/2026. Dados sintéticos; usuários e reservas temporários removidos ao fim dos testes. Nenhum convite ou mensagem foi enviado a pacientes reais.

## Verificações concluídas

- Análise estática, tipos e 8 testes unitários aprovados.
- Build de produção Next.js aprovado.
- 30 verificações de navegação e responsividade aprovadas, em 320, 375, 768, 1024 e 1440 pixels.
- Teste transacional PostgreSQL aprovado: reserva persistente, intervalo concorrente, isolamento entre pacientes, sinal antes da confirmação, remarcação sem perda do original em conflito, preservação dos valores, limite exato de 24 horas, cancelamento tardio e registro de reembolso.
- Teste completo pelo navegador com banco real: login de paciente, duas solicitações simultâneas (201 e 409), pendência no dashboard, pagamento de R$ 75, confirmação, remarcação, cancelamento e devolução manual.
- Áreas profissionais verificadas sem rolagem horizontal indevida em 320, 375, 768, 1024 e 1366 pixels. Nenhum erro JavaScript não tratado durante o fluxo completo.

## Limites da evidência

Os testes usam contas criadas administrativamente, confirmadas para não enviar e-mails. A entrega efetiva de mensagens de cadastro/recuperação na caixa de entrada não foi validada. O cadastro valida senhas e telefone no servidor e utiliza Supabase Auth. Não houve movimentação financeira real. Os testes não equivalem a homologação clínica, teste de carga ou garantia de ausência de defeitos.

Disponibilidade real e dados Pix devem ser informados/configurados pela profissional antes de abrir a agenda a pacientes.

## Atualização de 07/09/2026

A versão hospedada e o endereço principal passaram no fluxo completo, incluindo edição, inativação, reativação e observação administrativa do paciente. Deploy validado: `6a9f0adf895c552691fbc730`, revisão `1a130b9`.

**Pendência de configuração encontrada em teste:** o Supabase redireciona links de convite para `http://localhost:3000`, porque a URL do site e os retornos autorizados ainda precisam ser corrigidos no painel de autenticação. A configuração desejada está em `supabase/config.toml`, mas a alteração remota depende de login no painel, indisponível no conector desta sessão. Cadastro com confirmação, convite e recuperação por e-mail não devem ser considerados homologados enquanto essa correção e o reteste não forem concluídos. Login por senha e o ciclo de agenda foram aprovados.

No painel Supabase, Authentication > URL Configuration: Site URL `https://themindhub.netlify.app`; Redirect URLs `https://themindhub.netlify.app/auth/callback` e `https://themindhub.netlify.app/auth/atualizar-senha`. Preservar endereços locais necessários ao desenvolvimento. O convite foi ajustado para abrir diretamente a definição de senha.
