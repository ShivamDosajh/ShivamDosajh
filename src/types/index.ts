export type Status = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
export type DueFlag = 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE' | 'ON_TIME' | 'LATE';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  carModel: string;
  deliveryDate: string;
}

export interface Appointment {
  date: string;
  time: string;
  notes?: string;
}

export interface Charge {
  chargerName: string;
  startPct: number;
  endPct: number;
  kwh: number;
  amountInr: number;
  failed?: boolean;
  failReason?: string;
}

export interface Session {
  customerId: string;
  status: Status;
  dueDate: string;
  appointment?: Appointment;
  currentStep: number;
  checklist: Record<string, boolean>;
  charge?: Charge;
  completedAt?: string;
}

export interface Feedback {
  customerId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  date: string;
}

export interface Config {
  advisorName: string;
  dealership: string;
  slaDays: number;
  dueSoonDays: number;
  incentives: {
    base: number;
    onTimeBonus: number;
    ratingBonusFull: number;
    ratingBonusHalf: number;
  };
}

export interface SopChecklistItem {
  id: string;
  label: string;
}

export interface SopStep {
  id: number;
  title: string;
  duration: string;
  checklist: SopChecklistItem[];
  tips: string[];
}

export interface SopFaqItem {
  problem: string;
  action: string;
}

export interface Sop {
  steps: SopStep[];
  dos: string[];
  donts: string[];
  faq: SopFaqItem[];
}
