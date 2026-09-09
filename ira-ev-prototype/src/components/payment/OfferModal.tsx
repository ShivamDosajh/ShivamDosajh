import { Modal } from "../common/Modal";
import type { Offer } from "../../types/charging";

export function OfferModal({ offer, onClose }: { offer: Offer | null; onClose: () => void }) {
  return (
    <Modal open={!!offer} onClose={onClose} title={offer?.title ?? ""}>
      <p className="text-text text-[14px] font-medium mb-3">{offer?.description}</p>
      <p>{offer?.terms}</p>
    </Modal>
  );
}
