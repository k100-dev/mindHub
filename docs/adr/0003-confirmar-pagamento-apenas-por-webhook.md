# Confirmar pagamento apenas por webhook autenticado

O retorno do navegador após o checkout nunca confirmará um pagamento ou um agendamento. A confirmação ocorrerá somente após uma notificação autenticada e idempotente do provedor, seguida de consulta ao estado vigente da transação, porque redirecionamentos do navegador podem ser repetidos, manipulados ou interrompidos.
