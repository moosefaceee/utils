import type { SearchResponse, Show } from '../types/streaming';

// Rotate at developers.movieofthenight.com before going to production
const API_KEY =
  import.meta.env.VITE_MOTN_API_KEY ?? 'motn-key-v4-lFUTAaJ9hRo4S2B8y5LGz8CBCIkRVwcp';
const BASE_URL = 'https://api.movieofthenight.com';
// MOTN blocks direct browser requests (returns 421); proxy adds CORS headers
const CORS_PROXY = 'https://corsproxy.io/?url=';

export async function searchShows(title: string, country = 'za'): Promise<Show[]> {
  if (!title.trim()) return [];

  const params = new URLSearchParams({
    country,
    title: title.trim(),
    series_granularity: 'show',
    output_language: 'en',
  });

  const target = `${BASE_URL}/shows/search/title?${params}`;
  const res = await fetch(`${CORS_PROXY}${encodeURIComponent(target)}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const data: SearchResponse = await res.json();
  return data.shows ?? [];
}
