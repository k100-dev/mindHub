# Implantação, smoke test e rollback

## Ambientes

Use projetos independentes: desenvolvimento local, OpenAI Sites para a interface demonstrativa, Supabase de teste e produção. Nunca compartilhe service role, webhook secret ou tokens entre ambientes.

O deployment atual no Sites apresenta a demonstração com dados fictícios e o plano em `/projeto`. Ele não transforma provedores fake em integrações reais. Operações persistentes exigem variáveis autorizadas e um projeto Supabase compatível.

URL acadêmica: `https://mindhub-agenda.comercialeliarachave.chatgpt.site`.

Enquanto o Supabase não estiver conectado, UC01 e UC02 usam armazenamento local do navegador, explicitamente sinalizado na interface. Limpar os dados do site no navegador restaura a massa inicial fictícia.

## Promoção

1. Validar `pnpm check`.
2. Recriar um banco temporário com todas as migrações.
3. Validar `pnpm sites:build`, salvar a versão no Sites e executar o smoke test remoto.
4. Confirmar modos e segredos de integração.
5. Fazer backup do banco produtivo.
6. Aplicar somente migrações compatíveis.
7. Promover manualmente e executar smoke test.

## Smoke test

- Página inicial e agenda pública respondem.
- Conta pendente não entra no painel profissional.
- Dois pedidos concorrentes ao mesmo slot geram um sucesso e um conflito.
- Webhook repetido retorna sucesso sem duplicar evento ou confirmação.
- Paciente vê somente seus agendamentos.
- Job de WhatsApp registra envio ou retry, sem reverter pagamento.

## Rollback

- Reverter a implantação da aplicação para a versão anterior salva no Sites.
- Não reverter migrações destrutivas automaticamente.
- Para schema incompatível, restaurar o backup em projeto isolado, validar integridade e só então promover.
- Manter webhooks respondendo 200 para eventos já registrados durante a recuperação.
