export interface Product {
  id: number;
  sku?: string;
  name: string;
  category: string;
  rooms: string[];
  segments: string[];
  about?: string;
  description?: string;
  measures?: string;
  spec: string;
  qtdMinima: number;
  image: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  desc: string;
}

export interface RoomZone {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  desc: string;
}

export interface Segment {
  id: string;
  label: string;
  icon: string;
  desc: string;
}

export interface Differential {
  icon: string;
  title: string;
  desc: string;
}

export interface BannerSlot {
  id?: string;
  enabled: boolean;
  image: string;
  title: string;
  linkUrl: string;
  showButton?: boolean;
  ctaLabel?: string;
}

export interface HeroSlide {
  id: string;
  enabled: boolean;
  title: string;
  subtitle: string;
  showButton?: boolean;
  ctaLabel: string;
  ctaLink: string;
  image: string;
}

export interface SiteData {
  updatedAt?: number;
  logoDataUrl: string;
  heroBgUrl: string;
  legalName: string;
  cnpj: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  aboutUsTitle?: string;
  aboutUsText?: string;
  aboutUsImage?: string;
  differentials: Differential[];
  address: string;
  hours: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  mapsEmbed: string;
  categories: Category[];
  rooms: RoomZone[];
  segments: Segment[];
  products: Product[];
  banners: {
    carousel: HeroSlide[];
    promotional: BannerSlot[];
    catalog: BannerSlot;
    secondary1?: BannerSlot;
    secondary2?: BannerSlot;
    home?: BannerSlot;
  };
}

export interface QuoteItem {
  id: number;
  sku?: string;
  name: string;
  spec: string;
  measures?: string;
  qty: number;
  qtdMinima: number;
}
