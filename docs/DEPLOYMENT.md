# Implantação, smoke test e rollback

## Ambientes

Use projetos independentes: desenvolvimento local, Vercel Preview + Supabase de teste, e produção. Nunca compartilhe service role, webhook secret ou tokens entre ambientes.

## Promoção

1. Validar `pnpm check`.
2. Recriar um banco temporário com todas as migrações.
3. Implantar preview e executar `pnpm test:e2e`.
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

- Reverter a implantação da aplicação para o release anterior na Vercel.
- Não reverter migrações destrutivas automaticamente.
- Para schema incompatível, restaurar o backup em projeto isolado, validar integridade e só então promover.
- Manter webhooks respondendo 200 para eventos já registrados durante a recuperação.
