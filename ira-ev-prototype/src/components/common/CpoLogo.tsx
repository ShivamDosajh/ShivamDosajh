const cpoStyles: Record<string, { bg: string; text: string; short: string }> = {
  "Tata Power": { bg: "bg-white", text: "text-[#0b3d91]", short: "TATA" },
  Statiq: { bg: "bg-[#1c1c1c]", text: "text-lime-400", short: "STQ" },
  "Ather Grid": { bg: "bg-black", text: "text-white", short: "ATH" },
};

export function CpoLogo({ cpo, size = 48 }: { cpo: string; size?: number }) {
  const style = cpoStyles[cpo] ?? { bg: "bg-surfaceRaised", text: "text-text", short: cpo.slice(0, 3).toUpperCase() };
  return (
    <div
      className={`rounded-md ${style.bg} ${style.text} flex items-center justify-center font-bold shrink-0 border border-border/50`}
      style={{ width: size, height: size, fontSize: size * 0.24 }}
    >
      {style.short}
    </div>
  );
}
