/**
 * Safe date utilities to prevent "Invalid time value" errors
 */

export function formatDate(date: Date | string | number | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date:', date);
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Error formatting date';
  }
}

export function formatTime(date: Date | string | number | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid time:', date);
      return 'Invalid time';
    }
    
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting time:', error, date);
    return 'Error formatting time';
  }
}

export function safeToISOString(date: Date | string | number | undefined): string {
  if (!date) return new Date().toISOString();
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date for ISO string:', date);
      return new Date().toISOString();
    }
    
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error creating ISO string:', error, date);
    return new Date().toISOString();
  }
}