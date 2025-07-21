export const formatCookedDate = (isoDate: string): string => {
    if (!isoDate) return "N/A";
    
    try {
        // Parse the date and ensure we're working with the correct timezone
        const date = new Date(isoDate);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }

        // Format the date and time without forcing a specific timezone
        // This will use the user's local timezone for display
        const dateOptions: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "short",
            day: "numeric"
        };

        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        };

        const formattedDate = date.toLocaleDateString("en-US", dateOptions);
        const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

        return `${formattedDate} at ${formattedTime}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
    }
};
