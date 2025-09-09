import type { ApiResponse } from '@/types';

const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-domain.com' 
  : 'http://localhost:3000';

export async function getFetcher<T>(key: string): Promise<T> {
  const response = await fetch(`${baseURL}${key}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();
  
  if (result.code !== 0) {
    throw new Error(result.message);
  }

  return result.data as T;
}

export async function postFetcher<T>(
  key: string, 
  { arg }: { arg: unknown }
): Promise<T> {
  const response = await fetch(`${baseURL}${key}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();
  
  if (result.code !== 0) {
    throw new Error(result.message);
  }

  return result.data as T;
}