> Histórico anterior à revisão de 06/09/2026. Para comportamento e implantação vigentes, consulte `docs/ESCOPO-VIGENTE.md` e o README da raiz. Regras de webhook, reserva temporária e identidade exclusiva foram substituídas nesta entrega.

# Confirmar pagamento apenas por webhook autenticado

O retorno do navegador após o checkout nunca confirmará um pagamento ou um agendamento. A confirmação ocorrerá somente após uma notificação autenticada e idempotente do provedor, seguida de consulta ao estado vigente da transação, porque redirecionamentos do navegador podem ser repetidos, manipulados ou interrompidos.
