interface DetailItemProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className, icon }) => {
  return (
    <div className={`font-sans text-base flex items-start space-x-2 ${className}`}>
      {icon && (
        <div className="flex-shrink-0 mt-0.5 text-highlight">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <span className="font-semibold text-dark-text">{label}: </span>
        <span className="text-dark-text/80">{value}</span>
      </div>
    </div>
  );
};

export default DetailItem;
