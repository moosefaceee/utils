import type { SearchResponse, Show } from '../types/streaming';

// Rotate at developers.movieofthenight.com before going to production
const API_KEY =
  import.meta.env.VITE_MOTN_API_KEY ?? 'motn-key-v4-lFUTAaJ9hRo4S2B8y5LGz8CBCIkRVwcp';
const BASE_URL = 'https://api.movieofthenight.com';
// MOTN blocks direct browser fetch (returns 421). Try two proxies in sequence.
const PROXIES = [
  (url: string) => `https://corsproxy.io/?${url}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

export async function searchShows(title: string, country = 'za'): Promise<Show[]> {
  if (!title.trim()) return [];

  const params = new URLSearchParams({
    country,
    title: title.trim(),
    series_granularity: 'show',
    output_language: 'en',
  });

  const target = `${BASE_URL}/shows/search/title?${params}`;

  let lastError: Error = new Error('All proxies failed');
  for (const makeUrl of PROXIES) {
    try {
      const res = await fetch(makeUrl(target), {
        headers: { 'x-api-key': API_KEY },
      });
      if (!res.ok) {
        lastError = new Error(`API error ${res.status}: ${await res.text()}`);
        continue;
      }
      const data: SearchResponse = await res.json();
      return data.shows ?? [];
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastError;

}
