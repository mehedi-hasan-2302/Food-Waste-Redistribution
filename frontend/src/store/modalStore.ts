import { create } from "zustand";

type ModalType =
  | "NONE"
  | "AUTHORIZE_PICKUP"
  | "COMPLETE_DELIVERY"
  | "REPORT_ISSUE"
  | "AUTHORIZE_DONATION"
  | "COMPLETE_DONATION";

interface ModalProps {
  orderId?: number | string;
  claimId?: number | string;
}

interface ModalState {
  modalType: ModalType;
  modalProps: ModalProps | null;
  isOpen: boolean;
  openModal: (type: ModalType, props?: ModalProps) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modalType: "NONE",
  modalProps: null,
  isOpen: false,

  openModal: (type, props = {}) => {
    set({ modalType: type, modalProps: props, isOpen: true });
  },

  closeModal: () => {
    set({ modalType: "NONE", modalProps: null, isOpen: false });
  },
}));
