interface QuickSelectRowProps {
  values: number[];
  suffix?: string;
  prefix?: string;
  onSelect: (value: number) => void;
  activeValue: number | null;
}

export function QuickSelectRow({ values, suffix = "", prefix = "", onSelect, activeValue }: QuickSelectRowProps) {
  return (
    <div className="flex gap-2.5 flex-wrap">
      {values.map((v) => (
        <button
          key={v}
          onClick={() => onSelect(v)}
          className={[
            "h-10 px-4 rounded-pill text-[14px] font-medium border min-h-[40px]",
            activeValue === v ? "border-primary text-primary bg-primary/10" : "border-border text-text bg-surfaceRaised",
          ].join(" ")}
        >
          {prefix}
          {v}
          {suffix}
        </button>
      ))}
    </div>
  );
}
