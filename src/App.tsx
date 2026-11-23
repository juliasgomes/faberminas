import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ClipboardList,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Search,
  XCircle,
  MessageCircle,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  MapPin,
  Clock,
  Navigation,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { Product, QuoteItem, SiteData } from './types';
import {
  DEFAULT_SITE_DATA,
  INITIAL_SITE_DATA,
  LEGACY_STORAGE_KEYS,
  STORAGE_KEY,
  mergeSiteDataWithDefaults
} from './data/defaultSiteData';
import {
  FALLBACK_LOGO_PATH,
  onlyDigits,
  renderLucideIcon,
  resolveLogoSrc
} from './utils/helpers';
import { User } from 'firebase/auth';
import { HeroBannerCarousel } from './components/HeroBannerCarousel';
import { InteractiveHouseSection } from './components/InteractiveHouseSection';
import { CatalogView } from './components/CatalogView';
import { QuoteDrawer } from './components/QuoteDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductDetailModal } from './components/ProductDetailModal';
import {
  signInAdminWithGoogle,
  signOutAdmin,
  subscribeToAuth,
  verifyUserIsAdmin
} from './firebase';
import {
  CloudSnapshotState,
  pushAllCustomizationsToCloud,
  restoreCloudDefaults,
  subscribeToCloudSiteData,
  syncSiteDataDiffToCloud
} from './services/cloudSiteSync';

declare global {
  interface Window {
    __FABERMINAS_SITE_DATA__?: Partial<SiteData>;
  }
}

function hydrateSiteData(): SiteData {
  const embedded = typeof window !== 'undefined' ? window.__FABERMINAS_SITE_DATA__ : undefined;
  const canonicalBase = embedded
    ? mergeSiteDataWithDefaults(INITIAL_SITE_DATA, embedded, true)
    : INITIAL_SITE_DATA;
  const canonicalUpdatedAt = Number(canonicalBase.updatedAt || 0);

  try {
    const savedV6 = localStorage.getItem(STORAGE_KEY);
    if (savedV6) {
      const parsed = JSON.parse(savedV6) as Partial<SiteData>;
      const parsedUpdatedAt = Number(parsed?.updatedAt || 0);
      // Se o código/siteConfig.json ou INITIAL_SITE_DATA embutido for mais novo ou igual, prevalece o estado global
      if (canonicalUpdatedAt > 0 && canonicalUpdatedAt >= parsedUpdatedAt) {
        return canonicalBase;
      }
      return mergeSiteDataWithDefaults(canonicalBase, parsed, true);
    }

    // Migração legada (v5/v4/v3/v2): preserva apenas se não houver snapshot mais novo em INITIAL_SITE_DATA
    if (canonicalUpdatedAt === 0) {
      for (const oldKey of LEGACY_STORAGE_KEYS) {
        const savedLegacy = localStorage.getItem(oldKey);
        if (savedLegacy) {
          const parsedLegacy = JSON.parse(savedLegacy) as Partial<SiteData>;
          return mergeSiteDataWithDefaults(
            canonicalBase,
            {
              ...parsedLegacy,
              heroBgUrl:
                parsedLegacy.heroBgUrl && parsedLegacy.heroBgUrl.includes('images.unsplash.com')
                  ? ''
                  : parsedLegacy.heroBgUrl
            },
            false
          );
        }
      }
    }
  } catch (e) {
    console.error('Erro ao ler dados salvos:', e);
  }

  return canonicalBase;
}

function parseCatalogFiltersFromHash(hash: string): {
  cat: string;
  room: string;
  seg: string;
  q: string;
} {
  const qs = hash.split('?')[1] || '';
  const params = new URLSearchParams(qs);
  return {
    cat: params.get('cat') || 'todos',
    room: params.get('room') || 'todos',
    seg: params.get('seg') || 'todos',
    q: params.get('q') || ''
  };
}

