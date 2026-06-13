import { useModalStore } from "@/store/modalStore";
import AuthorizePickupModal from "@/components/orders/AuthorizePickupModal";
import CompleteDeliveryModal from "@/components/orders/CompleteDeliveryModal";
import RateExperienceModal from "@/components/orders/RateExperienceModal";
import ReportIssueModal from "@/components/orders/ReportIssueModal";

const GlobalModalManager: React.FC = () => {
  const modalType = useModalStore((state) => state.modalType);

  switch (modalType) {
    case 'AUTHORIZE_PICKUP':
      return <AuthorizePickupModal />;
    
    case 'COMPLETE_DELIVERY':
      return <CompleteDeliveryModal />;

    case 'REPORT_ISSUE':
      return <ReportIssueModal />;

    case 'RATE_EXPERIENCE':
      return <RateExperienceModal />;
      
    default:
      return null;
  }
};

export default GlobalModalManager;
