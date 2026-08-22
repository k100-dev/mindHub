# Contribuindo

## Fluxo recomendado

1. Crie uma branch curta a partir de `main`.
2. Faça mudanças pequenas e rastreáveis.
3. Execute `pnpm check` e `pnpm test:e2e`.
4. Atualize a documentação quando contratos, entidades ou decisões mudarem.
5. Abra um pull request descrevendo risco, teste e rollback.

## Padrões

- TypeScript estrito e validação no servidor.
- Regra de domínio testável fora da interface.
- Nenhum dado pessoal real em código, fixtures ou logs.
- Migrações versionadas e compatíveis sempre que possível.
- Ações externas idempotentes e com falha observável.
