export type ScreenTheme = {
  gradient: [string, string, string];
  text: string;
  muted: string;
  accent: string;
  card: string;
  cardBorder: string;
  selected: string;
  selectedText: string;
  orb: string;
  orbAlt: string;
  searchBg: string;
  searchBorder: string;
  searchPlaceholder: string;
  pokeball: string;
  skeleton: string;
  emptyIconBg: string;
  statusBar: 'light' | 'dark';
};

export const ScreenThemes: Record<'light' | 'dark', ScreenTheme> = {
  light: {
    gradient: ['#E6F4FE', '#BAE6FD', '#7DD3FC'],
    text: '#071B3D',
    muted: 'rgba(7, 27, 61, 0.62)',
    accent: '#0A4D8C',
    card: 'rgba(255,255,255,0.72)',
    cardBorder: 'rgba(10, 77, 140, 0.12)',
    selected: '#0A4D8C',
    selectedText: '#FFFFFF',
    orb: 'rgba(14, 116, 144, 0.18)',
    orbAlt: 'rgba(79, 70, 229, 0.14)',
    searchBg: 'rgba(7, 27, 61, 0.08)',
    searchBorder: 'rgba(7, 27, 61, 0.14)',
    searchPlaceholder: 'rgba(7, 27, 61, 0.45)',
    pokeball: '#0A4D8C',
    skeleton: 'rgba(7, 27, 61, 0.12)',
    emptyIconBg: '#FFFFFF',
    statusBar: 'dark',
  },
  dark: {
    gradient: ['#071B3D', '#0A4D8C', '#14B8C4'],
    text: '#FFFFFF',
    muted: 'rgba(255,255,255,0.68)',
    accent: '#A5F3FC',
    card: 'rgba(255,255,255,0.12)',
    cardBorder: 'rgba(255,255,255,0.16)',
    selected: '#FFFFFF',
    selectedText: '#071B3D',
    orb: 'rgba(165, 243, 252, 0.28)',
    orbAlt: 'rgba(165, 180, 252, 0.22)',
    searchBg: 'rgba(255,255,255,0.15)',
    searchBorder: 'rgba(255,255,255,0.25)',
    searchPlaceholder: 'rgba(255,255,255,0.55)',
    pokeball: '#FFFFFF',
    skeleton: 'rgba(255,255,255,0.2)',
    emptyIconBg: '#FFFFFF',
    statusBar: 'light',
  },
};
