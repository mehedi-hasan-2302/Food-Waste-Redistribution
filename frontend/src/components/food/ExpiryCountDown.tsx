import { useState, useEffect } from "react";

interface ExpiryCountdownProps {
    expiryTimestamp: string;
}

const UPDATE_INTERVAL_MS = 60000; // Update every minute

const TIMER_BASE_CLASSES =
    "px-3 py-1.5 border rounded-md text-center font-sans text-sm w-full";
const TIMER_MIN_HEIGHT = "min-h-[56px]";

const ExpiryCountdown: React.FC<ExpiryCountdownProps> = ({
    expiryTimestamp,
}) => {
    const [displayText, setDisplayText] = useState<string>("");
    const [isEffectivelyExpired, setIsEffectivelyExpired] =
    useState<boolean>(false);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;

    const updateCountdown = () => {
        const now = +new Date();
        const endTime = +new Date(expiryTimestamp);
        const difference = endTime - now;

        if (difference <= 0) {
            setDisplayText("Order Expired");
            setIsEffectivelyExpired(true);
            if (intervalId) clearInterval(intervalId);
            return;
        }

        setIsEffectivelyExpired(false);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);

        let str = "";
        if (days > 0) {
            str = `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            str = `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            str = `${minutes}m`;
        } else {
            str = "< 1m";
        }
        setDisplayText(str);
    };

    updateCountdown();

    if (+new Date(expiryTimestamp) - +new Date() > 0) {
        intervalId = setInterval(updateCountdown, UPDATE_INTERVAL_MS);
    } else {
        setIsEffectivelyExpired(true);
        setDisplayText("Order Expired");
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
    }, [expiryTimestamp]);

    if (isEffectivelyExpired) {
    return (
        <div
            className={`${TIMER_BASE_CLASSES} ${TIMER_MIN_HEIGHT} border-red-500/70 text-red-600/90 flex items-center justify-center`}
        >
            {/* displayText will be "Order Expired" here */}
            <p className="font-medium leading-none">{displayText}</p>
        </div>
    );
    }

    return (
        <div
        className={`${TIMER_BASE_CLASSES} ${TIMER_MIN_HEIGHT} border-red-500 text-red-600 flex flex-col items-center justify-center`}
        >
        <p className="text-xs leading-tight mb-0.5">Expires in:</p>
        <p className="font-medium text-base leading-tight">{displayText}</p>
        </div>
    );
};

export default ExpiryCountdown;
