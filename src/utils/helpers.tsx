import React from 'react';
import {
  Truck,
  Building2,
  PackageCheck,
  Headphones,
  Sparkles,
  Droplets,
  CupSoda,
  Briefcase,
  LayoutGrid,
  Tag,
  Utensils,
  Home,
  ShieldCheck,
  Box,
  Building,
  HeartPulse,
  Wrench,
  HardHat,
  Stethoscope,
  Package
} from 'lucide-react';
import { CLEAN_BASE, EXACT_LOGO_PATH } from '../data/defaultSiteData';

export function onlyDigits(str: string): string {
  return (str || '').replace(/\D/g, '');
}

export const FALLBACK_LOGO_PATH = `${CLEAN_BASE}logo.png`;

export function sanitizePersistentMediaUrl(url?: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed || trimmed.startsWith('blob:')) return '';
  return trimmed;
}

export function resolveLogoSrc(logoDataUrl?: string): string {
  const raw = sanitizePersistentMediaUrl(logoDataUrl) || EXACT_LOGO_PATH;
  if (raw.startsWith('data:') || raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  if (raw.startsWith('./')) {
    return `${CLEAN_BASE}${raw.slice(2)}`;
  }
  if (raw.startsWith('/') && !raw.startsWith(CLEAN_BASE)) {
    return `${CLEAN_BASE}${raw.replace(/^\/+/, '')}`;
  }
  return `${CLEAN_BASE}${raw.replace(/^\.\//, '')}`.replace(/([^:]\/)\/+/g, '$1');
}

export function compressImageToDataURL(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const originalDataUrl = (event.target?.result as string) || '';
      const img = new Image();
      img.onload = () => {
        let width = img.width || maxWidth;
        let height = img.height || maxWidth;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Preferir WebP (mantém transparência e comprime banners/fotos com alta fidelidade)
          const webpUrl = canvas.toDataURL('image/webp', quality);
          if (webpUrl && webpUrl.startsWith('data:image/webp')) {
            resolve(webpUrl);
            return;
          }
          // Fallback caso o navegador não encode WebP
          const fallbackMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(fallbackMime, quality));
        } else {
          resolve(originalDataUrl);
        }
      };
      img.onerror = () => resolve(originalDataUrl);
      img.src = originalDataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export function renderLucideIcon(iconName: string, className = 'w-5 h-5'): React.ReactNode {
  switch (iconName) {
    case 'truck':
      return <Truck className={className} />;
    case 'building-2':
      return <Building2 className={className} />;
    case 'building':
      return <Building className={className} />;
    case 'heart-pulse':
      return <HeartPulse className={className} />;
    case 'package-check':
      return <PackageCheck className={className} />;
    case 'headphones':
      return <Headphones className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'droplets':
      return <Droplets className={className} />;
    case 'cup-soda':
      return <CupSoda className={className} />;
    case 'briefcase':
      return <Briefcase className={className} />;
    case 'layout-grid':
      return <LayoutGrid className={className} />;
    case 'utensils':
      return <Utensils className={className} />;
    case 'home':
      return <Home className={className} />;
    case 'shield-check':
      return <ShieldCheck className={className} />;
    case 'box':
      return <Box className={className} />;
    case 'wrench':
      return <Wrench className={className} />;
    case 'hard-hat':
      return <HardHat className={className} />;
    case 'stethoscope':
      return <Stethoscope className={className} />;
    case 'package':
      return <Package className={className} />;
    default:
      return <Tag className={className} />;
  }
}

export function slugifyId(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
