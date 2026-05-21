import type { SearchResponse, Show } from '../types/streaming';

// Rotate at developers.movieofthenight.com before going to production
const API_KEY =
  import.meta.env.VITE_MOTN_API_KEY ?? 'motn-key-v4-lFUTAaJ9hRo4S2B8y5LGz8CBCIkRVwcp';
const BASE_URL = 'https://api.movieofthenight.com';
const TIMEOUT_MS = 6000;

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function searchShows(title: string, country = 'za'): Promise<Show[]> {
  if (!title.trim()) return [];

  const base = { country, title: title.trim(), series_granularity: 'show', output_language: 'en' };

  // Simple request: key in query string — browser sends no preflight OPTIONS.
  // Non-simple request: key in header — browser sends OPTIONS first; proxy must echo it back.
  const urlKeyInQuery = `${BASE_URL}/shows/search/title?${new URLSearchParams({ ...base, 'x-api-key': API_KEY })}`;
  const urlNoKey      = `${BASE_URL}/shows/search/title?${new URLSearchParams(base)}`;

  const attempts: Array<{ url: string; init: RequestInit }> = [
    // Attempt 1 — simple request, no preflight
    { url: `https://corsproxy.io/?${urlKeyInQuery}`, init: {} },
    // Attempt 2 — header auth via allorigins (different proxy, same trick)
    { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(urlKeyInQuery)}`, init: {} },
    // Attempt 3 — header auth fallback
    { url: `https://corsproxy.io/?${urlNoKey}`, init: { headers: { 'x-api-key': API_KEY } } },
  ];

  let lastError: Error = new Error('Search failed — all attempts timed out');
  for (const attempt of attempts) {
    try {
      const res = await fetchWithTimeout(attempt.url, attempt.init);
      if (!res.ok) {
        lastError = new Error(`${res.status} ${res.statusText}: ${(await res.text()).slice(0, 120)}`);
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
