import { create } from "zustand";

// Define the types of modals you will have in your application
type ModalType =
  | "NONE"
  | "AUTHORIZE_PICKUP"
  | "COMPLETE_DELIVERY"
  | "AUTHORIZE_DONATION"
  | "COMPLETE_DONATION";

// Define the shape of the data each modal might need
interface ModalProps {
  orderId?: number | string;
  claimId?: number | string;
  // You can add any other props a modal might need here
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
    console.log(`Opening modal: ${type}`, props);
    set({ modalType: type, modalProps: props, isOpen: true });
  },

  closeModal: () => {
    set({ modalType: "NONE", modalProps: null, isOpen: false });
  },
}));
