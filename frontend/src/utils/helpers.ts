export const formatTime = (timestamp: string | number | Date): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatDate = (timestamp: string | number | Date): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const isSameDay = (date1: string | number | Date, date2: string | number | Date): boolean => {
  return new Date(date1).toDateString() === new Date(date2).toDateString();
};