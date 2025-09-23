
import { format } from 'date-fns';
import {server} from '../main'
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? format(date, 'dd/MM/yyyy') : 'Invalid Date';
};

export const fetchServerTimestamp = async () => {
    try {
      const response = await fetch(`${server}/server-timestamp`);
      const data = await response.json();
      return new Date(data.timestamp); // Convert to Date object if needed
    } catch (error) {
      console.error('Failed to fetch server timestamp:', error);
      return new Date(); // Fallback to client time if server fetch fails
    }
  };