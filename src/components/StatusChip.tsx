import type { DueFlag } from '../types';
import { DUE_FLAG_CLASSES, DUE_FLAG_LABEL } from '../lib/dueFlag';

export default function StatusChip({ flag }: { flag: DueFlag }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${DUE_FLAG_CLASSES[flag]}`}>
      {DUE_FLAG_LABEL[flag]}
    </span>
  );
}
