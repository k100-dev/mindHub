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

A versão publicada passou no ciclo completo de agenda, incluindo edição, inativação, reativação e observação administrativa do paciente.

A URL do site e os retornos autorizados foram corrigidos no painel Supabase para o domínio de produção. O teste de convite, gerado sem envio de e-mail, abriu a definição de senha no endereço correto, atualizou a senha e permitiu login. A revisão `1885de4` corrigiu o estabelecimento de sessão para convites. A entrega na caixa de entrada continua fora da evidência automatizada.

## Refinamento de experiência

Página inicial com identidade acolhedora e mensagem “Um tempo para você.”; acesso profissional identificado na navegação de entrada; navegação móvel do paciente; escolha de dia e horário; calendário profissional por dia, semana e mês; separação de próximos encontros e histórico; configurações agrupadas em contato, atendimento e apresentação.

Os 30 testes públicos incluem os botões e links principais, abertura das perguntas frequentes, preservação do destino após login e ampliação do texto a 200%.

## Publicação final do refinamento

Commit `647a109`, publicado por Git na branch principal. O Netlify executou o build automático; deploy `6a9f5dba09d5720008f269b6` concluído. O fluxo completo foi repetido no domínio público com a conta profissional vinculada ao e-mail escolhido pelo responsável.

Também aprovados no navegador: seleção do mês e dia, criação de atendimento pela profissional, alternância entre histórico e próximos encontros e navegação profissional nas cinco larguras. O retorno de recuperação com parâmetro `next` foi verificado no Supabase. As contas sintéticas foram removidas ao final.

A definição da senha pessoal da profissional é realizada diretamente pelo responsável, sem compartilhamento de senha no chat.
