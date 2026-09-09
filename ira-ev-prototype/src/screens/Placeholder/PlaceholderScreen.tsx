import type { LucideIcon } from "lucide-react";

interface PlaceholderScreenProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function PlaceholderScreen({ icon: Icon, title, description }: PlaceholderScreenProps) {
  return (
    <div className="flex flex-col h-full items-center justify-center gap-4 px-8 text-center safe-top safe-bottom">
      <div className="w-16 h-16 rounded-full bg-surfaceRaised flex items-center justify-center">
        <Icon size={28} className="text-secondaryText" />
      </div>
      <div>
        <p className="text-[16px] font-medium lowercase">{title}</p>
        <p className="text-[13px] text-secondaryText mt-1.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
