# MindHub - Modelagem para apresentação

Abra `MindHub - Modelagem Final.asta` no Astah UML. O arquivo original anterior foi preservado. Este projeto contém 18 diagramas e vistas editáveis e foi validado pela API do Astah UML 12.

## Ordem de leitura

1. **Casos de uso:** jornada do paciente e gestão profissional, UC01 a UC15.
2. **Domínio:** CL01 pessoas e vínculos; CL02 agenda e financeiro.
3. **Dados:** três vistas relacionais, divididas para evitar sobreposição das associações.
4. **Sequências:** cadastro, login, solicitação, sinal e confirmação, cancelamento e reembolso, remarcação.
5. **Estados e atividades:** ciclo do agendamento, reembolso e fluxo principal.
6. **Arquitetura:** componentes lógicos e implantação.

## Distinção dos formatos

Casos de uso, classes, sequências, estados e atividades são diagramas nativos desses tipos no Astah. As três vistas relacionais usam classes com estereótipo `table`; componentes e implantação usam classes com estereótipos `component` e `node`. São modelos editáveis, mas não abas nativas de ER, componentes ou implantação. Se o professor exigir especificamente essas abas, use as vistas como referência e transponha os elementos pelo editor correspondente disponível na edição do Astah. Não apresente as vistas estruturais como se fossem esses tipos nativos.

Os diagramas de sequência descrevem responsabilidades e ordem do fluxo; conflitos e demais alternativas são detalhados nas regras vigentes e testes. O diagrama de atividade representa o fluxo principal. O modelo relacional é seletivo, não um inventário de todas as colunas técnicas.

## Roteiro de defesa

- Explique por que MindHub é uma ferramenta, com Isadora como cliente inicial e perfil configurado.
- Mostre que solicitar já bloqueia o horário, sem expiração; “pendente” não significa disponível.
- Demonstre a diferença entre registrar sinal e confirmar atendimento.
- Use SQ06 para explicar como uma remarcação mantém o sinal e conserva o horário original se ocorrer conflito.
- Use SM02 para explicar que o sistema registra reembolso manual, sem movimentar dinheiro.
- Mostre o limite exato de 24 horas e a proteção contra dois pacientes no mesmo intervalo.
- Encerre distinguindo funcionalidades entregues de pagamento automático, prontuário e videochamada, que são futuras.

## Coerência dos nomes

“Agendamento pendente” corresponde internamente a `AGUARDANDO_SINAL`. A expressão técnica permanece no banco por compatibilidade; não deve aparecer como mensagem principal ao paciente. “Remarcação” altera o mesmo registro e volta a pendente, sem criar um estado terminal de remarcado. “Pagamento” e “reembolso” possuem registros próprios.

## Configuração para uso real

Definir horários efetivos de atendimento e instruções Pix com dados conferidos pela profissional. Não usar os dados sintéticos das capturas como agenda ou pacientes reais. Testar entrega de e-mail com uma conta controlada.

O gerador Java usa a API oficial do Astah. Compile com astah-api.jar e execute com astah-uml.jar e astah-api.jar no classpath, passando o destino .asta como argumento. Não sobrescreva alterações manuais sem salvar uma cópia.
