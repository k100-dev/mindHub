export function PageHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1 className="mt-1 text-3xl font-black tracking-[-.03em] sm:text-4xl">{title}</h1>{description && <p className="muted mt-2 max-w-2xl leading-6">{description}</p>}</div>{action}</header>;
}
