> Histórico anterior à revisão de 06/09/2026. Para comportamento e implantação vigentes, consulte `docs/ESCOPO-VIGENTE.md` e o README da raiz. Regras de webhook, reserva temporária e identidade exclusiva foram substituídas nesta entrega.

# Implantação, smoke test e rollback

## Destino

O único destino autorizado é o site Netlify existente `themindhub.netlify.app`. Não criar outro site e não usar `.openai/hosting.json` como destino.

## Promoção

1. Executar lint, tipos, testes unitários, build e E2E responsivo.
2. Confirmar as migrações e o teste RLS no projeto Supabase correto.
3. Verificar somente os nomes das variáveis do Netlify, sem expor valores.
4. Publicar um deploy de preview e executar smoke test remoto.
5. Promover o mesmo artefato para produção somente após a aprovação dos gates.
6. Registrar URL do preview, URL de produção e commit implantado.

Variáveis essenciais: `APP_ENV`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, chave pública Supabase, `SUPABASE_SERVICE_ROLE_KEY` e `PSYCHOLOGIST_ALLOWLIST`. Mercado Pago e WhatsApp exigem seus próprios segredos e modos explícitos.

## Smoke test

- página inicial não expõe agenda, CRP, localização ou especialidade inventada;
- `/app`, `/hub` e `/p/dra-isadora-bezerra/horarios` redirecionam visitante para login preservando `next`;
- `/cadastro/psicologa` e `/projeto` retornam 404;
- slots sem sessão retornam 401;
- paciente A não lê dados do paciente B;
- dois pedidos concorrentes ao mesmo horário produzem um sucesso e um conflito;
- webhooks sem assinatura ou integração configurada não confirmam nada.

## Rollback

Restaurar o deploy anterior pelo histórico do site Netlify. Migrações de banco não devem ser revertidas automaticamente; em incompatibilidade, restaurar backup em ambiente isolado, validar a integridade e só então promover a recuperação.

