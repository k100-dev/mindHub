# Coerência integrada e prontidão do MindHub

Status pretendido no tracker: `ready-for-agent`

## Problem Statement

O MindHub possui uma fundação funcional, mas o comportamento executável, as telas demonstrativas, os testes e os artefatos acadêmicos descrevem versões diferentes do produto. Parte das interfaces ainda usa dados fictícios apesar de existirem contratos persistentes; os testes atuais provam somente regras puras e navegação pública básica; e os diagramas de caso de uso, classe, entidade-relacionamento, sequência, estado e implantação contêm atores, entidades, transições e infraestrutura desatualizados.

O aluno precisa apresentar um produto academicamente coerente e, simultaneamente, evoluir o mesmo código-base em direção à produção. Sem gates distintos, a demonstração pode ser descrita indevidamente como produção, enquanto riscos reais de autorização, concorrência, pagamento, notificação, LGPD e recuperação permanecem sem evidência.

## Solution

Consolidar um catálogo canônico de atores, termos e casos de uso; conectar as jornadas críticas aos contratos persistentes; corrigir as regras de maior risco; criar uma matriz de rastreabilidade que liga requisito, caso de uso, tela, contrato, regra, persistência, UML e teste; e regenerar os diagramas a partir do produto reconciliado.

O trabalho será avaliado por dois gates independentes. O Gate de Demonstração Acadêmica aceita dados e provedores fictícios claramente identificados, mas exige coerência e evidência reproduzível. O Gate de Prontidão de Produção herda todo o gate acadêmico e acrescenta persistência real, isolamento, integrações, segurança, LGPD, backup, observabilidade e aprovações externas. Nenhum dado real de paciente pode ser usado antes de todo o gate de produção ser aprovado.

## User Stories

1. Como visitante, quero entender que o MindHub é uma plataforma administrativa, para não confundi-lo com um prontuário clínico.
2. Como visitante, quero conhecer a psicóloga e consultar horários disponíveis sem autenticação, para decidir se desejo iniciar um agendamento.
3. Como visitante, quero ser direcionado ao cadastro ou login somente quando tentar reservar, para explorar a disponibilidade antes de criar uma conta.
4. Como paciente, quero criar e confirmar minha conta, para acessar operações identificadas com segurança.
5. Como paciente, quero recuperar meu acesso, para não depender de intervenção manual.
6. Como paciente, quero gerenciar somente os campos permitidos do meu Perfil do Paciente, para manter meus dados administrativos atualizados.
7. Como paciente, quero selecionar um horário e criar uma Reserva temporária com prazo visível, para concluir o Sinal sem perder o horário imediatamente.
8. Como paciente, quero ser impedido de pagar uma Reserva temporária expirada, para não pagar por um horário que voltou a ficar disponível.
9. Como paciente, quero receber uma resposta clara quando outro paciente ocupar o mesmo horário, para escolher uma alternativa.
10. Como paciente, quero iniciar um checkout explicitamente identificado como fictício, sandbox ou produção, para entender a natureza da transação.
11. Como paciente, quero que o retorno do checkout apenas mostre o estado da verificação, para que um redirecionamento do navegador não confirme indevidamente o pagamento.
12. Como paciente, quero que um pagamento aprovado confirme meu Agendamento exatamente uma vez, para evitar estados e comunicações duplicados.
13. Como paciente, quero acompanhar somente meus Agendamentos, para preservar a privacidade entre contas.
14. Como paciente, quero visualizar detalhes, estado, pagamento e comunicações administrativas de um Agendamento, para compreender sua situação.
15. Como psicóloga, quero cadastrar minha conta e permanecer pendente até ativação autorizada, para impedir autoelevação de privilégio.
16. Como psicóloga ativa, quero gerenciar meu perfil profissional e disponibilidade pública, para oferecer horários corretos.
17. Como psicóloga, quero criar, localizar, visualizar e atualizar pacientes administrativos, para operar o atendimento sem registrar conteúdo clínico.
18. Como psicóloga, quero registrar somente Observações administrativas claramente identificadas, para evitar o uso acidental do MindHub como prontuário.
19. Como psicóloga, quero inativar ou reativar um Vínculo Profissional–Paciente sem suspender globalmente o Perfil do Paciente, para que os dois ciclos de vida permaneçam independentes.
20. Como psicóloga, quero configurar disponibilidade recorrente, para publicar slots consistentes com minha agenda.
21. Como psicóloga, quero criar um Bloqueio de agenda com motivo administrativo privado, para retirar períodos sem expor o motivo ao público.
22. Como psicóloga, quero ser avisada quando um novo Bloqueio de agenda conflitar com um Agendamento vigente, para resolver o compromisso existente conscientemente.
23. Como psicóloga, quero que alterar a disponibilidade futura não cancele Agendamentos existentes, para preservar compromissos já assumidos.
24. Como psicóloga, quero visualizar minha agenda persistida e os detalhes de cada Agendamento, para trabalhar com dados atuais e não com demonstrações estáticas.
25. Como psicóloga, quero executar somente transições de estado válidas, para manter o histórico coerente.
26. Como psicóloga, quero visualizar relatórios reconciliados com os Agendamentos persistidos, para tomar decisões administrativas confiáveis.
27. Como proprietária dos dados, quero que uma psicóloga nunca acesse pacientes ou Agendamentos de outra profissional, para garantir isolamento entre profissionais.
28. Como responsável pelo produto, quero que webhooks inválidos sejam rejeitados e eventos repetidos sejam idempotentes, para impedir fraude e duplicação.
29. Como responsável pelo produto, quero que um evento externo que falhou possa ser reprocessado de forma controlada, para não transformar a primeira falha em perda permanente.
30. Como responsável pelo produto, quero que jobs de notificação sejam reivindicados atomicamente, para que trabalhadores concorrentes não enviem mensagens duplicadas.
31. Como responsável pelo produto, quero que falhas de WhatsApp gerem retry e auditoria sem desfazer o pagamento, para manter os domínios desacoplados.
32. Como avaliador acadêmico, quero que UC01 a UC05 usem os mesmos atores e nomes em todos os documentos, para compreender o escopo sem contradições.
33. Como avaliador acadêmico, quero distinguir diagramas conceituais de diagramas executáveis, para interpretar corretamente cada representação.
34. Como avaliador acadêmico, quero rastrear cada requisito até uma evidência no produto, para verificar que a documentação corresponde ao release demonstrado.
35. Como aluno, quero que o pacote acadêmico identifique o commit demonstrado e as limitações restantes, para apresentar resultados honestos e reproduzíveis.
36. Como operador, quero ambientes independentes e segredos separados, para evitar que testes afetem produção.
37. Como operador, quero aplicar as migrações do zero e executar um smoke test, para comprovar que o ambiente é reproduzível.
38. Como operador, quero restaurar um backup em ambiente isolado e ensaiar rollback, para comprovar recuperabilidade.
39. Como responsável por LGPD, quero revisar finalidade, consentimento, retenção, anonimização, exclusão e atendimento ao titular, para autorizar ou bloquear o uso real.
40. Como equipe, quero que a CI execute todas as verificações automatizadas obrigatórias para o gate correspondente, para impedir evidência divergente entre máquinas.

