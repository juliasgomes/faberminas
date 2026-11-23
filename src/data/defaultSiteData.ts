import { Product, SiteData } from '../types';
import { REAL_CATALOG_PRODUCTS, REAL_CATEGORIES } from './realCatalog';
import siteConfigOverride from './siteConfig.json';

const BASE = import.meta.env.BASE_URL || './';
export const CLEAN_BASE = BASE.endsWith('/') ? BASE : `${BASE}/`;
export const EXACT_LOGO_PATH = `${CLEAN_BASE}assets/aistudio/logo_d65a277a.png`;
export const OG_BRAND_IMAGE_PATH = `${CLEAN_BASE}assets/aistudio/Design_sem_nome_e70a3315.png`;
export const STORAGE_KEY = 'faberminas_site_data_v7';
export const ADMIN_SYNC_META_KEY = 'faberminas_admin_export_meta_v1';
export const LEGACY_STORAGE_KEYS = [
  'faberminas_site_data_v6',
  'faberminas_site_data_v5',
  'faberminas_site_data_v4',
  'faberminas_site_data_v3',
  'faberminas_site_data_v2'
];

export const EMBEDDED_FAVICON_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23004d61'/%3E%3Ctext x='32' y='28.5' text-anchor='middle' fill='%23ffffff' font-family='Inter,system-ui,-apple-system,Segoe UI,sans-serif' font-weight='800' font-size='16.5' letter-spacing='-0.4'%3EFaber%3C/text%3E%3Ctext x='32' y='48.5' text-anchor='middle' fill='%23ffffff' font-family='Inter,system-ui,-apple-system,Segoe UI,sans-serif' font-weight='800' font-size='16.5' letter-spacing='-0.4'%3EMinas%3C/text%3E%3C/svg%3E";

export const EMBEDDED_FAVICON_32 =
  'data:image/png;base64,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';

export const EMBEDDED_FAVICON =
  'data:image/png;base64,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';

