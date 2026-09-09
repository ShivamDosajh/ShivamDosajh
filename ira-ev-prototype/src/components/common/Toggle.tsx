interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        "w-12 h-7 rounded-pill relative transition-colors shrink-0 min-h-[28px]",
        checked ? "bg-primary" : "bg-border",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}
