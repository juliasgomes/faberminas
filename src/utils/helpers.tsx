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

export function resolveLogoSrc(logoDataUrl?: string): string {
  const raw = logoDataUrl || EXACT_LOGO_PATH;
  if (raw.startsWith('data:') || raw.startsWith('http')) {
    return raw;
  }
  if (raw.startsWith('/') && !raw.startsWith(CLEAN_BASE)) {
    return `${CLEAN_BASE}${raw.replace(/^\/+/, '')}`;
  }
  return raw;
}

export function compressImageToDataURL(file: File, maxWidth = 720, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(outputType, quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
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
