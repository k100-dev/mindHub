export function safeInternalPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  try {
    const parsed = new URL(value, "https://mindhub.local");
    if (parsed.origin !== "https://mindhub.local") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function destinationForRole(role: "PATIENT" | "PSYCHOLOGIST", requested?: string | null) {
  const fallback = role === "PATIENT" ? "/hub" : "/app";
  const next = safeInternalPath(requested, fallback);
  const allowed = role === "PATIENT"
    ? next === "/hub" || next.startsWith("/hub/") || /^\/p\/dra-isadora-bezerra\/horarios(?:[?#]|$)/.test(next)
    : next === "/app" || next.startsWith("/app/");
  return allowed ? next : fallback;
}