export const DEFAULT_SITE_DATA: SiteData = {
  updatedAt: 0,
  logoDataUrl: EXACT_LOGO_PATH,
  heroBgUrl: '',
  legalName: 'Faberminas',
  cnpj: '27.424.764/0001-60',
  heroTitle: 'Materiais de higiene, limpeza e suprimentos para cada setor.',
  heroSubtitle:
    'Atendemos empresas, comércios, condomínios (CNPJ) e clientes residenciais (CPF) com estoque variado, preços competitivos e entrega própria em BH e Região Metropolitana.',
  heroCta: 'Venha conhecer nossos produtos',
  aboutUsTitle: 'Sobre a Faberminas',
  aboutUsText:
    'Atuamos em Belo Horizonte e Região Metropolitana no fornecimento completo de materiais de limpeza, higiene pessoal, descartáveis, hospitalar, EPIs e utilidades para manutenção.\n\nCom atendimento ágil tanto para empresas e condomínios (CNPJ) quanto para consumidores residenciais (CPF), unimos estoque variado à pronta entrega, logística própria e cotação direta sem burocracia pelo WhatsApp.',
  aboutUsImage: '',
  differentials: [
    { icon: 'truck', title: 'Entrega Própria', desc: 'Logística ágil em BH e Região Metropolitana' },
    { icon: 'building-2', title: 'Empresas (CNPJ) e CPF', desc: 'Atendimento corporativo, condomínios e vendas residenciais' },
    { icon: 'package-check', title: 'Pronta Entrega', desc: 'Estoque variado com reposição constante' },
    { icon: 'headphones', title: 'Cotação Rápida', desc: 'Monte sua lista e envie direto pelo WhatsApp' }
  ],
  address: 'R. dos Arquitetos, 408 — Alípio de Melo\nBelo Horizonte - MG, CEP 30840-160',
  hours: 'Segunda a Sexta: 08h00 às 18h00',
  phone: '(31) 3333-4455',
  whatsapp: '(31) 99999-8877',
  email: 'contato@faberminas.com.br',
  instagram: 'https://instagram.com/faberminas',
  mapsEmbed:
    'https://maps.google.com/maps?q=R.%20dos%20Arquitetos,%20408%20-%20Al%C3%ADpio%20de%20Melo,%20Belo%20Horizonte%20-%20MG,%2030840-160&t=&z=16&ie=UTF8&iwloc=&output=embed',
  categories: REAL_CATEGORIES,
  rooms: [
    {
      id: 'cozinha',
      label: 'Cozinha & Copa',
      shortLabel: 'Cozinha',
      icon: 'utensils',
      desc: 'Panos de prato, esponjas, fibras, lixeiras e acessórios para copas e cozinhas.'
    },
    {
      id: 'banheiro',
      label: 'Banheiro & Sanitários',
      shortLabel: 'Banheiro',
      icon: 'sparkles',
      desc: 'Sabonetes, escovas sanitárias, desodorizadores, fraldas e cuidados pessoais.'
    },
    {
      id: 'area-servico',
      label: 'Área de Serviço & Externa',
      shortLabel: 'Área de Serviço',
      icon: 'droplets',
      desc: 'Rodos, vassouras, baldes, panos de chão, mops e itens de manutenção.'
    },
    {
      id: 'escritorio',
      label: 'Escritório & Recepção',
      shortLabel: 'Escritório',
      icon: 'briefcase',
      desc: 'Lixeiras de escritório, caixas organizadoras, capachos e suprimentos gerais.'
    }
  ],
  segments: [
    {
      id: 'condominios',
      label: 'Condomínios',
      icon: 'building',
      desc: 'Vassouras, rodos, lixeiras, capas de caixa d’água e manutenção predial.'
    },
    {
      id: 'escritorios',
      label: 'Escritórios',
      icon: 'briefcase',
      desc: 'Lixeiras linha Office, flanelas, capachos e suprimentos de copa e recepção.'
    },
    {
      id: 'clinicas',
      label: 'Clínicas & Saúde',
      icon: 'heart-pulse',
      desc: 'Luvas nitrílicas e látex, aventais TNT, compressas e linha hospitalar.'
    },
    {
      id: 'restaurantes',
      label: 'Bares & Restaurantes',
      icon: 'utensils',
      desc: 'Fibras pesadas, luvas descartáveis, toucas TNT, rodos e panos de cozinha.'
    },
    {
      id: 'residencial',
      label: 'Uso Residencial (CPF)',
      icon: 'home',
      desc: 'Higiene pessoal, cuidados infantis e itens de limpeza direta para pessoa física.'
    }
  ],
  products: REAL_CATALOG_PRODUCTS,
  banners: {
    carousel: [
      {
        id: 'slide-1',
        enabled: true,
        title: 'Materiais de higiene, limpeza e suprimentos para cada setor.',
        subtitle:
          'Atendemos empresas, comércios, condomínios (CNPJ) e clientes residenciais (CPF) com estoque variado e entrega própria em BH e Região Metropolitana.',
        showButton: true,
        ctaLabel: 'Venha conhecer nossos produtos',
        ctaLink: '#/produtos',
        image: ''
      },
      {
        id: 'slide-2',
        enabled: true,
        title: 'Catálogo completo para Condomínios, Clínicas, Empresas e Uso Residencial.',
        subtitle:
          'Rodos, vassouras, luvas descartáveis, linha hospitalar, ferramentas e higiene pessoal com atendimento ágil pelo WhatsApp.',
        showButton: true,
        ctaLabel: 'Ver catálogo completo',
        ctaLink: '#/produtos',
        image: ''
      },
      {
        id: 'slide-3',
        enabled: true,
        title: 'Entrega própria ágil em Belo Horizonte e Região Metropolitana.',
        subtitle:
          'Monte sua cesta de cotação sem burocracia para compras corporativas (CNPJ) ou residenciais (CPF).',
        showButton: true,
        ctaLabel: 'Compre por ambiente',
        ctaLink: '#ambientes',
        image: ''
      }
    ],
    promotional: [],
    catalog: {
      enabled: false,
      image: '',
      title: '',
      linkUrl: '',
      showButton: false,
      ctaLabel: 'Ver ofertas'
    }
  }
};

function sanitizeMediaString(url?: string): string {
  const s = (url || '').trim();
  if (!s || s.startsWith('blob:')) return '';
  return s;
}

