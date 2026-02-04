import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';

export async function clearCache() {
  // Clear all cookies
  const cookies = Cookies.get();
  Object.keys(cookies).forEach(cookie => {
    Cookies.remove(cookie);
  });

  // Clear localStorage
  localStorage.clear();

  // Clear sessionStorage
  sessionStorage.clear();
}
