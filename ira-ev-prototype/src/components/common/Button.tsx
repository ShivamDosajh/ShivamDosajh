import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-black active:bg-primaryDark disabled:bg-surfaceRaised disabled:text-secondaryText",
  outline:
    "border border-primary text-primary active:bg-primary/10 disabled:border-border disabled:text-secondaryText",
  ghost: "text-primary active:bg-primary/10",
  danger: "bg-error text-white active:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 px-4 text-[15px]",
  lg: "h-[52px] px-5 text-base",
};

export function Button({
  variant = "primary",
  size = "lg",
  fullWidth = true,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "rounded-button font-semibold tracking-wide transition-colors duration-150",
        "flex items-center justify-center gap-2 select-none min-h-[44px]",
        variantClasses[variant],
        sizeClasses[size],
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
