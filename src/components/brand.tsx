import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2 font-extrabold tracking-tight" aria-label="MindHub — início">
      <span className={inverse ? "grid size-9 place-items-center rounded-xl bg-white/12 text-white" : "grid size-9 place-items-center rounded-xl bg-[#e6f4f1] text-[#117f72]"}>
        <BrainCircuit size={22} aria-hidden="true" />
      </span>
      <span className={inverse ? "text-xl text-white" : "text-xl text-[#17233c]"}>MindHub</span>
    </Link>
  );
}
