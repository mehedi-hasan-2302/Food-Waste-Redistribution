interface ProfileDetailItemProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

const ProfileDetailItem: React.FC<ProfileDetailItemProps> = ({
  label,
  value,
  className,
}) => {
  return (
    <div
      className={`py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-x-4 items-baseline ${className}`}
    >
      <dt className="sm:col-span-4 xl:col-span-3 font-sans font-bold text-xl text-brand-green">
        {label}:
      </dt>
      <dd className="sm:col-span-8 xl:col-span-9 font-sans text-xl text-dark-text mt-1 sm:mt-0 break-words leading-relaxed"> 
        {value || (
          <span className="italic text-dark-text/60 text-base">
            Not Provided
          </span>
        )}
      </dd>
    </div>
  );
};

export default ProfileDetailItem;
