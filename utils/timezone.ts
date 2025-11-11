// Kenya Time Zone Utilities (EAT - UTC+3)

/**
 * Get current time in Kenya timezone (EAT - UTC+3)
 */
export const getKenyaTime = (): Date => {
  // Create a new date object and use proper timezone handling
  const now = new Date();
  
  // Use toLocaleString to get the correct Kenya time
  const kenyaTimeString = now.toLocaleString('en-US', {
    timeZone: 'Africa/Nairobi'
  });
  
  return new Date(kenyaTimeString);
};

/**
 * Convert any date to Kenya timezone
 */
export const toKenyaTime = (date: Date | string): Date => {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  
  // Use proper timezone conversion
  const kenyaTimeString = inputDate.toLocaleString('en-US', {
    timeZone: 'Africa/Nairobi'
  });
  
  return new Date(kenyaTimeString);
};

/**
 * Format date for Kenya timezone display
 */
export const formatKenyaTime = (date: Date | string, options?: {
  includeDate?: boolean;
  includeSeconds?: boolean;
  format?: 'short' | 'long';
}): string => {
  const {
    includeDate = true,
    includeSeconds = false,
    format = 'short'
  } = options || {};

  const kenyaTime = toKenyaTime(date);
  
  if (format === 'long') {
    return kenyaTime.toLocaleString('en-KE', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: true
    });
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Africa/Nairobi',
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  if (includeDate) {
    return kenyaTime.toLocaleString('en-KE', {
      ...dateOptions,
      ...timeOptions
    });
  } else {
    return kenyaTime.toLocaleString('en-KE', timeOptions);
  }
};

/**
 * Get Kenya time in ISO format for API calls
 */
export const getKenyaTimeISO = (): string => {
  return getKenyaTime().toISOString();
};

/**
 * Add duration (in minutes) to current Kenya time
 */
export const addMinutesToKenyaTime = (minutes: number): Date => {
  const kenyaTime = getKenyaTime();
  return new Date(kenyaTime.getTime() + (minutes * 60 * 1000));
};

/**
 * Check if a time is in the past (Kenya time)
 */
export const isInPastKenyaTime = (date: Date | string): boolean => {
  const inputDate = toKenyaTime(date);
  const currentKenyaTime = getKenyaTime();
  return inputDate < currentKenyaTime;
};

/**
 * Get time difference in minutes between two Kenya times
 */
export const getTimeDifferenceInMinutes = (startTime: Date | string, endTime: Date | string): number => {
  const start = toKenyaTime(startTime);
  const end = toKenyaTime(endTime);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
};