import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-textOnAction border-2 border-transparent active:border-textOnAction/30 disabled:bg-surface disabled:text-primary disabled:border-primary",
  outline: "bg-surface border-2 border-primary text-primary active:bg-primary/10 disabled:border-border disabled:text-secondaryText",
};

export function Button({
  variant = "primary",
  fullWidth = true,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "rounded-button font-medium font-action transition-colors duration-150",
        "flex items-center justify-center gap-2 select-none h-11 px-6 py-2.5 text-[16px] leading-6",
        variantClasses[variant],
        fullWidth ? "w-full" : "",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
