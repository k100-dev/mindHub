# Segurança

## Limite de dados

O MindHub armazena somente dados administrativos. Não registre diagnóstico, evolução, anamnese, prescrição, documentos de saúde ou conteúdo de sessão.

## Controles implementados

- autorização obtida dos perfis no banco, nunca de `user_metadata`;
- cadastro público sempre cria paciente;
- acesso profissional exige allowlist, conta ativa, verificação e slug canônico de Isadora;
- RLS em todas as 13 tabelas, grants explícitos e nenhum grant de tabela para `anon`;
- agenda e slots somente para paciente ativo autenticado;
- bloqueios e `administrative_reason` restritos à profissional;
- funções `SECURITY DEFINER` com `search_path` fixo e validação interna de ator;
- confirmação de pagamento somente após webhook assinado e idempotente;
- nenhuma integração falsa produz sucesso.

O teste `supabase/tests/rls.sql` cria identidades sintéticas dentro de uma transação, valida isolamento entre dois pacientes e executa `ROLLBACK`.

## Antes de dados reais

Concluir revisão jurídica/LGPD, retenção e exclusão; validar backup e restauração; configurar rate limiting e observabilidade; testar webhooks e concorrência; revisar acesso de produção e rotação de segredos.

Vulnerabilidades, segredos e dados pessoais devem ser enviados apenas ao proprietário por canal privado, nunca em issue pública.

