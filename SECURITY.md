# Segurança

## Escopo de dados

O MindHub armazena somente informações administrativas. Prontuário, diagnóstico, evolução clínica, prescrição e documentos de saúde estão fora do escopo.

## Relato responsável

Não abra uma issue pública com vulnerabilidades, credenciais ou dados pessoais. Use o canal privado do proprietário do repositório.

## Regras para desenvolvimento

- Nunca versionar `.env.local`, tokens, chaves ou dumps com dados reais.
- Usar somente fixtures fictícias.
- Manter RLS ativa e testar autorização negativa.
- Confirmar pagamentos apenas por webhook autenticado.
- Mascarar identificadores pessoais em logs.
- Fazer backup antes de migrações destrutivas.

## Lançamento

O projeto não deve receber dados reais até a revisão de segurança/LGPD e a validação de backup, restauração, webhooks, rate limiting e consentimento do WhatsApp.
