import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (request) => {
  if (request.headers.get("authorization") !== `Bearer ${Deno.env.get("CRON_SECRET")}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: jobs, error } = await supabase
    .from("notification_jobs")
    .select("id")
    .eq("status", "PENDING")
    .lte("scheduled_for", new Date().toISOString())
    .limit(50);
  if (error) return Response.json({ error: error.code }, { status: 500 });
  // O envio real permanece no adaptador do aplicativo. A função reivindica os
  // trabalhos; a URL interna configurada em produção os processa com retry.
  return Response.json({ due: jobs?.length ?? 0 });
});
