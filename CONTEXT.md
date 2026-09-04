# MindHub

O MindHub organiza a relação administrativa entre pacientes e profissionais de psicologia, com foco em cadastro, agenda, agendamento, pagamento e comunicações operacionais. O contexto exclui deliberadamente o registro e o tratamento de informações clínicas.

## Linguagem

**Visitante**:
Pessoa ainda não autenticada que pode conhecer a profissional e consultar horários públicos, mas não criar uma reserva.
_Evitar_: Paciente (antes da autenticação e identificação nesse papel)

**Paciente**:
Pessoa que recebe o serviço de psicologia e cuja relação administrativa com a profissional é organizada pelo MindHub.
_Evitar_: Cliente, usuário (quando a pessoa estiver no papel de paciente)

**Psicóloga**:
Profissional de psicologia que oferece horários e administra pacientes e agendamentos no MindHub.
_Evitar_: Administradora, secretária

**Perfil do Paciente**:
Identidade administrativa global de um paciente no MindHub, independente de sua relação com uma psicóloga específica.
_Evitar_: Vínculo profissional–paciente

**Vínculo Profissional–Paciente**:
Relação administrativa entre uma psicóloga e um paciente, com estado próprio e independente do Perfil do Paciente.
_Evitar_: Perfil do Paciente

**Observação administrativa**:
Anotação operacional sobre a relação com o paciente, limitada a informações não clínicas necessárias ao atendimento administrativo.
_Evitar_: Evolução, anamnese, nota clínica

**Agendamento**:
Compromisso administrativo entre uma psicóloga e um paciente para um horário determinado, com ciclo de vida próprio.
_Evitar_: Consulta (quando o assunto for o registro administrativo)

**Reserva temporária**:
Ocupação exclusiva e limitada no tempo de um horário enquanto o paciente conclui as condições de confirmação.
_Evitar_: Agendamento confirmado

**Sinal**:
Pagamento exigido para confirmar um Agendamento após a Reserva temporária.
_Evitar_: Confirmação do agendamento, pagamento integral

**Bloqueio de agenda**:
Intervalo que a psicóloga torna indisponível para novos agendamentos, mantendo privado o motivo administrativo.
_Evitar_: Cancelamento de agendamento

**Registro administrativo**:
Informação necessária para identificar o paciente e operar cadastro, agenda, agendamento, pagamento e comunicações.
_Evitar_: Prontuário, registro clínico

**Informação clínica**:
Conteúdo sobre diagnóstico, evolução terapêutica, prescrição ou atendimento clínico, explicitamente fora do escopo do MindHub.
_Evitar_: Tratar como observação administrativa
