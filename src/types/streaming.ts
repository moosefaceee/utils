export type StreamingType = 'subscription' | 'rent' | 'buy' | 'free' | 'addon';

export interface StreamingServiceImageSet {
  lightThemeImage: string;
  darkThemeImage: string;
  whiteImage: string;
}

export interface StreamingService {
  id: string;
  name: string;
  homePage: string;
  themeColorCode: string;
  imageSet: StreamingServiceImageSet;
}

export interface Price {
  amount: string;
  currency: string;
  formatted: string;
}

export interface StreamingOption {
  service: StreamingService;
  type: StreamingType;
  link: string;
  videoLink?: string;
  quality?: string;
  price?: Price;
  addon?: {
    id: string;
    name: string;
    homePage: string;
    themeColorCode: string;
    imageSet: StreamingServiceImageSet;
  };
}

export interface Genre {
  id: string;
  name: string;
}

export interface ImageSet {
  verticalPoster: {
    w240: string;
    w360: string;
    w480: string;
    w600: string;
    w720: string;
  };
  horizontalPoster: {
    w360: string;
    w480: string;
    w720: string;
    w1080: string;
    w1440: string;
  };
  verticalBackdrop?: {
    w240: string;
    w360: string;
    w480: string;
    w600: string;
    w720: string;
  };
  horizontalBackdrop?: {
    w360: string;
    w480: string;
    w720: string;
    w1080: string;
    w1440: string;
  };
}

export interface Show {
  itemType: 'show' | 'movie';
  showType?: 'series' | 'movie';
  id: string;
  imdbId: string;
  tmdbId: string;
  title: string;
  overview: string;
  releaseYear: number;
  originalTitle: string;
  genres: Genre[];
  directors: string[];
  cast: string[];
  rating: number;
  runtime?: number;
  seasonCount?: number;
  episodeCount?: number;
  imageSet: ImageSet;
  streamingOptions: {
    za?: StreamingOption[];
    [country: string]: StreamingOption[] | undefined;
  };
}

export interface SearchResponse {
  shows: Show[];
  hasMore: boolean;
}
