interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  helperText?: string;
}

export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, unit = "%", helperText }: SliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-text">{label}</span>
        <span className="text-[14px] font-semibold text-primary">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-pill bg-surfaceRaised accent-primary min-h-[28px]"
        style={{ accentColor: "#0fbfa8" }}
      />
      {helperText && <p className="text-[11px] text-secondaryText">{helperText}</p>}
    </div>
  );
}
