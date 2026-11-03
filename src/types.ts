export type StyleName = 'cizgi' | 'blok' | 'cam' | 'editoryal' | 'terminal';
export type Pos = 'ust' | 'orta' | 'alt' | 'sol-ust' | 'sag-ust' | 'sol-alt' | 'sag-alt';

export type Theme = {
  primary: string;   // ana renk
  secondary: string; // ikinci renk
  accent: string;    // sadece altı çizilecek uyarı ve vurgu
  style: StyleName;
};

// ref: 'ekran' ise yüzde koordinatları ve konumlar tuvale değil ekran penceresine göredir (sadece Dikey).
type Base = {start: number; dur: number; ref?: 'ekran'}; // saniye

export type Ev =
  | (Base & {type: 'logo'; file: string; label?: string; pos?: Pos})
  | (Base & {type: 'counter'; from?: number; to: number; prefix?: string; suffix?: string; label?: string; pos?: Pos})
  | (Base & {type: 'search'; query: string; site?: string; pos?: Pos})
  | (Base & {type: 'frame'; x: number; y: number; w: number; h: number; label?: string}) // yüzde
  | (Base & {type: 'card'; title: string; body?: string; pos?: Pos})
  | (Base & {type: 'shot'; file: string; caption?: string; pos?: Pos})
  | (Base & {type: 'text'; text: string; pos?: Pos; tone?: 'normal' | 'uyari'})
  | (Base & {type: 'title'; title: string; sub?: string; pos?: Pos})
  | (Base & {type: 'lowerthird'; name: string; role?: string})
  | (Base & {type: 'list'; items: string[]; pos?: Pos})
  | (Base & {type: 'cursor'; x: number; y: number; fromX?: number; fromY?: number; click?: boolean; ring?: boolean}) // yüzde
  | (Base & {type: 'keys'; keys: string[]; pos?: Pos})
  | (Base & {type: 'progress'})
  | (Base & {type: 'compare'; before: string; after: string; beforeLabel?: string; afterLabel?: string})
  | (Base & {type: 'chart'; bars: number[]; labels?: string[]; title?: string; pos?: Pos})
  | (Base & {type: 'spotlight'; x: number; y: number; w: number; h: number}) // yüzde
  | (Base & {type: 'marker'; x: number; y: number; w: number; h: number}) // yüzde
  | (Base & {type: 'arrow'; x: number; y: number; from?: 'sol' | 'sag' | 'ust' | 'alt'; label?: string}) // yüzde
  | (Base & {type: 'subscribe'; text?: string; pos?: Pos})
  | (Base & {type: 'chapter'; label: string; index?: number})
  | (Base & {type: 'countdown'; from: number; pos?: Pos})
  | (Base & {type: 'caption'; text: string; karaoke?: boolean; pos?: Pos});

export type Props = {
  width: number;
  height: number;
  fps: number;
  duration: number; // saniye
  theme: Theme;
  events: Ev[];
  // yüz kamerasının bulunduğu alan (yüzde). Bu alana hiçbir şey çizilmez.
  camera?: {x: number; y: number; w: number; h: number};
};

// ---- Dikey (9:16) sahne: yatay ekran kaydını kırpıp takip eder, yüzü altta gösterir ----
// Kadraj noktası: t anında ekranın (cx, cy) merkezi ve w genişliği (kaynağın yüzdesi) görünür olmalı.
export type Kadraj = {t: number; cx: number; cy: number; w: number};

export type DikeyProps = Props & {
  video: string;                       // public/m/ altındaki dosya adı (hız uygulanmış, ses önemsiz)
  srcW: number;
  srcH: number;
  face?: {x: number; y: number; w: number; h: number}; // kaynaktaki yüz kamerası kutusu (yüzde)
  faceShow: [number, number][];        // yüzün göründüğü aralıklar (sn). Boşsa yüz hiç görünmez.
  kadraj: Kadraj[];                    // en az 1 nokta, t'ye göre sıralı
  bg?: string;                         // arka plan rengi
};
