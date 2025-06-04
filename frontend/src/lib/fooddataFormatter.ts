export const formatCookedDate = (isoDate: string): string => {
    if (!isoDate) return "N/A";
    
    try {
    const date = new Date(isoDate);

    return `${date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    })} ${date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    })}`;
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
    }
};
