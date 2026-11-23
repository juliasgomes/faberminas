import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BannerSlot, HeroSlide, Product, SiteData } from '../types';
import { INITIAL_SITE_DATA, mergeSiteDataWithDefaults } from '../data/defaultSiteData';

const SETTINGS_COLLECTION = 'site_settings';
const SETTINGS_DOC_ID = 'global';
const PRODUCTS_COLLECTION = 'products';
const BANNERS_COLLECTION = 'banners';

interface CloudSiteSettingsDoc {
  updatedAt?: number;
  logoDataUrl?: string;
  heroBgUrl?: string;
  legalName: string;
  cnpj: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCta?: string;
  aboutUsTitle?: string;
  aboutUsText?: string;
  aboutUsImage?: string;
  differentials?: SiteData['differentials'];
  address: string;
  hours?: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram?: string;
  mapsEmbed?: string;
  categories: SiteData['categories'];
  rooms: SiteData['rooms'];
  segments: SiteData['segments'];
  deletedProductIds?: number[];
  bannersSynced?: boolean;
}

interface CloudBannerDoc {
  id: string;
  kind: 'carousel' | 'promotional' | 'catalog';
  order: number;
  enabled: boolean;
  title: string;
  subtitle?: string;
  showButton?: boolean;
  ctaLabel?: string;
  ctaLink?: string;
  linkUrl?: string;
  image: string;
  updatedAt?: number;
}

export interface CloudSnapshotState {
  hasSettingsDoc: boolean;
  cloudUpdatedAt: number;
  productDocsCount: number;
  bannerDocsCount: number;
}

