# MindHub

O MindHub é o sistema administrativo exclusivo da psicóloga Isadora Bezerra. Não é uma plataforma para múltiplos profissionais e não oferece cadastro público de psicóloga.

## Pessoas e acessos

**Visitante**: pode conhecer o espaço e criar ou acessar uma conta de paciente. Não vê disponibilidade, bloqueios ou agendamentos.

**Paciente ativo**: pessoa autenticada com perfil `PATIENT` e conta `ACTIVE`. Pode consultar os horários liberados por Isadora, solicitar um agendamento e visualizar somente seus próprios registros administrativos.

**Isadora Bezerra**: única profissional autorizada. O acesso exige, ao mesmo tempo, e-mail presente em `PSYCHOLOGIST_ALLOWLIST`, perfil `PSYCHOLOGIST/ACTIVE` e perfil profissional `VERIFIED` com slug `dra-isadora-bezerra`.

## Linguagem do domínio

**Agendamento** é o compromisso administrativo entre Isadora e um paciente.

**Reserva temporária** ocupa um horário durante a etapa de confirmação. Não equivale a agendamento confirmado.

**Sinal** é o pagamento configurado por Isadora para confirmar um agendamento. O retorno do navegador nunca confirma pagamento; somente o webhook autenticado do provedor pode fazê-lo.

**Bloqueio de agenda** torna um intervalo indisponível. Seu motivo administrativo é privado e nunca é enviado ao paciente.

**Observação administrativa** contém apenas informação operacional sobre o atendimento. Diagnóstico, evolução, anamnese, prescrição e conteúdo de sessão são informação clínica e estão fora do MindHub.

## Fonte de verdade

Supabase Auth identifica a sessão. A autorização usa exclusivamente `profiles`, `patient_profiles` e `psychologist_profiles`; `user_metadata` serve apenas como entrada inicial de nome e telefone e nunca decide papel ou permissão. PostgreSQL, RLS e as migrações em `supabase/migrations` são a fonte executável dos dados.

