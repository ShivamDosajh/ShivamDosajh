import type { CostBreakdown as CostBreakdownData } from "../../utils/pricing";
import { formatCurrency, formatUnits } from "../../utils/pricing";

interface Row {
  label: string;
  value: string;
}

export function CostBreakdown({ data }: { data: CostBreakdownData }) {
  const rows: Row[] = [
    { label: "cost of recharge", value: formatCurrency(data.costOfRecharge) },
    { label: "number of units", value: formatUnits(data.units) },
    { label: "convenience fee", value: formatCurrency(data.convenienceFee) },
    { label: "tax", value: formatCurrency(data.tax) },
  ];

  return (
    <div className="rounded-card bg-surfaceRaised border border-border p-4">
      <p className="text-[14px] font-medium mb-3 lowercase">approximate recharge calculation</p>
      <div className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-[13px]">
            <span className="text-secondaryText lowercase">{row.label}</span>
            <span className="text-text font-medium">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="h-px bg-border my-3" />
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-semibold lowercase">approximate value</span>
        <span className="text-[16px] font-bold text-primary">{formatCurrency(data.approximateValue)}</span>
      </div>
    </div>
  );
}
