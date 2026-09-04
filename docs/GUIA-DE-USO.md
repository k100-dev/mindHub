# Guia de uso do MindHub

## Acesso público

O endereço principal é [TheMindHub.netlify.app](https://themindhub.netlify.app/). A página inicial é voltada para pacientes: a ação principal é consultar horários e iniciar um agendamento.

## Modo demonstração

O ambiente público atual funciona sem credenciais quando o Supabase não está configurado. Isso permite apresentar as jornadas UC01 e UC02 com dados fictícios.

1. Abra `/app/pacientes` para cadastrar, buscar, inativar e reativar pacientes.
2. Abra `/app/agenda` para criar agendamentos nas visões de dia, semana e mês.
3. Tente criar duas vezes o mesmo paciente, data e horário para demonstrar a prevenção de conflito.
4. Abra `/app/disponibilidade` para editar horários recorrentes e registrar bloqueios.
5. Use `/p/dra-isadora-bezerra` para visualizar a agenda pública e iniciar o fluxo do paciente.

Neste modo, os dados ficam somente no navegador e podem ser apagados ao limpar o armazenamento do site. Não use dados reais de pacientes.

## Login e credenciais

Não existe uma credencial fixa ou conta de demonstração compartilhada no repositório. Não é seguro inventar ou versionar uma senha.

Quando o Supabase estiver configurado no ambiente publicado:

1. A psicóloga cria a conta em `/cadastro/psicologa` com nome, e-mail, telefone, CRP e uma senha de pelo menos 10 caracteres.
2. Ela confirma o e-mail recebido.
3. A conta permanece pendente até ser autorizada pela allowlist do ambiente (`PSYCHOLOGIST_ALLOWLIST`).
4. Depois da ativação, o login em `/entrar` direciona para `/app`.
5. O paciente cria a própria conta em `/cadastro/paciente` e, após confirmar o e-mail, usa o `/hub` para acompanhar seus agendamentos.

Portanto, para uso real ainda é necessário configurar as variáveis do Supabase no Netlify e criar as primeiras contas pelo formulário. O modo demonstração não substitui autenticação, persistência, pagamento ou WhatsApp reais.

## Operação diária esperada

- Psicóloga: configurar perfil, disponibilidade e bloqueios; revisar pacientes; acompanhar agenda; atualizar estados dos atendimentos; conferir relatórios.
- Paciente: abrir o perfil público, escolher um horário, criar ou acessar sua conta, concluir o fluxo de sinal e acompanhar a confirmação no Hub.
- Administrador técnico: manter segredos somente nas variáveis protegidas do ambiente e revisar logs, webhooks, backup e política LGPD.

## Limites atuais

O release público é uma fundação demonstrativa navegável. A persistência real no Supabase, o Checkout Pro do Mercado Pago e o envio de WhatsApp dependem de credenciais e configuração dos ambientes. Até esses gates serem validados, use apenas dados fictícios.
