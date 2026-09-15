import type { CostBreakdown as CostBreakdownData } from "../../utils/pricing";
import { formatCurrency, formatUnits } from "../../utils/pricing";

interface Row {
  label: string;
  value: string;
}

interface CostBreakdownProps {
  data: CostBreakdownData;
  /** iRA Cash applied to this transaction, if any — shown as its own line item, with the
   * pre-discount total struck through above the amount actually payable. */
  discount?: number;
}

export function CostBreakdown({ data, discount = 0 }: CostBreakdownProps) {
  const rows: Row[] = [
    { label: "cost of recharge", value: formatCurrency(data.costOfRecharge) },
    { label: "number of units", value: formatUnits(data.units) },
    { label: "convenience fee", value: formatCurrency(data.convenienceFee) },
    { label: "tax", value: formatCurrency(data.tax) },
  ];
  const payable = Math.max(0, data.approximateValue - discount);

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
        {discount > 0 && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-primary lowercase">iRA cash discount</span>
            <span className="text-primary font-medium">-{formatCurrency(discount)}</span>
          </div>
        )}
      </div>
      <div className="h-px bg-border my-3" />
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-semibold lowercase">{discount > 0 ? "amount payable" : "approximate value"}</span>
        <div className="text-right">
          {discount > 0 && (
            <p className="text-[11px] text-secondaryText line-through leading-tight">{formatCurrency(data.approximateValue)}</p>
          )}
          <span className="text-[16px] font-bold text-primary">{formatCurrency(payable)}</span>
        </div>
      </div>
    </div>
  );
}
