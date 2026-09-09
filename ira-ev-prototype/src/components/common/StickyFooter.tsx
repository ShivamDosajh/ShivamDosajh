import type { ReactNode } from "react";

export function StickyFooter({ children, sticky = true }: { children: ReactNode; sticky?: boolean }) {
  return (
    <div
      className={[
        "shrink-0 px-4 pt-3 pb-4 safe-bottom bg-background",
        sticky ? "sticky bottom-0 border-t border-border" : "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