export function mergeSiteDataWithDefaults(
  base: SiteData,
  raw?: Partial<SiteData> | null,
  preserveCatalog = true
): SiteData {
  if (!raw || typeof raw !== 'object' || Object.keys(raw).length === 0) {
    return base;
  }

  const normalizeProducts = (rawList: Product[]): Product[] =>
    rawList.map((p) => {
      const fallbackProd = base.products.find(
        (dp) => dp.id === p.id || (p.sku && dp.sku === p.sku)
      );
      return {
        ...p,
        sku: p.sku || fallbackProd?.sku,
        about: p.about ?? fallbackProd?.about ?? '',
        description: p.description ?? fallbackProd?.description ?? '',
        measures: p.measures ?? fallbackProd?.measures ?? '',
        qtdMinima: Math.max(1, Number(p.qtdMinima ?? fallbackProd?.qtdMinima) || 1),
        rooms: Array.isArray(p.rooms) ? p.rooms : fallbackProd?.rooms || [],
        segments: Array.isArray(p.segments) ? p.segments : fallbackProd?.segments || [],
        image: sanitizeMediaString(p.image)
      };
    });

  const rawBanners = raw.banners || ({} as Partial<SiteData['banners']>);
  const normalizedPromotional = Array.isArray(rawBanners.promotional)
    ? rawBanners.promotional.map((b) => ({
        ...b,
        image: sanitizeMediaString(b.image)
      }))
    : [rawBanners.secondary1, rawBanners.secondary2, rawBanners.home]
        .filter((b): b is NonNullable<typeof b> => Boolean(b && sanitizeMediaString(b.image)))
        .map((b, idx) => ({
          id: b.id || `promo-${idx + 1}`,
          enabled: b.enabled !== false,
          image: sanitizeMediaString(b.image),
          title: b.title || '',
          linkUrl: b.linkUrl || '',
          showButton: Boolean(b.showButton),
          ctaLabel: b.ctaLabel || 'Ver ofertas'
        }));

  const rawProducts =
    preserveCatalog && Array.isArray(raw.products) && raw.products.length > 0
      ? normalizeProducts(raw.products)
      : base.products;

  return {
    ...base,
    ...raw,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : base.updatedAt || 0,
    legalName:
      raw.legalName && !raw.legalName.includes('Distribuidora') ? raw.legalName : 'Faberminas',
    logoDataUrl: sanitizeMediaString(raw.logoDataUrl) || EXACT_LOGO_PATH,
    heroBgUrl: sanitizeMediaString(raw.heroBgUrl),
    aboutUsTitle: raw.aboutUsTitle ?? base.aboutUsTitle,
    aboutUsText: raw.aboutUsText ?? base.aboutUsText,
    aboutUsImage: sanitizeMediaString(raw.aboutUsImage) || base.aboutUsImage || '',
    differentials:
      Array.isArray(raw.differentials) && raw.differentials.length > 0
        ? raw.differentials
        : base.differentials,
    categories:
      preserveCatalog && Array.isArray(raw.categories) && raw.categories.length > 0
        ? raw.categories
        : base.categories,
    rooms: Array.isArray(raw.rooms) && raw.rooms.length > 0 ? raw.rooms : base.rooms,
    segments:
      Array.isArray(raw.segments) && raw.segments.length > 0 ? raw.segments : base.segments,
    products: rawProducts,
    banners: {
      carousel:
        Array.isArray(rawBanners.carousel) && rawBanners.carousel.length > 0
          ? rawBanners.carousel.map((s) => ({
              ...s,
              image: sanitizeMediaString(s.image),
              showButton: s.showButton !== false
            }))
          : base.banners.carousel,
      promotional: normalizedPromotional,
      catalog: {
        ...base.banners.catalog,
        ...(rawBanners.catalog || {}),
        image: sanitizeMediaString(rawBanners.catalog?.image) || base.banners.catalog.image
      }
    }
  };
}

export const INITIAL_SITE_DATA: SiteData = mergeSiteDataWithDefaults(
  DEFAULT_SITE_DATA,
  siteConfigOverride as Partial<SiteData>,
  true
);

