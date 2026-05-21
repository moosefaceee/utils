import type { Show } from '../types/streaming';
import type { StreamingType } from '../types/streaming';

// JustWatch GraphQL — CORS-enabled (their own web app uses it), no key required
const JW_GQL = 'https://apis.justwatch.com/graphql';
const JW_IMG = 'https://images.justwatch.com';

const SEARCH_QUERY = `
query StreamCheckSearch($country: Country!, $language: Language!, $first: Int, $filter: TitleFilter!) {
  popularTitles(country: $country, first: $first, filter: $filter, sortBy: POPULAR) {
    edges {
      node {
        id
        objectId
        objectType
        content(country: $country, language: $language) {
          title
          posterUrl
          scoring { imdbScore }
          ... on MovieOrShowContent {
            releaseYear
            genres { translation(language: $language) }
          }
          ... on ShowContent { seasonCount }
          ... on MovieContent { runtime }
        }
        offers(country: $country, platform: WEB) {
          monetizationType
          standardWebURL
          package { clearName packageId icon }
        }
      }
    }
  }
}`;

function imgUrl(path: string | null | undefined): string {
  if (!path) return '';
  return path.startsWith('http') ? path : `${JW_IMG}${path}`;
}

function toStreamType(m: string): StreamingType {
  if (m === 'FLATRATE') return 'subscription';
  if (m === 'FREE' || m === 'ADS' || m === 'FAST') return 'free';
  if (m === 'RENT') return 'rent';
  if (m === 'BUY') return 'buy';
  return 'subscription';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toShow(node: any): Show {
  const c = node.content ?? {};
  const poster = imgUrl(c.posterUrl);
  const offers = (node.offers ?? []).map((o: any) => ({
    service: {
      id: o.package?.packageId ?? '',
      name: o.package?.clearName ?? '',
      homePage: '',
      themeColorCode: '',
      imageSet: {
        lightThemeImage: imgUrl(o.package?.icon),
        darkThemeImage: imgUrl(o.package?.icon),
        whiteImage: imgUrl(o.package?.icon),
      },
    },
    type: toStreamType(o.monetizationType),
    link: o.standardWebURL ?? '',
  }));

  return {
    id: node.id,
    imdbId: '',
    tmdbId: String(node.objectId ?? ''),
    itemType: node.objectType === 'MOVIE' ? 'movie' : 'show',
    showType: node.objectType === 'MOVIE' ? 'movie' : 'series',
    title: c.title ?? '',
    originalTitle: c.title ?? '',
    overview: '',
    releaseYear: c.releaseYear ?? 0,
    genres: (c.genres ?? []).map((g: any) => ({ id: g.translation, name: g.translation })),
    directors: [],
    cast: [],
    rating: c.scoring?.imdbScore ? c.scoring.imdbScore * 10 : 0,
    runtime: c.runtime,
    seasonCount: c.seasonCount,
    imageSet: {
      verticalPoster: { w240: poster, w360: poster, w480: poster, w600: poster, w720: poster },
      horizontalPoster: { w360: poster, w480: poster, w720: poster, w1080: poster, w1440: poster },
    },
    streamingOptions: { za: offers },
  };
}

export async function searchShows(title: string, country = 'ZA'): Promise<Show[]> {
  if (!title.trim()) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(JW_GQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operationName: 'StreamCheckSearch',
        query: SEARCH_QUERY,
        variables: {
          country: country.toUpperCase(),
          language: 'en',
          first: 24,
          filter: { searchQuery: title.trim() },
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors[0].message);

    return (json.data?.popularTitles?.edges ?? []).map((e: any) => toShow(e.node));
  } finally {
    clearTimeout(timer);
  }
}