## Implementation Decisions

- O mesmo código-base terá Gate de Demonstração Acadêmica e Gate de Prontidão de Produção independentes.
- A linguagem canônica será mantida no glossário do contexto; sinônimos evitados não serão reintroduzidos nos diagramas ou testes.
- O MindHub permanecerá administrativo e não clínico.
- Os atores humanos canônicos serão Visitante, Paciente e Psicóloga. Administrador, secretária, clínica e bot não pertencem ao release atual.
- O catálogo canônico será UC01 Gerenciar Pacientes, UC02 Gerenciar Agenda, UC03 Solicitar Agendamento, UC04 Acompanhar Agendamentos e UC05 Gerenciar Perfil.
- Autenticação, pagamento e notificação serão comportamentos de suporte, não novos atores humanos.
- O comportamento executável define o estado atual; requisitos acadêmicos aprovados definem a intenção. Toda diferença será registrada como lacuna de rastreabilidade e resolvida por mudança no produto ou no artefato.
- O Perfil do Paciente e o Vínculo Profissional–Paciente terão ciclos de vida e estados separados.
- A jornada crítica persistente terá prioridade sobre novas capacidades: autenticar, gerenciar agenda, consultar slots, reservar, pagar, confirmar, notificar e acompanhar.
- Dados demonstrativos poderão existir somente em modo explicitamente identificado e nunca serão apresentados como persistência real.
- O intervalo e o motivo administrativo de um Bloqueio de agenda terão visibilidades separadas; consultas públicas nunca retornarão o motivo.
- Um Bloqueio de agenda não poderá sobrepor um Agendamento vigente sem uma resolução explícita do conflito.
- Alterar disponibilidade não alterará nem cancelará Agendamentos existentes.
- A Reserva temporária será exclusiva, terá expiração observável e não poderá iniciar checkout depois de expirada.
- A restrição contra dupla ocupação permanecerá no banco como garantia final de concorrência.
- A confirmação de pagamento ocorrerá somente por webhook autenticado, idempotente e reconciliado com o provedor.
- A página de retorno do navegador nunca promoverá estado de pagamento ou Agendamento.
- Eventos externos registrarão estado de processamento suficiente para permitir retry seguro após falha.
- Jobs de notificação serão reivindicados atomicamente antes do envio e terão limite de tentativas observável.
- A falha de notificação não reverterá pagamento nem Agendamento.
- O modo de integração será obrigatório e explícito; produção nunca fará fallback para um adaptador fictício.
- A topologia canônica será Sites/Cloudflare para a aplicação e Supabase para identidade e persistência. Referências a Vercel serão removidas ou marcadas como históricas.
- O diagrama de caso de uso mostrará objetivos e atores; o diagrama de classes mostrará o modelo conceitual; o ERD mostrará o banco exato; os diagramas de sequência serão conscientes da implementação; os diagramas de estado terão entidade proprietária; e o diagrama de implantação mostrará a topologia real e fronteiras de confiança.
- Fontes editáveis de diagrama serão versionadas junto ao código, e artefatos renderizados serão derivados dessas fontes.
- A rastreabilidade canônica ligará requisito, caso de uso, tela, contrato, regra, persistência, diagrama e teste.
- Dados reais permanecerão proibidos até aprovação integral do gate de produção.

