// src/components/modals/GlobalModalManager.tsx
import { useModalStore } from "@/store/modalStore";
import AuthorizePickupModal from "@/components/orders/AuthorizePickupModal";
import CompleteDeliveryModal from "@/components/orders/CompleteDeliveryModal";
// Import other modals here as you create them
// import AuthorizeDonationModal from "@/components/donations/AuthorizeDonationModal";

const GlobalModalManager: React.FC = () => {
  const modalType = useModalStore((state) => state.modalType);

  switch (modalType) {
    case 'AUTHORIZE_PICKUP':
      return <AuthorizePickupModal />;
    
    case 'COMPLETE_DELIVERY':
      return <CompleteDeliveryModal />;

    // case 'AUTHORIZE_DONATION':
    //   return <AuthorizeDonationModal />;

    // etc.
      
    default:
      return null; // Render nothing if no modal is active
  }
};

export default GlobalModalManager;