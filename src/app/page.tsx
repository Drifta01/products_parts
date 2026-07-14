import Link from "next/link";

const quickActions = [
  {
    title: "Products",
    description:
      "Review your catalog, add new products, and manage required parts.",
    href: "/products",
    accent: "from-cyan-500/20 to-blue-500/20",
  },
  {
    title: "Inventory",
    description:
      "Track available stock and keep your critical parts ready to use.",
    href: "/inventory",
    accent: "from-emerald-500/20 to-lime-500/20",
  },
  {
    title: "In Construction",
    description:
      "Monitor active builds, capture progress, and finish work cleanly.",
    href: "/in-construction",
    accent: "from-fuchsia-500/20 to-violet-500/20",
  },
];

export default function Home() {
  return (
    <div className="w-full min-h-full  border border-slate-800/80 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/30 md:p-8 lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <aside className="space-y-4">
          <div className="p-6 shadow-xl shadow-slate-950/20">
            <h2 className="text-xl text-center font-semibold text-white">
              Quick access
            </h2>
          </div>

          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`block  border border-slate-800 bg-linear-to-br ${action.accent} p-5 transition hover:-translate-y-1 hover:shadow-lg`}>
              <p className="text-lg font-semibold text-white">{action.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {action.description}
              </p>
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}
