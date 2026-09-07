> Histórico anterior à revisão de 06/09/2026. Para comportamento e implantação vigentes, consulte `docs/ESCOPO-VIGENTE.md` e o README da raiz. Regras de webhook, reserva temporária e identidade exclusiva foram substituídas nesta entrega.

# Usar Sites e Supabase como topologia canônica

O MindHub usará OpenAI Sites sobre Cloudflare para a aplicação web e Supabase para identidade, banco PostgreSQL, políticas de acesso e processamento associado. A topologia já está vinculada e validada pelo código atual; manter uma segunda narrativa de implantação baseada em Vercel criaria dois ambientes concorrentes, documentação contraditória e evidência acadêmica que não representa o sistema executável.
