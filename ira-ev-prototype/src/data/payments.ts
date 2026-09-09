import type { PaymentMethod } from "../types/charging";

export const primaryPaymentMethods: PaymentMethod[] = [
  { id: "bhim-upi", label: "BHIM UPI", category: "upi" },
];

export const otherUpiApps: PaymentMethod[] = [
  { id: "amazon-pay", label: "Amazon Pay", category: "upi" },
  { id: "google-pay", label: "Google Pay", category: "upi" },
  { id: "paytm", label: "Paytm", category: "upi" },
];