## Testing Decisions

- Testes afirmarão comportamento observável através das interfaces dos módulos, evitando detalhes internos.
- A seam principal de cada jornada persistente será o contrato HTTP exercitado contra um Supabase de teste recriado por migração.
- Jornadas completas serão verificadas pela seam do navegador para cada ator, usando dados fictícios isolados.
- Regras puras de estado, tempo, conflito e validação permanecerão testadas diretamente pela interface do módulo de domínio.
- RLS, constraints, funções transacionais e concorrência serão testadas no banco real de teste, porque uma simulação não prova essas garantias.
- Adaptadores de pagamento e WhatsApp serão testados por suas interfaces com implementações fictícias determinísticas e, no gate de produção, por contratos sandbox.
- A matriz negativa de autorização cobrirá visitante, paciente, papel incorreto, psicóloga pendente, proprietário correto e recurso alheio.
- A concorrência de Reserva temporária executará pelo menos vinte solicitações simultâneas ao mesmo horário e exigirá exatamente um vencedor.
- Pagamento cobrirá assinatura inválida, replay, evento fora de ordem, falha transitória, aprovação e rejeição.
- Notificação cobrirá autenticação do processador, reivindicação concorrente, retry, limite de tentativas, destino ausente e falha do provedor.
- Slots cobrirão fuso configurado, limites de data, adjacência, bloqueios e horários ocupados.
- Contratos HTTP cobrirão entradas inválidas e respostas 401, 403, 404, 409, 422 e 500 quando aplicáveis.
- Browser E2E cobrirá as jornadas UC01 a UC05, não apenas presença de texto.
- A CI executará lint, tipos, unidade, build da aplicação, build de Sites e smoke de navegador; testes que dependem de credenciais ou infraestrutura externa terão gates documentados e execução protegida.
- A qualidade será declarada por uma matriz de riscos e evidências, não por cobertura literal de todas as combinações ou por uma porcentagem de linhas isolada.
- Relatórios de release registrarão commit, ambiente, data, comandos, resultados, evidências manuais e bloqueios externos.
- A cobertura atual de quatro exemplos unitários e três cenários E2E repetidos em dois perfis será tratada como baseline, não como prova de prontidão.

## Out of Scope

- Prontuário, diagnóstico, evolução terapêutica, prescrição e qualquer outra Informação clínica.
- Secretárias, administradores operacionais, clínicas, permissões delegadas e fluxos de bot.
- Aplicativo móvel nativo.
- Múltiplas unidades, tipos complexos de sessão e integração com calendários externos.
- Reembolso financeiro automatizado e contabilidade completa.
- Cancelamento e remarcação autônomos pelo paciente, até que a política de negócio seja aprovada.
- Uso de dados reais antes da aprovação integral do gate de produção.
- Declaração de conformidade jurídica sem revisão do responsável competente.
- Declaração de integração real quando o adaptador estiver em modo fictício.

## Further Notes

- O Gate de Demonstração Acadêmica e o Gate de Prontidão de Produção podem avançar simultaneamente, mas encerram de forma independente.
- A ausência local de Supabase CLI/Docker impede executar agora as provas reais de migração, RLS e concorrência; isso é um bloqueio de evidência, não motivo para simular aprovação.
- Credenciais e aprovações de Mercado Pago, Meta/WhatsApp, SMTP, domínio e revisão LGPD permanecem gates externos.
- A numeração UC01 a UC05 é a autoridade técnica local até eventual orientação formal do professor; uma mudança oficial deverá atualizar a matriz inteira em uma única revisão.
- O spec deve ser publicado no GitHub Issues com o label `ready-for-agent`. Enquanto a ferramenta autenticada do GitHub não estiver disponível neste ambiente, este arquivo é o corpo canônico preparado para publicação.
