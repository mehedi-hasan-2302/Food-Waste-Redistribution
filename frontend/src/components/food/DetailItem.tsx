interface DetailItemProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className }) => {
  return (
    <div className={`font-sans text-lg ${className}`}>
      <span className="font-semibold text-dark-text">{label}: </span>
      <span className="text-dark-text/80">{value}</span>
    </div>
  );
};

export default DetailItem;
