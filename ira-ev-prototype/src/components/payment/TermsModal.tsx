import { Modal } from "../common/Modal";

export function TermsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Terms & Conditions">
      <p className="mb-3">
        By proceeding with this transaction, you agree to the iRA.ev Terms of Use and Charging Point
        Operator policies applicable at this station.
      </p>
      <p className="mb-3">
        Charging sessions are billed based on actual energy consumed. Any amount collected in excess of
        the actual consumption will be refunded to your original payment method within 5-7 business days.
      </p>
      <p className="mb-3">
        iRA.ev is not liable for delays caused by third-party charge point operators, network
        connectivity, or vehicle-side charging faults.
      </p>
      <p>Prices shown are inclusive of applicable taxes unless otherwise stated.</p>
    </Modal>
  );
}
