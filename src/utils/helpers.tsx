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

export function compressImageToDataURL(
  file: File,
  maxWidth = 1200,
  quality = 0.82,
  maxChars = 640000
): Promise<string> {
  return new Promise((resolve) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const res = (reader.result as string) || '';
        resolve(res.length <= maxChars ? res : '');
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const originalDataUrl = (event.target?.result as string) || '';
      const img = new Image();
      img.onload = () => {
        const renderAt = (targetWidth: number, targetQuality: number): string => {
          let width = img.width || targetWidth;
          let height = img.height || targetWidth;
          if (width > targetWidth) {
            height = Math.round((height * targetWidth) / width);
            width = targetWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) return originalDataUrl;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const webpUrl = canvas.toDataURL('image/webp', targetQuality);
          if (webpUrl && webpUrl.startsWith('data:image/webp')) {
            return webpUrl;
          }
          const fallbackMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const fallbackUrl = canvas.toDataURL(fallbackMime, targetQuality);
          if (fallbackUrl.length > maxChars && fallbackMime === 'image/png') {
            return canvas.toDataURL('image/jpeg', targetQuality);
          }
          return fallbackUrl;
        };

        let currentWidth = maxWidth;
        let currentQuality = quality;
        let result = renderAt(currentWidth, currentQuality);

        for (let attempt = 0; attempt < 8 && result.length > maxChars; attempt += 1) {
          currentQuality = Math.max(0.35, currentQuality - 0.1);
          currentWidth = Math.max(320, Math.round(currentWidth * 0.75));
          result = renderAt(currentWidth, currentQuality);
          if (result.length > maxChars) {
            const jpegAttempt = (() => {
              let width = img.width || currentWidth;
              let height = img.height || currentWidth;
              if (width > currentWidth) {
                height = Math.round((height * currentWidth) / width);
                width = currentWidth;
              }
              const canvas = document.createElement('canvas');
              canvas.width = Math.max(1, width);
              canvas.height = Math.max(1, height);
              const ctx = canvas.getContext('2d');
              if (!ctx) return result;
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              return canvas.toDataURL('image/jpeg', currentQuality);
            })();
            if (jpegAttempt.length < result.length) {
              result = jpegAttempt;
            }
          }
        }

        resolve(result.length <= maxChars ? result : '');
      };
      img.onerror = () => resolve(originalDataUrl.length <= maxChars ? originalDataUrl : '');
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