function clampStr(val: string | undefined, maxLen: number): string {
  const s = (val || '').trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function sanitizeBannerId(rawId: string, fallbackPrefix: string): string {
  const cleaned = (rawId || '')
    .replace(/[^a-zA-Z0-9_\-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
  return cleaned || `${fallbackPrefix}-${Date.now()}`;
}

function buildSettingsPayload(
  data: SiteData,
  deletedProductIds: number[],
  bannersSynced: boolean
): CloudSiteSettingsDoc {
  return {
    updatedAt: Number(data.updatedAt || Date.now()),
    logoDataUrl: clampStr(data.logoDataUrl, 250000),
    heroBgUrl: clampStr(data.heroBgUrl, 1000),
    legalName: clampStr(data.legalName || 'Faberminas', 200),
    cnpj: clampStr(data.cnpj || '27.424.764/0001-60', 50),
    heroTitle: clampStr(data.heroTitle, 300),
    heroSubtitle: clampStr(data.heroSubtitle, 1000),
    heroCta: clampStr(data.heroCta, 150),
    aboutUsTitle: clampStr(data.aboutUsTitle, 200),
    aboutUsText: clampStr(data.aboutUsText, 4000),
    aboutUsImage: clampStr(data.aboutUsImage, 550000),
    differentials: (data.differentials || []).slice(0, 10),
    address: clampStr(data.address, 500),
    hours: clampStr(data.hours, 200),
    phone: clampStr(data.phone, 50),
    whatsapp: clampStr(data.whatsapp, 50),
    email: clampStr(data.email, 150),
    instagram: clampStr(data.instagram, 300),
    mapsEmbed: clampStr(data.mapsEmbed, 1000),
    categories: (data.categories || []).slice(0, 50),
    rooms: (data.rooms || []).slice(0, 50),
    segments: (data.segments || []).slice(0, 20),
    deletedProductIds: deletedProductIds.slice(0, 500),
    bannersSynced
  };
}

function buildProductPayload(product: Product, now: number): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: Math.floor(Number(product.id)),
    name: clampStr(product.name, 240) || 'Produto',
    category: clampStr(product.category, 100) || 'diversos',
    rooms: Array.isArray(product.rooms) ? product.rooms.slice(0, 30).map((r) => String(r)) : [],
    segments: Array.isArray(product.segments)
      ? product.segments.slice(0, 20).map((s) => String(s))
      : [],
    spec: clampStr(product.spec, 1000),
    qtdMinima: Math.max(1, Math.floor(Number(product.qtdMinima) || 1)),
    image: clampStr(product.image, 700000),
    updatedAt: now
  };
  if (product.sku && product.sku.trim()) {
    payload.sku = clampStr(product.sku, 80);
  }
  if (product.about && product.about.trim()) {
    payload.about = clampStr(product.about, 2000);
  }
  if (product.description && product.description.trim()) {
    payload.description = clampStr(product.description, 4000);
  }
  if (product.measures && product.measures.trim()) {
    payload.measures = clampStr(product.measures, 300);
  }
  return payload;
}

function buildBannerEntries(data: SiteData, now: number): { docId: string; payload: CloudBannerDoc }[] {
  const entries: { docId: string; payload: CloudBannerDoc }[] = [];

  (data.banners.carousel || []).forEach((slide: HeroSlide, idx: number) => {
    const cleanId = sanitizeBannerId(slide.id, `slide-${idx + 1}`);
    const docId = `carousel_${cleanId}`.slice(0, 120);
    entries.push({
      docId,
      payload: {
        id: cleanId,
        kind: 'carousel',
        order: idx,
        enabled: slide.enabled !== false,
        title: clampStr(slide.title, 300),
        subtitle: clampStr(slide.subtitle, 600),
        showButton: slide.showButton !== false,
        ctaLabel: clampStr(slide.ctaLabel, 120),
        ctaLink: clampStr(slide.ctaLink, 500),
        image: clampStr(slide.image, 750000),
        updatedAt: now
      }
    });
  });

  (data.banners.promotional || []).forEach((slot: BannerSlot, idx: number) => {
    const cleanId = sanitizeBannerId(slot.id || `promo-${idx + 1}`, `promo-${idx + 1}`);
    const docId = `promo_${cleanId}`.slice(0, 120);
    entries.push({
      docId,
      payload: {
        id: cleanId,
        kind: 'promotional',
        order: idx,
        enabled: slot.enabled !== false,
        title: clampStr(slot.title, 300),
        linkUrl: clampStr(slot.linkUrl, 500),
        showButton: Boolean(slot.showButton),
        ctaLabel: clampStr(slot.ctaLabel, 120),
        image: clampStr(slot.image, 750000),
        updatedAt: now
      }
    });
  });

  const catBanner = data.banners.catalog;
  if (catBanner) {
    entries.push({
      docId: 'catalog_main',
      payload: {
        id: 'catalog-main',
        kind: 'catalog',
        order: 0,
        enabled: Boolean(catBanner.enabled),
        title: clampStr(catBanner.title, 300),
        linkUrl: clampStr(catBanner.linkUrl, 500),
        showButton: Boolean(catBanner.showButton),
        ctaLabel: clampStr(catBanner.ctaLabel, 120),
        image: clampStr(catBanner.image, 750000),
        updatedAt: now
      }
    });
  }

  return entries;
}

function productsAreEqual(a: Product, b: Product): boolean {
  return (
    a.id === b.id &&
    (a.sku || '') === (b.sku || '') &&
    a.name === b.name &&
    a.category === b.category &&
    (a.about || '') === (b.about || '') &&
    (a.description || '') === (b.description || '') &&
    (a.measures || '') === (b.measures || '') &&
    a.spec === b.spec &&
    a.qtdMinima === b.qtdMinima &&
    a.image === b.image &&
    JSON.stringify(a.rooms || []) === JSON.stringify(b.rooms || []) &&
    JSON.stringify(a.segments || []) === JSON.stringify(b.segments || [])
  );
}

export function subscribeToCloudSiteData(
  onMergedData: (merged: SiteData, meta: CloudSnapshotState) => void
): () => void {
  let settingsDoc: CloudSiteSettingsDoc | null = null;
  let hasSettingsDoc = false;
  let productDocsMap = new Map<number, Product>();
  let bannerDocsMap = new Map<string, CloudBannerDoc>();
  let settingsReady = false;
  let productsReady = false;
  let bannersReady = false;

  const emitMerged = () => {
    if (!settingsReady && !productsReady && !bannersReady) return;

    const deletedIds = new Set<number>(
      Array.isArray(settingsDoc?.deletedProductIds) ? settingsDoc!.deletedProductIds : []
    );

    // Base de produtos vem de INITIAL_SITE_DATA menos excluídos, sobrescrita pelos docs da nuvem
    const mergedProductsMap = new Map<number, Product>();
    INITIAL_SITE_DATA.products.forEach((p) => {
      if (!deletedIds.has(p.id)) {
        mergedProductsMap.set(p.id, p);
      }
    });
    productDocsMap.forEach((cloudProd, id) => {
      if (!deletedIds.has(id)) {
        mergedProductsMap.set(id, cloudProd);
      }
    });

    // Ordenação: preserva produtos novos no topo (IDs > max default) e ordem padrão nos demais
    const defaultOrderMap = new Map<number, number>();
    INITIAL_SITE_DATA.products.forEach((p, idx) => defaultOrderMap.set(p.id, idx));

    const mergedProducts = Array.from(mergedProductsMap.values()).sort((a, b) => {
      const aDefault = defaultOrderMap.get(a.id);
      const bDefault = defaultOrderMap.get(b.id);
      if (aDefault !== undefined && bDefault !== undefined) return aDefault - bDefault;
      if (aDefault === undefined && bDefault === undefined) return b.id - a.id;
      return aDefault === undefined ? -1 : 1;
    });

    let mergedBanners = INITIAL_SITE_DATA.banners;
    if (settingsDoc?.bannersSynced || bannerDocsMap.size > 0) {
      const allBanners = Array.from(bannerDocsMap.values());
      const carousel = allBanners
        .filter((b) => b.kind === 'carousel')
        .sort((a, b) => a.order - b.order)
        .map(
          (b): HeroSlide => ({
            id: b.id,
            enabled: b.enabled !== false,
            title: b.title || '',
            subtitle: b.subtitle || '',
            showButton: b.showButton !== false,
            ctaLabel: b.ctaLabel || '',
            ctaLink: b.ctaLink || '#/produtos',
            image: b.image || ''
          })
        );

      const promotional = allBanners
        .filter((b) => b.kind === 'promotional')
        .sort((a, b) => a.order - b.order)
        .map(
          (b): BannerSlot => ({
            id: b.id,
            enabled: b.enabled !== false,
            image: b.image || '',
            title: b.title || '',
            linkUrl: b.linkUrl || '',
            showButton: Boolean(b.showButton),
            ctaLabel: b.ctaLabel || 'Ver ofertas'
          })
        );

      const catBannerDoc = allBanners.find((b) => b.kind === 'catalog');
      const catalog: BannerSlot = catBannerDoc
        ? {
            enabled: Boolean(catBannerDoc.enabled),
            image: catBannerDoc.image || '',
            title: catBannerDoc.title || '',
            linkUrl: catBannerDoc.linkUrl || '',
            showButton: Boolean(catBannerDoc.showButton),
            ctaLabel: catBannerDoc.ctaLabel || 'Ver ofertas'
          }
        : INITIAL_SITE_DATA.banners.catalog;

      mergedBanners = {
        carousel: carousel.length > 0 ? carousel : INITIAL_SITE_DATA.banners.carousel,
        promotional,
        catalog
      };
    }

    const partial: Partial<SiteData> = {
      ...(settingsDoc || {}),
      products: mergedProducts,
      banners: mergedBanners
    };

    const merged = mergeSiteDataWithDefaults(INITIAL_SITE_DATA, partial, true);
    onMergedData(merged, {
      hasSettingsDoc,
      cloudUpdatedAt: Number(settingsDoc?.updatedAt || 0),
      productDocsCount: productDocsMap.size,
      bannerDocsCount: bannerDocsMap.size
    });
  };

  const unsubSettings = onSnapshot(
    doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID),
    (snapshot) => {
      settingsReady = true;
      hasSettingsDoc = snapshot.exists();
      settingsDoc = snapshot.exists() ? (snapshot.data() as CloudSiteSettingsDoc) : null;
      emitMerged();
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`);
    }
  );

  const unsubProducts = onSnapshot(
    collection(db, PRODUCTS_COLLECTION),
    (snapshot) => {
      productsReady = true;
      const nextMap = new Map<number, Product>();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Product;
        if (typeof data.id === 'number') {
          nextMap.set(data.id, data);
        }
      });
      productDocsMap = nextMap;
      emitMerged();
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
    }
  );

  const unsubBanners = onSnapshot(
    collection(db, BANNERS_COLLECTION),
    (snapshot) => {
      bannersReady = true;
      const nextMap = new Map<string, CloudBannerDoc>();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CloudBannerDoc;
        if (data && data.kind) {
          nextMap.set(docSnap.id, data);
        }
      });
      bannerDocsMap = nextMap;
      emitMerged();
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, BANNERS_COLLECTION);
    }
  );

  return () => {
    unsubSettings();
    unsubProducts();
    unsubBanners();
  };
}

export async function syncSiteDataDiffToCloud(
  prevData: SiteData,
  nextData: SiteData
): Promise<void> {
  const now = Number(nextData.updatedAt || Date.now());

  // 1. Produtos alterados ou adicionados
  const prevMap = new Map<number, Product>();
  prevData.products.forEach((p) => prevMap.set(p.id, p));
  const nextIds = new Set<number>();

  const productWrites: Product[] = [];
  nextData.products.forEach((p) => {
    nextIds.add(p.id);
    const oldP = prevMap.get(p.id);
    if (!oldP || !productsAreEqual(oldP, p)) {
      productWrites.push(p);
    }
  });

  // Produtos excluídos em relação ao estado anterior ou padrão
  const deletedProductIds = INITIAL_SITE_DATA.products
    .filter((dp) => !nextIds.has(dp.id))
    .map((dp) => dp.id);

  const removedIds = prevData.products
    .filter((p) => !nextIds.has(p.id))
    .map((p) => p.id);

  for (const prod of productWrites) {
    const docId = String(Math.floor(Number(prod.id)));
    const path = `${PRODUCTS_COLLECTION}/${docId}`;
    try {
      await setDoc(doc(db, PRODUCTS_COLLECTION, docId), buildProductPayload(prod, now));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  for (const removedId of removedIds) {
    const docId = String(Math.floor(Number(removedId)));
    const path = `${PRODUCTS_COLLECTION}/${docId}`;
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, docId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  // 2. Banners (sempre que banners mudarem ou na primeira gravação)
  const bannersChanged =
    JSON.stringify(prevData.banners) !== JSON.stringify(nextData.banners);
  if (bannersChanged) {
    const targetBanners = buildBannerEntries(nextData, now);
    const targetDocIds = new Set(targetBanners.map((b) => b.docId));

    try {
      const existingSnap = await getDocs(collection(db, BANNERS_COLLECTION));
      for (const oldDoc of existingSnap.docs) {
        if (!targetDocIds.has(oldDoc.id)) {
          await deleteDoc(doc(db, BANNERS_COLLECTION, oldDoc.id));
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, BANNERS_COLLECTION);
    }

    for (const entry of targetBanners) {
      const path = `${BANNERS_COLLECTION}/${entry.docId}`;
      try {
        await setDoc(doc(db, BANNERS_COLLECTION, entry.docId), entry.payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
  }

  // 3. Configurações globais (sempre atualiza para registrar updatedAt, deletedProductIds e bannersSynced)
  const settingsPath = `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`;
  try {
    const existingBannersSnap = bannersChanged
      ? null
      : await getDocs(collection(db, BANNERS_COLLECTION));
    const bannersSynced =
      bannersChanged || Boolean(existingBannersSnap && existingBannersSnap.size > 0);
    await setDoc(
      doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID),
      buildSettingsPayload(nextData, deletedProductIds, bannersSynced)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, settingsPath);
  }
}

export async function pushAllCustomizationsToCloud(localData: SiteData): Promise<number> {
  const now = Number(localData.updatedAt || Date.now());
  let syncedCount = 0;

  // Produtos customizados (novos, editados ou com imagem)
  const defaultMap = new Map<number, Product>();
  INITIAL_SITE_DATA.products.forEach((p) => defaultMap.set(p.id, p));
  const localIds = new Set<number>();

  for (const prod of localData.products) {
    localIds.add(prod.id);
    const baseProd = defaultMap.get(prod.id);
    if (!baseProd || !productsAreEqual(baseProd, prod)) {
      const docId = String(Math.floor(Number(prod.id)));
      const path = `${PRODUCTS_COLLECTION}/${docId}`;
      try {
        await setDoc(doc(db, PRODUCTS_COLLECTION, docId), buildProductPayload(prod, now));
        syncedCount += 1;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
  }

  const deletedProductIds = INITIAL_SITE_DATA.products
    .filter((dp) => !localIds.has(dp.id))
    .map((dp) => dp.id);

  // Banners
  const targetBanners = buildBannerEntries(localData, now);
  for (const entry of targetBanners) {
    const path = `${BANNERS_COLLECTION}/${entry.docId}`;
    try {
      await setDoc(doc(db, BANNERS_COLLECTION, entry.docId), entry.payload);
      syncedCount += 1;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // Settings
  const settingsPath = `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`;
  try {
    await setDoc(
      doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID),
      buildSettingsPayload(localData, deletedProductIds, true)
    );
    syncedCount += 1;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, settingsPath);
  }

  return syncedCount;
}

export async function restoreCloudDefaults(): Promise<void> {
  try {
    const productsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    for (const d of productsSnap.docs) {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, d.id));
    }

    const bannersSnap = await getDocs(collection(db, BANNERS_COLLECTION));
    for (const d of bannersSnap.docs) {
      await deleteDoc(doc(db, BANNERS_COLLECTION, d.id));
    }

    await deleteDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, SETTINGS_COLLECTION);
  }
}
