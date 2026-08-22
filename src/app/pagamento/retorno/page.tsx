import Link from "next/link";
import { Clock3 } from "lucide-react";
import { Brand } from "@/components/brand";
export default function PaymentReturnPage() { return <main className="grid min-h-screen place-items-center p-5"><div className="card w-full max-w-lg p-8 text-center"><Brand /><span className="mx-auto mt-9 grid size-16 place-items-center rounded-full bg-amber-100 text-amber-800"><Clock3 size={30} /></span><h1 className="mt-5 text-2xl font-black">Estamos verificando o pagamento</h1><p className="muted mt-3 leading-6">A confirmação ocorre somente após o webhook seguro do Mercado Pago. Atualize o Hub do Paciente em alguns instantes.</p><Link href="/hub" className="button-primary mt-7 w-full">Ir para o Hub do Paciente</Link></div></main>; }
