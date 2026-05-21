import type { SearchResponse, Show } from '../types/streaming';

// Rotate at developers.movieofthenight.com before going to production
const API_KEY =
  import.meta.env.VITE_MOTN_API_KEY ?? 'motn-key-v4-lFUTAaJ9hRo4S2B8y5LGz8CBCIkRVwcp';
const BASE_URL = 'https://api.movieofthenight.com';

export async function searchShows(title: string, country = 'za'): Promise<Show[]> {
  if (!title.trim()) return [];

  const params = new URLSearchParams({
    country,
    title: title.trim(),
    series_granularity: 'show',
    output_language: 'en',
  });

  const res = await fetch(`${BASE_URL}/shows/search/title?${params}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  const data: SearchResponse = await res.json();
  return data.shows ?? [];
}
