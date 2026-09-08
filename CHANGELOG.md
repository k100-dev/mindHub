# MindHub

## 1.0.0 — 08/09/2026

- Linguagem do paciente mais direta na página inicial, no acesso e nos agendamentos.
- Meu perfil com foto própria, prévia do recorte, troca e remoção da imagem.
- Descrição opcional de até 600 caracteres e até 12 hobbies personalizados.
- Apresentação privada, persistida na conta; fotos em armazenamento privado com acesso restrito ao proprietário.
- Seções de apresentação e contato preservam as edições durante a alternância.
- Busca de pacientes separada dos filtros de status, com contadores e limpeza dos filtros.
- Navegação com estados de foco, cursor de ação e transições discretas que respeitam a preferência de movimento reduzido.
- Agendamentos encerrados, expirados e remarcados classificados no histórico.

Validação: lint, TypeScript, build de produção, 15 testes unitários/de componentes e 30 testes de navegação em cinco tamanhos de tela. Teste transacional de isolamento entre pacientes executado com rollback no Supabase.

Limites: os testes de navegação públicos não cobrem sessões reais da profissional nem transações de pagamento. Permanecem os avisos de configuração do Supabase sobre descoberta de schema GraphQL por usuários autenticados e proteção contra senhas vazadas; as políticas RLS continuam restringindo as linhas acessíveis. Não há cobrança automática.
