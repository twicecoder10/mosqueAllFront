import { format } from 'date-fns';

// Utility function to safely format dates
export const safeFormatDate = (dateString: string | Date, formatString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    return format(date, formatString);
  } catch (error) {
    return 'N/A';
  }
};

// Utility function to check if a date is valid
export const isValidDate = (dateString: string | Date): boolean => {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};