export default function App() {
  const [siteData, setSiteData] = useState<SiteData>(hydrateSiteData);
  const siteDataRef = useRef<SiteData>(siteData);
  const lastCloudSyncedDataRef = useRef<SiteData>(INITIAL_SITE_DATA);
  const [currentRoute, setCurrentRoute] = useState<string>(() => window.location.hash || '#/inicio');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isCloudAdmin, setIsCloudAdmin] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [cloudMeta, setCloudMeta] = useState<CloudSnapshotState>({
    hasSettingsDoc: false,
    cloudUpdatedAt: 0,
    productDocsCount: 0,
    bannerDocsCount: 0
  });
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const autoPushedEmptyCloudRef = useRef<boolean>(false);
  const cloudMetaRef = useRef<CloudSnapshotState>(cloudMeta);
  const cloudWriteQueueRef = useRef<Promise<void>>(Promise.resolve());
  const activeCloudWritesRef = useRef<number>(0);
  const hasPendingLocalDraftRef = useRef<boolean>(false);

  // Filtros e Busca Global (#/produtos e Header)
  const initialFilters = parseCatalogFiltersFromHash(window.location.hash || '');
  const [activeCategory, setActiveCategory] = useState<string>(initialFilters.cat);
  const [activeRoom, setActiveRoom] = useState<string>(initialFilters.room);
  const [activeSegment, setActiveSegment] = useState<string>(initialFilters.seg);
  const [searchQuery, setSearchQuery] = useState<string>(initialFilters.q);
  const [headerAutocompleteOpen, setHeaderAutocompleteOpen] = useState(false);
  const [brokenSearchThumbs, setBrokenSearchThumbs] = useState<Record<number, boolean>>({});
  const headerSearchRef = useRef<HTMLDivElement>(null);

  // Interface Pública
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const productsDropdownRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsExpanded, setMobileProductsExpanded] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [quoteDrawerOpen, setQuoteDrawerOpen] = useState(false);
  const [quoteCart, setQuoteCart] = useState<QuoteItem[]>([]);
  const [headerSelectedProduct, setHeaderSelectedProduct] = useState<Product | null>(null);
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [logoLoadStage, setLogoLoadStage] = useState<'primary' | 'fallback' | 'text'>('primary');
  const [brokenPromoImages, setBrokenPromoImages] = useState<Record<string, boolean>>({});
  const [brokenAboutImage, setBrokenAboutImage] = useState(false);

  useEffect(() => {
    setLogoLoadStage('primary');
  }, [siteData.logoDataUrl]);

  useEffect(() => {
    setBrokenAboutImage(false);
  }, [siteData.aboutUsImage]);

  // Manter título SEO completo e URL canônica/OpenGraph sem sobrescrever os favicons multi-formato
  useEffect(() => {
    document.title = 'Faberminas';

    const canonicalHref = window.location.origin + window.location.pathname;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalHref);

    let ogUrlMeta = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
    if (!ogUrlMeta) {
      ogUrlMeta = document.createElement('meta');
      ogUrlMeta.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlMeta);
    }
    ogUrlMeta.setAttribute('content', canonicalHref);
  }, []);

  // Autenticação Firebase para gravação administrativa em nuvem
  useEffect(() => {
    const unsub = subscribeToAuth(async (user) => {
      setAuthUser(user);
      const adminOk = await verifyUserIsAdmin(user);
      setIsCloudAdmin(adminOk);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Sincronização em tempo real com Firestore (fotos, banners, produtos e textos em todos os dispositivos)
  useEffect(() => {
    const unsub = subscribeToCloudSiteData((merged, meta) => {
      cloudMetaRef.current = meta;
      setCloudMeta(meta);
      const cloudHasContent =
        meta.hasSettingsDoc || meta.productDocsCount > 0 || meta.bannerDocsCount > 0;
      if (cloudHasContent && activeCloudWritesRef.current === 0) {
        lastCloudSyncedDataRef.current = merged;
        if (!hasPendingLocalDraftRef.current) {
          siteDataRef.current = merged;
          setSiteData(merged);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // Ignora limite de quota local se houver muitas imagens: Firestore mantém o estado global
          }
        }
      }
    });
    return () => unsub();
  }, []);

  // Se o administrador conectar com Google e a nuvem ainda estiver vazia mas houver fotos/alterações locais, publica automaticamente
  useEffect(() => {
    if (!isCloudAdmin || autoPushedEmptyCloudRef.current) return;
    const cloudIsEmpty =
      !cloudMeta.hasSettingsDoc &&
      cloudMeta.productDocsCount === 0 &&
      cloudMeta.bannerDocsCount === 0;
    if (!cloudIsEmpty) return;

    const current = siteDataRef.current;
    const hasLocalCustomizations =
      Boolean(current.aboutUsImage) ||
      current.products.some((p) => Boolean(p.image)) ||
      current.banners.carousel.some((s) => Boolean(s.image)) ||
      current.banners.promotional.length > 0 ||
      Boolean(current.banners.catalog.image) ||
      Number(current.updatedAt || 0) > 0;

    if (!hasLocalCustomizations) return;
    autoPushedEmptyCloudRef.current = true;
    setCloudSyncStatus('saving');
    setCloudSyncError(null);
    pushAllCustomizationsToCloud(current)
      .then(() => setCloudSyncStatus('saved'))
      .catch((err) => {
        setCloudSyncStatus('error');
        setCloudSyncError(err instanceof Error ? err.message : 'Erro ao enviar dados para a nuvem.');
      });
  }, [isCloudAdmin, cloudMeta]);

  // Fechar autocomplete da busca global e dropdown Produtos ao clicar fora ou pressionar Escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (headerSearchRef.current && !headerSearchRef.current.contains(e.target as Node)) {
        setHeaderAutocompleteOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(e.target as Node)) {
        setProductsMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHeaderAutocompleteOpen(false);
        setProductsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  // Ouvinte de rotas via hash + Ctrl+Shift+A para #/admin
  useEffect(() => {
    const syncRouteFromHash = () => {
      const hash = window.location.hash || '#/inicio';
      setCurrentRoute(hash);

      if (hash === '#/privacidade') {
        setPrivacyModalOpen(true);
      }

      if (hash.startsWith('#/produtos')) {
        const { cat, room, seg, q } = parseCatalogFiltersFromHash(hash);
        setActiveCategory(cat);
        setActiveRoom(room);
        setActiveSegment(seg);
        if (q) setSearchQuery(q);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'A') {
        e.preventDefault();
        window.location.hash = '#/admin';
      }
    };

    window.addEventListener('hashchange', syncRouteFromHash);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', syncRouteFromHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Revelação em cascata (IntersectionObserver)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    const els = document.querySelectorAll('.reveal-on-scroll');
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [currentRoute, activeCategory, activeRoom, activeSegment]);

  // Sugestões da Busca Global no Cabeçalho
  const headerSearchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return siteData.products
      .filter((p) => {
        const cat = siteData.categories.find((c) => c.id === p.category)?.label.toLowerCase() || '';
        const roomNames = (p.rooms || [])
          .map((rId) => siteData.rooms.find((r) => r.id === rId)?.label.toLowerCase() || '')
          .join(' ');
        return (
          p.name.toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q) ||
          p.spec.toLowerCase().includes(q) ||
          cat.includes(q) ||
          roomNames.includes(q)
        );
      })
      .slice(0, 7);
  }, [searchQuery, siteData.products, siteData.categories, siteData.rooms]);

  const formatCloudErrorMessage = (err: unknown): string => {
    const raw = err instanceof Error ? err.message : String(err || 'Falha ao salvar na nuvem.');
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.error === 'string') {
        return `${parsed.error}${parsed.path ? ` (${parsed.path})` : ''}`;
      }
    } catch {
      // ignore non-JSON errors
    }
    return raw;
  };

  const persistSiteData = async (
    nextData: SiteData,
    commitToCloud = true
  ): Promise<{ ok: boolean; syncedToCloud: boolean; error?: string }> => {
    siteDataRef.current = nextData;
    setSiteData(nextData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    } catch (e) {
      console.error('Erro ao salvar no navegador:', e);
    }

    if (!commitToCloud) {
      hasPendingLocalDraftRef.current = true;
      return { ok: true, syncedToCloud: false };
    }

    hasPendingLocalDraftRef.current = false;

    if (!isCloudAdmin) {
      return { ok: true, syncedToCloud: false };
    }

    return new Promise((resolve) => {
      cloudWriteQueueRef.current = cloudWriteQueueRef.current.then(async () => {
        activeCloudWritesRef.current += 1;
        setCloudSyncStatus('saving');
        setCloudSyncError(null);
        try {
          const cloudBaseline = lastCloudSyncedDataRef.current;
          await syncSiteDataDiffToCloud(cloudBaseline, nextData);
          lastCloudSyncedDataRef.current = nextData;
          setCloudSyncStatus('saved');
          resolve({ ok: true, syncedToCloud: true });
        } catch (err) {
          const msg = formatCloudErrorMessage(err);
          setCloudSyncStatus('error');
          setCloudSyncError(msg);
          resolve({ ok: false, syncedToCloud: false, error: msg });
        } finally {
          activeCloudWritesRef.current = Math.max(0, activeCloudWritesRef.current - 1);
        }
      });
    });
  };

  const handleSyncAllToCloud = async () => {
    if (!isCloudAdmin) return;
    return new Promise<void>((resolve, reject) => {
      cloudWriteQueueRef.current = cloudWriteQueueRef.current.then(async () => {
        activeCloudWritesRef.current += 1;
        setCloudSyncStatus('saving');
        setCloudSyncError(null);
        try {
          const snapshot = siteDataRef.current;
          hasPendingLocalDraftRef.current = false;
          await pushAllCustomizationsToCloud(snapshot);
          lastCloudSyncedDataRef.current = snapshot;
          setCloudSyncStatus('saved');
          resolve();
        } catch (err) {
          const msg = formatCloudErrorMessage(err);
          setCloudSyncStatus('error');
          setCloudSyncError(msg);
          reject(new Error(msg));
        } finally {
          activeCloudWritesRef.current = Math.max(0, activeCloudWritesRef.current - 1);
        }
      });
    });
  };

  // Navegação estruturada
  const navigateToCatalog = (
    catId = 'todos',
    roomId = 'todos',
    segId = 'todos',
    queryOverride?: string
  ) => {
    setActiveCategory(catId);
    setActiveRoom(roomId);
    setActiveSegment(segId);
    if (queryOverride !== undefined) setSearchQuery(queryOverride);
    setHeaderAutocompleteOpen(false);
    setProductsMenuOpen(false);
    setMobileMenuOpen(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const params = new URLSearchParams();
    if (catId && catId !== 'todos') params.set('cat', catId);
    if (roomId && roomId !== 'todos') params.set('room', roomId);
    if (segId && segId !== 'todos') params.set('seg', segId);
    const qVal = queryOverride !== undefined ? queryOverride : searchQuery;
    if (qVal.trim()) params.set('q', qVal.trim());

    const qs = params.toString();
    const targetHash = `#/produtos${qs ? `?${qs}` : ''}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      setCurrentRoute(targetHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHomeSection = (sectionId?: string) => {
    setMobileMenuOpen(false);
    setProductsMenuOpen(false);
    setHeaderAutocompleteOpen(false);
    const isCurrentlyHome =
      !currentRoute.startsWith('#/produtos') && !currentRoute.startsWith('#/admin');

    if (!isCurrentlyHome) {
      window.location.hash = '#/inicio';
      setCurrentRoute('#/inicio');
    }

    setTimeout(
      () => {
        if (sectionId) {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      isCurrentlyHome ? 10 : 80
    );
  };

  const handleHeroCtaLink = (ctaLink: string) => {
    if (!ctaLink || ctaLink.startsWith('#/produtos')) {
      const parsed = parseCatalogFiltersFromHash(ctaLink || '');
      navigateToCatalog(parsed.cat, parsed.room, parsed.seg);
    } else if (ctaLink.startsWith('#')) {
      navigateToHomeSection(ctaLink.replace(/^#/, ''));
    } else {
      const a = document.createElement('a');
      a.href = ctaLink;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    }
  };

  // Cesta de Cotação (com respeito rigoroso à qtdMinima)
  const addToQuoteCart = (product: Product, qtyToAdd?: number) => {
    const minQty = Math.max(1, Number(product.qtdMinima) || 1);
    setQuoteCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const increment = qtyToAdd !== undefined ? Math.max(1, qtyToAdd) : 1;
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qtdMinima: minQty,
                measures: product.measures,
                qty: Math.max(minQty, item.qty + increment)
              }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          sku: product.sku,
          name: product.name,
          spec: product.spec,
          measures: product.measures,
          qtdMinima: minQty,
          qty: Math.max(minQty, qtyToAdd ?? minQty)
        }
      ];
    });
  };

  const bulkAddRoomToQuote = (items: Product[]) => {
    if (items.length === 0) return;
    setQuoteCart((prev) => {
      const next = [...prev];
      items.forEach((product) => {
        const minQty = Math.max(1, Number(product.qtdMinima) || 1);
        const idx = next.findIndex((i) => i.id === product.id);
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            qtdMinima: minQty,
            measures: product.measures,
            qty: Math.max(minQty, next[idx].qty + 1)
          };
        } else {
          next.push({
            id: product.id,
            sku: product.sku,
            name: product.name,
            spec: product.spec,
            measures: product.measures,
            qtdMinima: minQty,
            qty: minQty
          });
        }
      });
      return next;
    });
    setQuoteDrawerOpen(true);
  };

  const changeQuoteQty = (id: number, delta: number) => {
    setQuoteCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const minQty = Math.max(1, Number(item.qtdMinima) || 1);
        return { ...item, qty: Math.max(minQty, item.qty + delta) };
      })
    );
  };

  const removeFromQuoteCart = (id: number) => {
    setQuoteCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearQuoteCart = () => setQuoteCart([]);

  const sendQuoteViaWhatsApp = () => {
    if (quoteCart.length === 0) return;
    const lines = quoteCart.map(
      (i) => `- ${i.qty}x ${i.sku ? `[${i.sku}] ` : ''}${i.name} (${i.spec})`
    );
    const msg = `Olá! Gostaria de solicitar uma cotação com a Faberminas:\n\n${lines.join('\n')}\n\nAguardo retorno.`;
    const whatsDigits = onlyDigits(siteData.whatsapp);
    const anchor = document.createElement('a');
    anchor.href = `https://wa.me/${whatsDigits}?text=${encodeURIComponent(msg)}`;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.click();
  };

  const fillContactWithQuote = () => {
    if (quoteCart.length === 0) return;
    const lines = quoteCart.map(
      (i) => `- ${i.qty}x ${i.sku ? `[${i.sku}] ` : ''}${i.name} (${i.spec})`
    );
    setContactMessage(`Solicito orçamento para os seguintes itens:\n\n${lines.join('\n')}`);
    setQuoteDrawerOpen(false);
    navigateToHomeSection('contato');
  };

  const totalQuoteCount = quoteCart.reduce((acc, item) => acc + item.qty, 0);
  const logoImageSrc = resolveLogoSrc(siteData.logoDataUrl);
  const whatsDigits = onlyDigits(siteData.whatsapp);
  const phoneDigits = onlyDigits(siteData.phone);
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    siteData.address.replace(/\n/g, ' ')
  )}`;

  // =====================================================================
  // VISÃO ADMIN OCULTA (#/admin)
  // =====================================================================
  if (currentRoute === '#/admin') {
    return (
      <AdminDashboard
        siteData={siteData}
        onUpdateSiteData={persistSiteData}
        onRestoreDefaults={async () => {
          siteDataRef.current = DEFAULT_SITE_DATA;
          setSiteData(DEFAULT_SITE_DATA);
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            // ignore
          }
          if (isCloudAdmin) {
            setCloudSyncStatus('saving');
            try {
              await restoreCloudDefaults();
              lastCloudSyncedDataRef.current = DEFAULT_SITE_DATA;
              setCloudSyncStatus('saved');
            } catch (err) {
              setCloudSyncStatus('error');
              setCloudSyncError(
                err instanceof Error ? err.message : 'Erro ao restaurar padrões na nuvem.'
              );
            }
          }
        }}
        onExitAdmin={() => {
          window.location.hash = '#/inicio';
          setCurrentRoute('#/inicio');
        }}
        authUser={authUser}
        isCloudAdmin={isCloudAdmin}
        authReady={authReady}
        cloudMeta={cloudMeta}
        cloudSyncStatus={cloudSyncStatus}
        cloudSyncError={cloudSyncError}
        onGoogleSignIn={async () => {
          const user = await signInAdminWithGoogle();
          const adminOk = await verifyUserIsAdmin(user);
          setAuthUser(user);
          setIsCloudAdmin(adminOk);
          if (!adminOk) {
            throw new Error(
              `A conta ${user.email || 'selecionada'} não está autorizada como administradora.`
            );
          }
          const localTime = Number(siteDataRef.current.updatedAt || 0);
          const cloudTime = Number(cloudMetaRef.current.cloudUpdatedAt || 0);
          if (localTime > cloudTime) {
            activeCloudWritesRef.current += 1;
            setCloudSyncStatus('saving');
            setCloudSyncError(null);
            try {
              const snapshot = siteDataRef.current;
              hasPendingLocalDraftRef.current = false;
              await pushAllCustomizationsToCloud(snapshot);
              lastCloudSyncedDataRef.current = snapshot;
              setCloudSyncStatus('saved');
            } catch (err) {
              const msg = formatCloudErrorMessage(err);
              setCloudSyncStatus('error');
              setCloudSyncError(msg);
              throw new Error(msg);
            } finally {
              activeCloudWritesRef.current = Math.max(0, activeCloudWritesRef.current - 1);
            }
          }
        }}
        onGoogleSignOut={async () => {
          await signOutAdmin();
          setAuthUser(null);
          setIsCloudAdmin(false);
        }}
        onSyncAllToCloud={handleSyncAllToCloud}
      />
    );
  }

    const isCatalogView = currentRoute.startsWith('#/produtos');
    const promotionalBanners = (siteData.banners.promotional || []).filter(
      (slot) => slot && slot.enabled && slot.image && !brokenPromoImages[slot.id || slot.image]
    );
    const hasSecondaryBanners = promotionalBanners.length > 0;
    const effectiveLogoSrc =
      logoLoadStage === 'fallback' ? FALLBACK_LOGO_PATH : logoImageSrc;

    return (
      <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#004d61] selection:text-white">
        {/* ================================================================= */}
        {/* 1. CABEÇALHO E-COMMERCE EM 2 NÍVEIS (#004d61)                    */}
        {/* ================================================================= */}
        <header className="sticky top-0 z-40 bg-[#004d61] text-white shadow-md">
          {/* Nível Superior: Full-width sem espaço vazio — Logo + Busca Global + Cesta de Cotação */}
          <div className="w-full px-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between gap-3 sm:gap-6 h-16 sm:h-20">
              {/* Esquerda: logo.png com fallback automático */}
              <button
                type="button"
                onClick={() => navigateToHomeSection()}
                className="logo-anim focus:outline-none py-1 shrink-0"
                aria-label="Faberminas Início"
              >
                {logoLoadStage === 'text' ? (
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                    Faberminas
                  </span>
                ) : (
                  <img
                    src={effectiveLogoSrc}
                    alt="Faberminas"
                    onError={() =>
                      setLogoLoadStage((prev) => (prev === 'primary' ? 'fallback' : 'text'))
                    }
                    className="h-9 sm:h-12 w-auto object-contain"
                  />
                )}
              </button>

            {/* Centro: Barra de Busca Global ocupando toda a largura disponível */}
            <div ref={headerSearchRef} className="hidden md:block relative flex-1 z-30">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  navigateToCatalog('todos', 'todos', 'todos', searchQuery);
                }}
                className="flex items-center bg-white rounded-xl shadow-sm overflow-hidden border border-white/20 focus-within:ring-4 focus-within:ring-white/25 transition"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => {
                    if (searchQuery.trim()) setHeaderAutocompleteOpen(true);
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    setHeaderAutocompleteOpen(Boolean(val.trim()));
                  }}
                  placeholder="Busque por produtos de higiene, limpeza, descartáveis ou código SKU..."
                  aria-label="Buscar produtos no catálogo"
                  className="flex-1 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setHeaderAutocompleteOpen(false);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label="Limpar busca"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  aria-label="Pesquisar"
                  className="px-4 py-2.5 bg-[#eef5f7] hover:bg-slate-200 text-[#004d61] font-bold inline-flex items-center gap-1.5 text-sm transition cursor-pointer shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>Buscar</span>
                </button>
              </form>

              {/* Dropdown Autocomplete da Busca Global */}
              {headerAutocompleteOpen && searchQuery.trim() !== '' && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden text-slate-800 animate-fade-in">
                  <div className="px-4 py-2 bg-[#F8FAFC] border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Resultados instantâneos</span>
                    <span className="tabular-nums text-[#004d61]">
                      {headerSearchMatches.length} encontrados
                    </span>
                  </div>
                  {headerSearchMatches.length === 0 ? (
                    <div className="p-4 text-sm text-slate-500 text-center">
                      Nenhum item encontrado para &ldquo;{searchQuery}&rdquo;.
                    </div>
                  ) : (
                    <>
                      <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        {headerSearchMatches.map((item) => {
                          const cat = siteData.categories.find((c) => c.id === item.category);
                          const showImg = Boolean(item.image) && !brokenSearchThumbs[item.id];
                          return (
                            <li key={item.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setHeaderAutocompleteOpen(false);
                                  setHeaderSelectedProduct(item);
                                }}
                                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#eef5f7]/70 text-left transition cursor-pointer"
                              >
                                <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                  {showImg ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      referrerPolicy="no-referrer"
                                      onError={() =>
                                        setBrokenSearchThumbs((prev) => ({
                                          ...prev,
                                          [item.id]: true
                                        }))
                                      }
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    renderLucideIcon(cat?.icon || 'package', 'w-4 h-4 text-[#004d61]')
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-sm text-slate-900 truncate">
                                      {item.name}
                                    </span>
                                    {item.sku && (
                                      <span className="font-mono text-[11px] font-semibold text-[#004d61] shrink-0 tabular-nums">
                                        {item.sku}
                                      </span>
                                    )}
                                  </div>
                                  <span className="block text-xs text-slate-500 truncate">
                                    {cat?.label || item.category}
                                  </span>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      <button
                        type="button"
                        onClick={() => navigateToCatalog('todos', 'todos', 'todos', searchQuery)}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] hover:bg-[#eef5f7] text-xs font-bold text-[#004d61] text-center border-t border-slate-100 cursor-pointer"
                      >
                        Ver todos os resultados no catálogo →
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Direita: Cesta de Cotação + Menu Mobile */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setQuoteDrawerOpen(true)}
                className="btn-anim min-h-[42px] inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold cursor-pointer shadow-2xs"
                aria-label="Abrir cesta de cotação"
              >
                <ClipboardList className="w-4 h-4 icon-pop shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Cesta de Cotação</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-white text-[#004d61] tabular-nums">
                  {totalQuoteCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-white hover:bg-[#003a49] focus:outline-none transition cursor-pointer"
                aria-label="Abrir menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Nível Inferior (Sub-header Desktop): Full-width distribuído 1:1 com a ordem da página */}
        <div className="hidden md:block bg-[#003a49] border-t border-white/10">
          <div className="w-full px-4 sm:px-6 lg:px-10">
            <nav
              className="w-full flex items-center justify-between gap-4 h-11 text-sm font-medium"
              aria-label="Navegação principal"
            >
              <button
                type="button"
                onClick={() => navigateToHomeSection()}
                className={`nav-link-anim ${!isCatalogView ? 'is-active text-white' : 'text-white/90 hover:text-white'} py-2 whitespace-nowrap cursor-pointer`}
              >
                Início
              </button>

              {/* Produtos ▾ Menu E-Commerce Limpo (fecha imediatamente ao clicar em qualquer item) */}
              <div
                ref={productsDropdownRef}
                onMouseEnter={() => setProductsMenuOpen(true)}
                onMouseLeave={() => setProductsMenuOpen(false)}
                className={`relative nav-dropdown-group ${productsMenuOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setProductsMenuOpen(false);
                    navigateToCatalog('todos', 'todos', 'todos');
                  }}
                  aria-haspopup="true"
                  aria-expanded={productsMenuOpen}
                  className={`nav-link-anim ${isCatalogView ? 'is-active text-white' : 'text-white/90 hover:text-white'} inline-flex items-center gap-1.5 py-2 whitespace-nowrap cursor-pointer`}
                >
                  <span>Produtos</span>
                  <ChevronDown className="nav-chevron w-4 h-4 transition-transform duration-200" />
                </button>

                <div className="nav-dropdown-panel absolute left-0 top-full pt-1.5 w-64 z-50">
                  <div className="bg-white rounded-xl shadow-2xl border border-slate-200/90 overflow-hidden py-1.5">
                    <button
                      type="button"
                      onClick={() => navigateToCatalog('todos', 'todos', 'todos')}
                      className="w-full px-4 py-2.5 text-left text-sm font-bold text-[#004d61] hover:bg-[#eef5f7] border-b border-slate-100 transition cursor-pointer"
                    >
                      Todos os Produtos
                    </button>

                    <div className="py-1 max-h-[65vh] overflow-y-auto sidebar-scroll">
                      {siteData.categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => navigateToCatalog(cat.id, 'todos', 'todos')}
                          className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-[#eef5f7] hover:text-[#004d61] transition cursor-pointer flex items-center justify-between gap-2"
                        >
                          <span className="truncate">{cat.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateToHomeSection('segmentos')}
                className="nav-link-anim text-white/90 hover:text-white py-2 whitespace-nowrap cursor-pointer"
              >
                Segmentos
              </button>

              <button
                type="button"
                onClick={() => navigateToHomeSection('sobre')}
                className="nav-link-anim text-white/90 hover:text-white py-2 whitespace-nowrap cursor-pointer"
              >
                Sobre Nós
              </button>

              <button
                type="button"
                onClick={() => navigateToHomeSection('ambientes')}
                className="nav-link-anim text-white/90 hover:text-white py-2 whitespace-nowrap cursor-pointer"
              >
                Compre por Ambiente
              </button>

              <button
                type="button"
                onClick={() => navigateToHomeSection('localizacao')}
                className="nav-link-anim text-white/90 hover:text-white py-2 whitespace-nowrap cursor-pointer"
              >
                Localização
              </button>

              <button
                type="button"
                onClick={() => navigateToHomeSection('contato')}
                className="nav-link-anim text-white/90 hover:text-white py-2 whitespace-nowrap cursor-pointer"
              >
                Contato
              </button>
            </nav>
          </div>
        </div>

        {/* Menu Mobile Expandido (ordem 1:1 com a página + busca + accordion Produtos) */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#003a49] border-t border-white/15 animate-fade-in shadow-xl">
            <div className="px-4 pt-3 pb-5 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  navigateToCatalog('todos', 'todos', 'todos', searchQuery);
                }}
                className="flex items-center bg-white rounded-xl overflow-hidden mb-2"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar produto ou SKU..."
                  className="flex-1 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2.5 bg-[#eef5f7] text-[#004d61] font-bold text-sm"
                  aria-label="Pesquisar"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <button
                type="button"
                onClick={() => navigateToHomeSection()}
                className="w-full text-left min-h-[44px] px-4 py-2.5 rounded-lg text-base font-medium text-white hover:bg-[#004d61] transition cursor-pointer"
              >
                Início
              </button>

              <div className="rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileProductsExpanded((prev) => !prev)}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-lg text-base font-medium text-white hover:bg-[#004d61] flex items-center justify-between transition cursor-pointer"
                >
                  <span>Produtos</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-200 ${
                      mobileProductsExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {mobileProductsExpanded && (
                  <div className="pl-4 pr-2 py-1 space-y-1 bg-[#002b36]/40 rounded-lg mt-1 max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => navigateToCatalog('todos', 'todos', 'todos')}
                      className="w-full text-left min-h-[44px] px-3 py-2 rounded-lg text-sm font-bold text-white hover:bg-[#004d61] transition cursor-pointer"
                    >
                      Todos os Produtos
                    </button>
                    {siteData.categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => navigateToCatalog(cat.id, 'todos', 'todos')}
                        className="w-full text-left min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-[#004d61] flex items-center gap-2.5 transition cursor-pointer"
                      >
                        {renderLucideIcon(cat.icon, 'w-4 h-4 shrink-0')}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigateToHomeSection('segmentos')}
                className="w-full text-left min-h-[44px] px-4 py-2.5 rounded-lg text-base font-medium text-white hover:bg-[#004d61] transition cursor-pointer"
              >
                Segmentos
              </button>

              <button
                type="button"
                onClick={() => navigateToHomeSection('sobre')}
                className="w-full text-left min-h-[44px] px-4 py-2.5 rounded-lg text-base font-medium text-white hover:bg-[#004d61] transition cursor-pointer"
              >
                Sobre Nós
              </button>

              <button
                type="button"
                onClick={() => navigateToHomeSection('ambientes')}
                className="w-full text-left min-h-[44px] px-4 py-2.5 rounded-lg text-base font-medium text-white hover:bg-[#004d61] transition cursor-pointer"
              >
                Compre por Ambiente
              </button>

              <button
                type="button"
                onClick={() => navigateToHomeSection('localizacao')}
                className="w-full text-left min-h-[44px] px-4 py-2.5 rounded-lg text-base font-medium text-white hover:bg-[#004d61] transition cursor-pointer"
              >
                Localização
              </button>

              <button
                type="button"
                onClick={() => navigateToHomeSection('contato')}
                className="w-full text-left min-h-[44px] px-4 py-2.5 rounded-lg text-base font-medium text-white hover:bg-[#004d61] transition cursor-pointer"
              >
                Contato
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ================================================================= */}
      {/* ROTEAMENTO: #/produtos OU #/inicio                                */}
      {/* ================================================================= */}
      <main>
        {isCatalogView ? (
          <CatalogView
            products={siteData.products}
            categories={siteData.categories}
            rooms={siteData.rooms}
            segments={siteData.segments}
            bannerCatalog={siteData.banners.catalog}
            whatsapp={siteData.whatsapp}
            activeCategory={activeCategory}
            activeRoom={activeRoom}
            activeSegment={activeSegment}
            searchQuery={searchQuery}
            onChangeCategory={(catId) =>
              navigateToCatalog(catId, activeRoom, activeSegment)
            }
            onChangeRoom={(roomId) =>
              navigateToCatalog(activeCategory, roomId, activeSegment)
            }
            onChangeSegment={(segId) =>
              navigateToCatalog(activeCategory, activeRoom, segId)
            }
            onResetAllFilters={() => navigateToCatalog('todos', 'todos', 'todos', '')}
            onBackHome={() => navigateToHomeSection()}
            onAddToQuote={addToQuoteCart}
            onBulkAddRoomToQuote={bulkAddRoomToQuote}
            onNavigateTarget={handleHeroCtaLink}
          />
        ) : (
          <div className="animate-view-enter">
            {/* 2. CARROSSEL HERO FULL-WIDTH */}
            <HeroBannerCarousel
              slides={siteData.banners.carousel}
              onNavigateCta={handleHeroCtaLink}
            />

            {/* 3. FAIXA DE DIFERENCIAIS OPERACIONAIS (#004d61) */}
            <section
              aria-label="Diferenciais operacionais Faberminas"
              className="relative overflow-hidden bg-[#004d61] py-12 sm:py-16 border-b border-white/10"
            >
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {siteData.differentials.map((item, idx) => (
                    <div
                      key={idx}
                      style={{ animationDelay: `${idx * 60}ms` }}
                      className="reveal-on-scroll card-interactive flex items-start gap-3.5 p-5 rounded-2xl bg-white border border-white/20 shadow-md cursor-default group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#004d61] text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs">
                        {renderLucideIcon(item.icon, 'w-5 h-5')}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-[#004d61] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. COMPRE POR SEGMENTO (5 Cards Visuais B2B & B2C) */}
            <section
              id="segmentos"
              aria-label="Compre por Segmento"
              className="bg-white py-14 sm:py-20 border-b border-slate-200/80"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                  <div>
                    <div className="w-10 h-1 rounded-full bg-[#004d61] mb-3" />
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#004d61] tracking-tight">
                      Compre por Segmento
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base mt-1">
                      Soluções específicas para empresas, instituições (CNPJ) e consumo residencial (CPF).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToCatalog('todos', 'todos', 'todos')}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#004d61] hover:underline cursor-pointer shrink-0"
                  >
                    <span>Ver todo o catálogo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {siteData.segments.map((seg) => {
                    const count = siteData.products.filter(
                      (p) => Array.isArray(p.segments) && p.segments.includes(seg.id)
                    ).length;
                    return (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => navigateToCatalog('todos', 'todos', seg.id)}
                        className="card-interactive p-5 rounded-2xl bg-[#F8FAFC] hover:bg-white border border-slate-200/90 text-left flex flex-col justify-between gap-4 cursor-pointer group"
                      >
                        <div className="space-y-3">
                          <div className="w-11 h-11 rounded-xl bg-[#004d61] text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                            {renderLucideIcon(seg.icon, 'w-5 h-5')}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-[#004d61] transition-colors">
                              {seg.label}
                            </h3>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {seg.desc}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold text-[#004d61] pt-2 border-t border-slate-200/70">
                          <span className="tabular-nums">{count} produtos</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 5. BANNERS PROMOCIONAIS (ocultos quando vazios; suportam botão ON/OFF) */}
            {hasSecondaryBanners && (
              <section aria-label="Destaques promocionais" className="py-10 bg-[#F8FAFC] border-b border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div
                    className={`grid grid-cols-1 ${
                      promotionalBanners.length > 1 ? 'md:grid-cols-2' : ''
                    } gap-6`}
                  >
                    {promotionalBanners.map((slot, idx) => {
                      const hasLink = Boolean(slot.linkUrl && slot.linkUrl.trim());
                      const showBtn = Boolean(slot.showButton && hasLink);
                      const isExternal = hasLink && /^https?:\/\//i.test(slot.linkUrl);

                      return (
                        <div
                          key={slot.id || idx}
                          className="relative rounded-2xl overflow-hidden border border-[#004d61]/15 shadow-md bg-white group"
                        >
                          {hasLink && !showBtn ? (
                            <a
                              href={slot.linkUrl}
                              target={isExternal ? '_blank' : undefined}
                              rel={isExternal ? 'noopener noreferrer' : undefined}
                              onClick={(e) => {
                                if (!isExternal) {
                                  e.preventDefault();
                                  handleHeroCtaLink(slot.linkUrl);
                                }
                              }}
                              className="block w-full cursor-pointer focus:outline-none"
                              aria-label={slot.title || `Campanha Faberminas ${idx + 1}`}
                            >
                              <img
                                src={slot.image}
                                alt={slot.title || `Campanha Faberminas ${idx + 1}`}
                                referrerPolicy="no-referrer"
                                onError={() =>
                                  setBrokenPromoImages((prev) => ({
                                    ...prev,
                                    [slot.id || slot.image]: true
                                  }))
                                }
                                className="w-full max-h-72 object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                              />
                            </a>
                          ) : (
                            <>
                              <img
                                src={slot.image}
                                alt={slot.title || `Campanha Faberminas ${idx + 1}`}
                                referrerPolicy="no-referrer"
                                onError={() =>
                                  setBrokenPromoImages((prev) => ({
                                    ...prev,
                                    [slot.id || slot.image]: true
                                  }))
                                }
                                className="w-full max-h-72 object-cover"
                              />
                              {showBtn && (
                                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-[#002b36]/80 via-[#002b36]/30 to-transparent flex items-end justify-between gap-3">
                                  {slot.title && (
                                    <span className="text-white font-bold text-sm sm:text-base drop-shadow-xs line-clamp-1">
                                      {slot.title}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleHeroCtaLink(slot.linkUrl)}
                                    className="btn-anim shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#eef5f7] text-[#004d61] font-bold text-xs sm:text-sm shadow-lg cursor-pointer ml-auto"
                                  >
                                    <span>{slot.ctaLabel || 'Ver ofertas'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* 6. SEÇÃO SOBRE NÓS (#004d61 azul com espaço dedicado para foto institucional) */}
            <section
              id="sobre"
              aria-label="Sobre a Faberminas"
              className="relative overflow-hidden bg-arch-grid-dark py-14 sm:py-20 border-b border-white/10 text-white"
            >
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="w-12 h-1 rounded-full bg-white" />
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {siteData.aboutUsTitle || 'Sobre a Faberminas'}
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed whitespace-pre-line">
                      {siteData.aboutUsText}
                    </p>
                  </div>

                  <div className="lg:col-span-5">
                    {siteData.aboutUsImage && !brokenAboutImage ? (
                      <div className="rounded-2xl overflow-hidden border-2 border-white/25 shadow-2xl bg-[#003a49] aspect-[4/3]">
                        <img
                          src={siteData.aboutUsImage}
                          alt={siteData.aboutUsTitle || 'Sobre a Faberminas'}
                          onError={() => setBrokenAboutImage(true)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed border-white/30 bg-[#003a49]/70 aspect-[4/3] flex flex-col items-center justify-center p-6 text-center shadow-inner">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mb-3">
                          <ImageIcon className="w-7 h-7" />
                        </div>
                        <p className="text-sm sm:text-base font-bold text-white">
                          Espaço para foto institucional
                        </p>
                        <p className="text-xs text-white/75 mt-1 max-w-xs leading-relaxed">
                          Adicione uma imagem da empresa, estrutura ou equipe pela aba Institucional do painel administrativo.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 7. PLANTA ARQUITETÔNICA INTERATIVA ("Casinha") + MODAL IN-PLACE */}
            <InteractiveHouseSection
              rooms={siteData.rooms}
              categories={siteData.categories}
              products={siteData.products}
              whatsapp={siteData.whatsapp}
              onAddToQuote={addToQuoteCart}
              onBulkAddRoom={bulkAddRoomToQuote}
              onExploreAll={() => navigateToCatalog('todos', 'todos', 'todos')}
              onNavigateRoomCatalog={(roomId) => navigateToCatalog('todos', roomId, 'todos')}
            />

            {/* 7. SEÇÃO LOCALIZAÇÃO (em sincronia 1:1 com a barra superior, antes de Contato) */}
            <section
              id="localizacao"
              className="relative bg-gradient-to-b from-[#eef5f7] via-white to-[#F8FAFC] py-16 sm:py-24 border-t border-[#004d61]/15"
            >
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                  <div className="lg:col-span-5 space-y-6">
                    <div>
                      <div className="w-10 h-1 rounded-full bg-[#004d61] mb-4" />
                      <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                        Localização
                      </h2>
                      <p className="text-slate-600 text-base leading-relaxed">
                        Confira nosso endereço completo e horário de atendimento para retiradas e visitas comerciais.
                      </p>
                    </div>

                    <div className="card-interactive space-y-4 bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#004d61] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                            Endereço
                          </h3>
                          <p className="text-slate-700 text-base mt-1 leading-snug whitespace-pre-line">
                            {siteData.address}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-200/70 pt-4 flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#004d61]/10 text-[#004d61] flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                            Horário de Atendimento
                          </h3>
                          <p className="text-slate-700 text-sm sm:text-base mt-1 whitespace-pre-line">
                            {siteData.hours}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <a
                        href={mapsSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-anim min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-semibold text-sm sm:text-base shadow-sm cursor-pointer"
                      >
                        <Navigation className="w-4 h-4 icon-pop" />
                        <span>Abrir no Google Maps</span>
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    <div className="w-full h-[340px] sm:h-[420px] rounded-2xl overflow-hidden border-2 border-[#004d61]/15 shadow-sm bg-slate-100">
                      <iframe
                        title="Mapa Faberminas"
                        src={siteData.mapsEmbed}
                        className="w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. SEÇÃO CONTATO (#004d61 sólido + malha arquitetônica + cards brancos) */}
            <section
              id="contato"
              className="relative overflow-hidden bg-arch-grid-dark py-16 sm:py-24 border-t border-white/10"
            >
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="w-12 h-1 rounded-full bg-white mx-auto mb-4" />
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                    Entre em contato conosco
                  </h2>
                  <p className="text-white/85 text-base">
                    Atendimento comercial para empresas (CNPJ) e consumidores residenciais (CPF). Fale conosco pelo canal de sua preferência.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 max-w-6xl mx-auto">
                  <div className="lg:col-span-5 space-y-4">
                    <a
                      href={`https://wa.me/${whatsDigits}?text=${encodeURIComponent(
                        'Olá! Gostaria de falar com a Faberminas.'
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-interactive flex items-center justify-between p-5 bg-white rounded-2xl border border-white/20 shadow-md transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-[#004d61] text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#004d61]">
                            WhatsApp
                          </span>
                          <p className="text-base font-medium text-slate-800 truncate mt-0.5 group-hover:text-[#004d61] transition-colors">
                            {siteData.whatsapp}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#004d61]/50 group-hover:text-[#004d61] group-hover:translate-x-1.5 transition-all shrink-0" />
                    </a>

                    <a
                      href={`tel:+55${phoneDigits}`}
                      className="card-interactive flex items-center justify-between p-5 bg-white rounded-2xl border border-white/20 shadow-md transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-[#004d61] text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs">
                          <Phone className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#004d61]">
                            Telefone
                          </span>
                          <p className="text-base font-medium text-slate-800 truncate mt-0.5 group-hover:text-[#004d61] transition-colors">
                            {siteData.phone}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#004d61]/50 group-hover:text-[#004d61] group-hover:translate-x-1.5 transition-all shrink-0" />
                    </a>

                    <a
                      href={`mailto:${siteData.email}`}
                      className="card-interactive flex items-center justify-between p-5 bg-white rounded-2xl border border-white/20 shadow-md transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-[#004d61] text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs">
                          <Mail className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#004d61]">
                            E-mail
                          </span>
                          <p className="text-sm sm:text-base font-medium text-slate-800 truncate mt-0.5 group-hover:text-[#004d61] transition-colors">
                            {siteData.email}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#004d61]/50 group-hover:text-[#004d61] group-hover:translate-x-1.5 transition-all shrink-0" />
                    </a>
                  </div>

                  <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-white/20 shadow-md">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setContactFormSubmitted(true);
                        setTimeout(() => setContactFormSubmitted(false), 5000);
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="contact-name"
                            className="block text-sm font-medium text-slate-700 mb-1.5"
                          >
                            Nome ou Empresa *
                          </label>
                          <input
                            type="text"
                            id="contact-name"
                            required
                            placeholder="Seu nome ou razão social"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-800 focus:bg-white focus:outline-none focus:border-[#004d61] focus:ring-4 focus:ring-[#004d61]/20 transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="contact-phone"
                            className="block text-sm font-medium text-slate-700 mb-1.5"
                          >
                            Telefone / WhatsApp *
                          </label>
                          <input
                            type="tel"
                            id="contact-phone"
                            required
                            placeholder="(31) 90000-0000"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-800 focus:bg-white focus:outline-none focus:border-[#004d61] focus:ring-4 focus:ring-[#004d61]/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                          E-mail
                        </label>
                        <input
                          type="email"
                          id="contact-email"
                          placeholder="seuemail@empresa.com.br"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-800 focus:bg-white focus:outline-none focus:border-[#004d61] focus:ring-2 focus:ring-[#004d61]/20 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="contact-msg"
                          className="block text-sm font-medium text-slate-700 mb-1.5"
                        >
                          Mensagem *
                        </label>
                        <textarea
                          id="contact-msg"
                          rows={4}
                          required
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="Escreva sua mensagem ou os produtos desejados..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-800 focus:bg-white focus:outline-none focus:border-[#004d61] focus:ring-4 focus:ring-[#004d61]/20 transition-all duration-200"
                        />
                      </div>

                      <div className="pt-1">
                        <button
                          type="submit"
                          className="btn-anim w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-semibold text-base shadow-md cursor-pointer"
                        >
                          <span>Enviar Mensagem</span>
                          <Send className="w-4 h-4 icon-right" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        Ao enviar, você concorda que seus dados sejam usados exclusivamente para retorno comercial, conforme nossa{' '}
                        <button
                          type="button"
                          onClick={() => setPrivacyModalOpen(true)}
                          className="text-[#004d61] underline hover:opacity-80 cursor-pointer font-medium"
                        >
                          Política de Privacidade
                        </button>
                        .
                      </p>

                      {contactFormSubmitted && (
                        <div className="p-4 rounded-xl bg-[#004d61]/10 border border-[#004d61]/30 text-[#004d61] text-sm font-medium flex items-center gap-3 animate-fade-in shadow-xs">
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <span>Mensagem recebida! Entraremos em contato em breve.</span>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* RODAPÉ OFICIAL (#004d61) — sem link visível de admin */}
      <footer className="relative overflow-hidden bg-gradient-to-b from-[#003d4d] via-[#004d61] to-[#003442] text-white pt-14 pb-8 border-t border-white/15">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pb-10 border-b border-white/15">
            {/* Logo + Endereço */}
            <div className="text-center md:text-left space-y-3.5">
              <button
                type="button"
                onClick={() => navigateToHomeSection()}
                className="logo-anim inline-block focus:outline-none"
                aria-label="Faberminas"
              >
                {logoLoadStage === 'text' ? (
                  <span className="text-2xl font-extrabold tracking-tight text-white">
                    Faberminas
                  </span>
                ) : (
                  <img
                    src={effectiveLogoSrc}
                    alt="Faberminas"
                    onError={() =>
                      setLogoLoadStage((prev) => (prev === 'primary' ? 'fallback' : 'text'))
                    }
                    className="h-11 sm:h-14 w-auto object-contain mx-auto md:mx-0"
                  />
                )}
              </button>
              <p className="text-sm text-white/80 max-w-xs mx-auto md:mx-0 leading-relaxed whitespace-pre-line">
                {siteData.address}
              </p>
              <p className="sr-only">
                FaberMinas Distribuidora — Material de limpeza, produtos de limpeza profissional e concentrados, descartáveis em BH, papel toalha interfolhado, papel higiênico institucional, saco de lixo reforçado, sabonete líquido, álcool 70, desinfetante profissional, água sanitária, detergente neutro, luva nitrílica, luva de látex, luva de vinil, EPI Belo Horizonte, material hospitalar BH, fralda geriátrica e infantil, rodos, vassouras, pano de chão algodão, flanela limpeza, lixeira com pedal e suprimentos corporativos para condomínios, escritórios, clínicas, hospitais, restaurantes, atacado e varejo CPF e CNPJ no Alípio de Melo, Belo Horizonte e Região Metropolitana.
              </p>
            </div>

            {/* Navegação (1:1 com a ordem vertical da página) */}
            <div className="flex flex-col items-center md:items-start md:-translate-x-8 lg:-translate-x-12 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Navegação
              </h3>
              <nav
                className="flex flex-col items-center md:items-start space-y-2 text-sm font-medium text-white/90"
                aria-label="Navegação do rodapé"
              >
                <button
                  type="button"
                  onClick={() => navigateToHomeSection()}
                  className="hover:text-white transition cursor-pointer"
                >
                  Início
                </button>
                <button
                  type="button"
                  onClick={() => navigateToCatalog('todos', 'todos', 'todos')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Produtos
                </button>
                <button
                  type="button"
                  onClick={() => navigateToHomeSection('segmentos')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Segmentos
                </button>
                <button
                  type="button"
                  onClick={() => navigateToHomeSection('sobre')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Sobre Nós
                </button>
                <button
                  type="button"
                  onClick={() => navigateToHomeSection('ambientes')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Compre por Ambiente
                </button>
                <button
                  type="button"
                  onClick={() => navigateToHomeSection('localizacao')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Localização
                </button>
                <button
                  type="button"
                  onClick={() => navigateToHomeSection('contato')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Contato
                </button>
              </nav>
            </div>

            {/* Contatos (5 botões circulares) */}
            <div className="flex flex-col items-center md:items-end space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Contatos
              </h3>
              <div className="flex items-center justify-center md:justify-end gap-3">
                <a
                  href={`tel:+55${phoneDigits}`}
                  title="Telefone"
                  aria-label="Telefone"
                  className="social-orb w-11 h-11 rounded-full bg-white text-[#004d61] hover:bg-white/95 flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                </a>

                <button
                  type="button"
                  onClick={() => navigateToHomeSection('localizacao')}
                  title="Localização"
                  aria-label="Localização"
                  className="social-orb w-11 h-11 rounded-full bg-white text-[#004d61] hover:bg-white/95 flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <MapPin className="w-5 h-5" />
                </button>

                <a
                  href={`mailto:${siteData.email}`}
                  title="E-mail"
                  aria-label="E-mail"
                  className="social-orb w-11 h-11 rounded-full bg-white text-[#004d61] hover:bg-white/95 flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <Mail className="w-5 h-5" />
                </a>

                <a
                  href={`https://wa.me/${whatsDigits}?text=${encodeURIComponent(
                    'Olá! Vim pelo site da Faberminas.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                  className="social-orb w-11 h-11 rounded-full bg-white text-[#004d61] hover:bg-white/95 flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>

                <a
                  href={siteData.instagram || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  aria-label="Instagram"
                  className="social-orb w-11 h-11 rounded-full bg-white text-[#004d61] hover:bg-white/95 flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/80 text-center sm:text-left">
            <div className="space-y-1">
              <p className="text-xs text-white/75">
                {siteData.legalName} • CNPJ: {siteData.cnpj}
              </p>
              <p>© 2026 Faberminas. Todos os direitos reservados.</p>
            </div>
            <button
              type="button"
              onClick={() => setPrivacyModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-white/85 hover:text-white underline-offset-4 hover:underline transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Política de Privacidade</span>
            </button>
          </div>
        </div>
      </footer>

      {/* BOTÃO FLUTUANTE DE WHATSAPP */}
      <a
        href={`https://wa.me/${whatsDigits}?text=${encodeURIComponent(
          'Olá! Gostaria de solicitar atendimento da Faberminas.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar pelo WhatsApp"
        title="Falar no WhatsApp"
        className="whatsapp-float-anim fixed bottom-5 right-5 z-30 w-13 h-13 p-3.5 rounded-full bg-[#004d61] hover:bg-[#003a49] text-white border-2 border-white shadow-lg flex items-center justify-center cursor-pointer"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* GAVETA LATERAL: CESTA DE COTAÇÃO */}
      <QuoteDrawer
        open={quoteDrawerOpen}
        quoteCart={quoteCart}
        onClose={() => setQuoteDrawerOpen(false)}
        onChangeQty={changeQuoteQty}
        onRemoveItem={removeFromQuoteCart}
        onClearCart={clearQuoteCart}
        onSendWhatsApp={sendQuoteViaWhatsApp}
        onFillContact={fillContactWithQuote}
      />

      {/* MODAL CENTRALIZADO DE DETALHES DO PRODUTO (via busca global) */}
      <ProductDetailModal
        product={headerSelectedProduct}
        categories={siteData.categories}
        rooms={siteData.rooms}
        onClose={() => setHeaderSelectedProduct(null)}
        onAddToQuote={addToQuoteCart}
        onSelectRoom={(roomId) => navigateToCatalog('todos', roomId, 'todos')}
      />

      {/* MODAL: POLÍTICA DE PRIVACIDADE (LGPD) */}
      {privacyModalOpen && (
        <div
          onClick={() => setPrivacyModalOpen(false)}
          style={{ backdropFilter: 'blur(8px)' }}
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 border-t-4 border-t-[#004d61] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#004d61] text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Política de Privacidade</h3>
              </div>
              <button
                type="button"
                onClick={() => setPrivacyModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Fechar política"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-slate-600 space-y-3 leading-relaxed max-h-[62vh] overflow-y-auto pr-1">
              <p>
                A <strong className="text-slate-800">{siteData.legalName}</strong> (CNPJ: {siteData.cnpj}), com sede na{' '}
                {siteData.address.replace(/\n/g, ', ')}, respeita a privacidade e a proteção dos dados pessoais de seus clientes, parceiros e visitantes, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
              <p>
                <strong>1. Coleta e Finalidade:</strong> Os dados pessoais fornecidos voluntariamente por meio do formulário de contato, cesta de cotação ou atendimento via WhatsApp (como nome, empresa, CPF/CNPJ, telefone e e-mail) são utilizados exclusivamente para retorno comercial, elaboração de orçamentos, faturamento e atendimento ao cliente.
              </p>
              <p>
                <strong>2. Armazenamento e Segurança:</strong> Adotamos medidas técnicas e administrativas adequadas para proteger as informações contra acessos não autorizados, perda ou alteração indevida. Não vendemos, alugamos ou compartilhamos dados com terceiros para fins publicitários.
              </p>
              <p>
                <strong>3. Direitos do Titular:</strong> Você pode solicitar a confirmação, correção ou exclusão de seus dados de nossa base de atendimento comercial a qualquer momento por meio do e-mail oficial ({siteData.email}) ou telefone informado neste site.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setPrivacyModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white text-sm font-semibold cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
