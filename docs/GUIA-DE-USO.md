# Guia de uso do MindHub

## Visitante e paciente

Na página inicial, use **Agendar atendimento**. O visitante cria uma conta de paciente ou entra em uma conta existente. A disponibilidade aparece apenas depois da autenticação e somente quando Isadora possuir perfil verificado e horários ativos.

O hub do paciente mostra exclusivamente os próprios agendamentos e dados de contato. Ele não exibe bloqueios internos, motivos administrativos nem dados de outra pessoa.

## Isadora Bezerra

Não existe cadastro profissional público. A conta é provisionada de forma administrativa e só acessa `/app` quando o e-mail está em `PSYCHOLOGIST_ALLOWLIST`, o perfil está ativo e o perfil profissional está verificado com o slug canônico.

No painel, Isadora pode cadastrar ou convidar pacientes, organizar agenda, definir disponibilidade, criar bloqueios, atualizar estados e consultar relatórios administrativos.

## Integrações

Mercado Pago e WhatsApp mostram **Não habilitado** enquanto as respectivas credenciais não estiverem configuradas. O sistema não cria pagamentos, envios ou confirmações fictícias. O retorno do navegador informa apenas que a verificação está em andamento; a confirmação depende do webhook assinado.

## Recuperação de senha

Use **Esqueci minha senha** na tela de entrada. O link recebido passa pelo callback seguro e abre `/auth/atualizar-senha` para definir uma nova senha.

