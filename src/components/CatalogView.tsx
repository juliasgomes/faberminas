import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Package,
  Layers,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { BannerSlot, Category, Product, RoomZone, Segment } from '../types';
import { PRODUCT_SUBTYPE_FILTERS } from '../data/realCatalog';
import { onlyDigits, renderLucideIcon } from '../utils/helpers';
import { ProductDetailModal } from './ProductDetailModal';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  rooms: RoomZone[];
  segments: Segment[];
  bannerCatalog: BannerSlot;
  whatsapp: string;
  activeCategory: string;
  activeRoom: string;
  activeSegment: string;
  searchQuery: string;
  onChangeCategory: (catId: string) => void;
  onChangeRoom: (roomId: string) => void;
  onChangeSegment: (segId: string) => void;
  onResetAllFilters: () => void;
  onBackHome: () => void;
  onAddToQuote: (product: Product, qty?: number) => void;
  onBulkAddRoomToQuote: (items: Product[], roomLabel: string) => void;
  onNavigateTarget: (url: string) => void;
}

type SortOrder = 'relevance' | 'name-asc' | 'name-desc' | 'sku-asc';

const ITEMS_PER_PAGE = 12;

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  rooms,
  segments,
  bannerCatalog,
  whatsapp,
  activeCategory,
  activeRoom,
  activeSegment,
  searchQuery,
  onChangeCategory,
  onChangeRoom,
  onChangeSegment,
  onResetAllFilters,
  onBackHome,
  onAddToQuote,
  onBulkAddRoomToQuote,
  onNavigateTarget
}) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>('relevance');
  const [activeSubType, setActiveSubType] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Acordeões colapsáveis da barra lateral ("Tipos de Produto" recolhido por padrão)
  const [openGroups, setOpenGroups] = useState({
    categories: true,
    subTypes: false,
    rooms: true,
    segments: true
  });

  // Modal de Detalhes do Produto (Portaled no viewport)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<number | null>(null);
  const [bulkAddedFeedback, setBulkAddedFeedback] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});
  const [catalogBannerBroken, setCatalogBannerBroken] = useState(false);

  useEffect(() => {
    setCatalogBannerBroken(false);
  }, [bannerCatalog?.image]);

  const whatsDigits = onlyDigits(whatsapp);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeRoom, activeSegment, activeSubType, searchQuery, sortOrder]);

  useEffect(() => {
    setActiveSubType('todos');
  }, [activeCategory, activeRoom, activeSegment]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileFiltersOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pool após busca textual
  const searchFilteredPool = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const cat = categories.find((c) => c.id === p.category)?.label.toLowerCase() || '';
      const roomLabels = (p.rooms || [])
        .map((rId) => rooms.find((r) => r.id === rId)?.label.toLowerCase() || '')
        .join(' ');
      const segLabels = (p.segments || [])
        .map((sId) => segments.find((s) => s.id === sId)?.label.toLowerCase() || '')
        .join(' ');
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.measures || '').toLowerCase().includes(q) ||
        p.spec.toLowerCase().includes(q) ||
        (p.about || '').toLowerCase().includes(q) ||
        cat.includes(q) ||
        roomLabels.includes(q) ||
        segLabels.includes(q)
      );
    });
  }, [products, searchQuery, categories, rooms, segments]);

  // Pool filtrado por Categoria, Ambiente e Segmento (antes do Sub-Filtro de tipo)
  const facetFilteredPool = useMemo(() => {
    return searchFilteredPool.filter((p) => {
      const matchesCat = activeCategory === 'todos' || p.category === activeCategory;
      const matchesRoom =
        activeRoom === 'todos' || (Array.isArray(p.rooms) && p.rooms.includes(activeRoom));
      const matchesSeg =
        activeSegment === 'todos' ||
        (Array.isArray(p.segments) && p.segments.includes(activeSegment));
      return matchesCat && matchesRoom && matchesSeg;
    });
  }, [searchFilteredPool, activeCategory, activeRoom, activeSegment]);

  // Chips inteligentes de sub-filtro disponíveis para a seleção atual
  const availableSubTypes = useMemo(() => {
    return PRODUCT_SUBTYPE_FILTERS.map((sub) => ({
      ...sub,
      count: facetFilteredPool.filter(sub.match).length
    }))
      .filter((sub) => sub.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [facetFilteredPool]);

  // Filtragem final (com Sub-Filtro) + Ordenação
  const filteredProducts = useMemo(() => {
    const activeSubObj =
      activeSubType !== 'todos'
        ? PRODUCT_SUBTYPE_FILTERS.find((s) => s.id === activeSubType) || null
        : null;

    const list = activeSubObj
      ? facetFilteredPool.filter(activeSubObj.match)
      : facetFilteredPool;

    if (sortOrder === 'name-asc') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    }
    if (sortOrder === 'name-desc') {
      return [...list].sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
    }
    if (sortOrder === 'sku-asc') {
      return [...list].sort((a, b) => (a.sku || '').localeCompare(b.sku || ''));
    }
    return list;
  }, [facetFilteredPool, activeSubType, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, safePage]);

  const paginationItems = useMemo(() => {
    const pages: Array<number | 'ellipsis'> = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= safePage - 1 && i <= safePage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== 'ellipsis') {
        pages.push('ellipsis');
      }
    }
    return pages;
  }, [totalPages, safePage]);

  const activeRoomObj = rooms.find((r) => r.id === activeRoom) || null;
  const activeCatObj = categories.find((c) => c.id === activeCategory) || null;
  const activeSegObj = segments.find((s) => s.id === activeSegment) || null;

  const hasAnyFilter =
    activeCategory !== 'todos' ||
    activeRoom !== 'todos' ||
    activeSegment !== 'todos' ||
    activeSubType !== 'todos' ||
    searchQuery.trim() !== '';

  const handleQuickQuote = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const minQty = Math.max(1, Number(product.qtdMinima) || 1);
    onAddToQuote(product, minQty);
    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId((prev) => (prev === product.id ? null : prev));
    }, 1100);
  };

  const emptyStateWhatsText = (() => {
    const contextParts: string[] = [];
    if (activeRoomObj) contextParts.push(`ambiente "${activeRoomObj.label}"`);
    if (activeCatObj) contextParts.push(`categoria "${activeCatObj.label}"`);
    if (activeSegObj) contextParts.push(`segmento "${activeSegObj.label}"`);
    if (searchQuery.trim()) contextParts.push(`busca "${searchQuery.trim()}"`);
    const suffix = contextParts.length > 0 ? ` (${contextParts.join(' · ')})` : '';
    return `Olá! Gostaria de consultar a disponibilidade imediata de materiais na Faberminas${suffix}.`;
  })();

  const toggleGroup = (key: keyof typeof openGroups) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sidebarContent = (
    <div className="space-y-5">
      {/* Grupo 1: Categorias */}
      <div className="border-b border-slate-200/80 pb-4">
        <button
          type="button"
          onClick={() => toggleGroup('categories')}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-900 py-1 cursor-pointer"
        >
          <span>Categorias</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              openGroups.categories ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openGroups.categories && (
          <div className="mt-2.5 space-y-1 max-h-56 overflow-y-auto pr-1 sidebar-scroll">
            <button
              type="button"
              onClick={() => {
                onChangeCategory('todos');
                setMobileFiltersOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-xl text-sm flex items-center justify-between transition cursor-pointer ${
                activeCategory === 'todos'
                  ? 'bg-[#004d61] text-white font-semibold'
                  : 'text-slate-700 hover:bg-[#eef5f7] hover:text-[#004d61]'
              }`}
            >
              <span className="truncate">Todos os Produtos</span>
              <span className="text-xs tabular-nums opacity-75">{searchFilteredPool.length}</span>
            </button>
            {categories.map((cat) => {
              const count = searchFilteredPool.filter((p) => p.category === cat.id).length;
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onChangeCategory(cat.id);
                    setMobileFiltersOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-sm flex items-center justify-between gap-2 transition cursor-pointer ${
                    active
                      ? 'bg-[#004d61] text-white font-semibold'
                      : 'text-slate-700 hover:bg-[#eef5f7] hover:text-[#004d61]'
                  }`}
                >
                  <span className="truncate text-left">{cat.label}</span>
                  <span className="text-xs tabular-nums opacity-75 shrink-0">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grupo 2: Tipos de Produto (Acordeão recolhido por padrão) */}
      {availableSubTypes.length > 0 && (
        <div className="border-b border-slate-200/80 pb-4">
          <button
            type="button"
            onClick={() => toggleGroup('subTypes')}
            aria-expanded={openGroups.subTypes}
            className="w-full flex items-center justify-between text-sm font-bold text-slate-900 py-1 cursor-pointer"
          >
            <span>Tipos de Produto</span>
            <ChevronRight
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                openGroups.subTypes ? 'rotate-90 text-[#004d61]' : ''
              }`}
            />
          </button>

          {openGroups.subTypes && (
            <div className="mt-2.5 space-y-1 max-h-56 overflow-y-auto pr-1 sidebar-scroll">
              <button
                type="button"
                onClick={() => {
                  setActiveSubType('todos');
                  setMobileFiltersOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-sm flex items-center justify-between transition cursor-pointer ${
                  activeSubType === 'todos'
                    ? 'bg-[#004d61] text-white font-semibold'
                    : 'text-slate-700 hover:bg-[#eef5f7] hover:text-[#004d61]'
                }`}
              >
                <span className="truncate">Todos os Tipos</span>
                <span className="text-xs tabular-nums opacity-75">{facetFilteredPool.length}</span>
              </button>
              {availableSubTypes.map((sub) => {
                const isSelected = activeSubType === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setActiveSubType((prev) => (prev === sub.id ? 'todos' : sub.id));
                      setMobileFiltersOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-sm flex items-center justify-between gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#004d61] text-white font-semibold'
                        : 'text-slate-700 hover:bg-[#eef5f7] hover:text-[#004d61]'
                    }`}
                  >
                    <span className="truncate text-left">{sub.label}</span>
                    <span className="text-xs tabular-nums opacity-75 shrink-0">{sub.count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Grupo 3: Ambientes / Cômodos */}
      <div className="border-b border-slate-200/80 pb-4">
        <button
          type="button"
          onClick={() => toggleGroup('rooms')}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-900 py-1 cursor-pointer"
        >
          <span>Ambientes / Cômodos</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              openGroups.rooms ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openGroups.rooms && (
          <div className="mt-2.5 space-y-1 max-h-56 overflow-y-auto pr-1 sidebar-scroll">
            <button
              type="button"
              onClick={() => {
                onChangeRoom('todos');
                setMobileFiltersOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-xl text-sm flex items-center justify-between transition cursor-pointer ${
                activeRoom === 'todos'
                  ? 'bg-[#004d61] text-white font-semibold'
                  : 'text-slate-700 hover:bg-[#eef5f7] hover:text-[#004d61]'
              }`}
            >
              <span className="truncate">Todos os Ambientes</span>
              <span className="text-xs tabular-nums opacity-75">{searchFilteredPool.length}</span>
            </button>
            {rooms.map((room) => {
              const count = searchFilteredPool.filter(
                (p) => Array.isArray(p.rooms) && p.rooms.includes(room.id)
              ).length;
              const active = activeRoom === room.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => {
                    onChangeRoom(room.id);
                    setMobileFiltersOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-sm flex items-center justify-between gap-2 transition cursor-pointer ${
                    active
                      ? 'bg-[#004d61] text-white font-semibold'
                      : 'text-slate-700 hover:bg-[#eef5f7] hover:text-[#004d61]'
                  }`}
                >
                  <span className="truncate text-left">{room.label}</span>
                  <span className="text-xs tabular-nums opacity-75 shrink-0">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grupo 4: Segmentos */}
      <div className="pb-1">
        <button
          type="button"
          onClick={() => toggleGroup('segments')}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-900 py-1 cursor-pointer"
        >
          <span>Segmentos (CNPJ &amp; CPF)</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              openGroups.segments ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openGroups.segments && (
          <div className="mt-2.5 space-y-1 max-h-56 overflow-y-auto pr-1 sidebar-scroll">
            <button
              type="button"
              onClick={() => {
                onChangeSegment('todos');
                setMobileFiltersOpen(false);
              }}
              className={`w-full px-3 py-2 rounded-xl text-sm flex items-center justify-between transition cursor-pointer ${
                activeSegment === 'todos'
                  ? 'bg-[#004d61] text-white font-semibold'
                  : 'text-slate-700 hover:bg-[#eef5f7] hover:text-[#004d61]'
              }`}
            >
              <span className="truncate">Todos os Segmentos</span>
              <span className="text-xs tabular-nums opacity-75">{searchFilteredPool.length}</span>
            </button>
            {segments.map((seg) => {
              const count = searchFilteredPool.filter(
                (p) => Array.isArray(p.segments) && p.segments.includes(seg.id)
              ).length;
              const active = activeSegment === seg.id;
              return (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => {
                    onChangeSegment(seg.id);
                    setMobileFiltersOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-sm flex items-center justify-between gap-2 transition cursor-pointer ${
                    active
                      ? 'bg-[#004d61] text-white font-semibold'
                      : 'text-slate-700 hover:bg-[#eef5f7] hover:text-[#004d61]'
                  }`}
                >
                  <span className="truncate text-left">{seg.label}</span>
                  <span className="text-xs tabular-nums opacity-75 shrink-0">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {hasAnyFilter && (
        <button
          type="button"
          onClick={() => {
            setActiveSubType('todos');
            onResetAllFilters();
            setMobileFiltersOpen(false);
          }}
          className="w-full min-h-[42px] px-4 py-2 rounded-xl border border-[#004d61]/30 text-[#004d61] hover:bg-[#eef5f7] font-semibold text-sm inline-flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Limpar filtros</span>
        </button>
      )}
    </div>
  );

  const startIdx = filteredProducts.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length);

  return (
    <section
      id="catalogo-produtos"
      className="animate-view-enter min-h-[75vh] bg-[#F8FAFC] py-8 sm:py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Banner Promocional Dinâmico do Catálogo (oculto se sem imagem ou erro de carregamento) */}
        {bannerCatalog?.enabled && bannerCatalog?.image && !catalogBannerBroken && (() => {
          const hasLink = Boolean(bannerCatalog.linkUrl && bannerCatalog.linkUrl.trim());
          const showBtn = Boolean(bannerCatalog.showButton && hasLink);
          const isExternal = hasLink && /^https?:\/\//i.test(bannerCatalog.linkUrl);

          if (hasLink && !showBtn) {
            return (
              <div className="relative rounded-2xl overflow-hidden border border-[#004d61]/15 shadow-md bg-white group">
                <a
                  href={bannerCatalog.linkUrl}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  onClick={(e) => {
                    if (!isExternal) {
                      e.preventDefault();
                      onNavigateTarget(bannerCatalog.linkUrl);
                    }
                  }}
                  aria-label={bannerCatalog.title || 'Destaque promocional Faberminas'}
                  className="block w-full cursor-pointer"
                >
                  <img
                    src={bannerCatalog.image}
                    alt={bannerCatalog.title || 'Destaque promocional Faberminas'}
                    referrerPolicy="no-referrer"
                    onError={() => setCatalogBannerBroken(true)}
                    className="w-full max-h-60 sm:max-h-72 object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                </a>
              </div>
            );
          }

          return (
            <div className="relative rounded-2xl overflow-hidden border border-[#004d61]/15 shadow-md bg-white">
              <img
                src={bannerCatalog.image}
                alt={bannerCatalog.title || 'Destaque promocional Faberminas'}
                referrerPolicy="no-referrer"
                onError={() => setCatalogBannerBroken(true)}
                className="w-full max-h-60 sm:max-h-72 object-cover"
              />
              {showBtn && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#002b36]/70 via-transparent to-transparent flex items-end p-5 sm:p-7">
                  <button
                    type="button"
                    onClick={() => onNavigateTarget(bannerCatalog.linkUrl)}
                    className="btn-anim inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#004d61] font-bold text-sm shadow-lg cursor-pointer"
                  >
                    <span>{bannerCatalog.ctaLabel || 'Conferir oferta'}</span>
                    <ArrowRight className="w-4 h-4 icon-right" />
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Cabeçalho do Catálogo */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div className="space-y-2">
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#004d61] hover:text-[#003a49] transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para a página inicial</span>
            </button>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeCatObj
                ? activeCatObj.label
                : activeRoomObj
                  ? activeRoomObj.label
                  : activeSegObj
                    ? activeSegObj.label
                    : 'Produtos'}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              Cotação direta sem burocracia para <strong className="text-slate-800">CNPJ</strong> e{' '}
              <strong className="text-slate-800">CPF</strong> · Entrega própria em BH e Região Metropolitana.
            </p>
          </div>

          {/* Botão mobile para abrir filtros */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden min-h-[44px] px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-[#004d61] font-bold text-sm inline-flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtrar Catálogo</span>
          </button>
        </div>

        {/* Layout Clássico 2 Colunas: Sidebar Esquerda + Grid Direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Barra Lateral Esquerda (Desktop) */}
          <aside
            aria-label="Filtros do catálogo"
            className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs sticky top-36"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h2 className="font-bold text-base text-[#004d61]">Filtros</h2>
              {hasAnyFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubType('todos');
                    onResetAllFilters();
                  }}
                  className="text-xs font-semibold text-[#004d61] hover:underline cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>
            {sidebarContent}
          </aside>

          {/* Coluna Direita: Ordenação + Grid de Produtos + Paginação */}
          <div className="lg:col-span-9 space-y-4">
            {/* Barra Superior de Contagem e Ordenação */}
            <div className="bg-white rounded-2xl border border-slate-200/90 px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                {filteredProducts.length === 0 ? (
                  <span>Nenhum resultado encontrado</span>
                ) : (
                  <span>
                    Exibindo{' '}
                    <strong className="text-slate-900 tabular-nums">
                      {startIdx}–{endIdx}
                    </strong>{' '}
                    de{' '}
                    <strong className="text-[#004d61] tabular-nums">
                      {filteredProducts.length}
                    </strong>{' '}
                    {filteredProducts.length === 1 ? 'produto' : 'produtos'}
                    {searchQuery.trim() ? ` para "${searchQuery.trim()}"` : ''}
                  </span>
                )}
                {activeSubType !== 'todos' && (
                  <button
                    type="button"
                    onClick={() => setActiveSubType('todos')}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#eef5f7] text-[#004d61] text-xs font-semibold hover:bg-[#004d61] hover:text-white transition cursor-pointer"
                  >
                    <span>
                      {PRODUCT_SUBTYPE_FILTERS.find((s) => s.id === activeSubType)?.label || activeSubType}
                    </span>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <label
                  htmlFor="catalog-sort"
                  className="text-xs font-semibold text-slate-500 whitespace-nowrap"
                >
                  Ordenar:
                </label>
                <select
                  id="catalog-sort"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-[#004d61] cursor-pointer"
                >
                  <option value="relevance">Ordenação padrão</option>
                  <option value="name-asc">Nome (A–Z)</option>
                  <option value="name-desc">Nome (Z–A)</option>
                  <option value="sku-asc">Código SKU</option>
                </select>
              </div>
            </div>

            {/* Faixa de Kit do Ambiente quando filtrado por Cômodo */}
            {activeRoomObj && filteredProducts.length > 0 && (
              <div className="bg-white border border-[#004d61]/25 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs animate-view-enter">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#004d61] text-white flex items-center justify-center shrink-0">
                    {renderLucideIcon(activeRoomObj.icon, 'w-5 h-5')}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#004d61]">
                      Setor: {activeRoomObj.label}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{activeRoomObj.desc}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onBulkAddRoomToQuote(filteredProducts, activeRoomObj.label);
                    setBulkAddedFeedback(true);
                    setTimeout(() => setBulkAddedFeedback(false), 1800);
                  }}
                  className="btn-anim shrink-0 min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-bold text-xs sm:text-sm shadow-sm cursor-pointer"
                >
                  {bulkAddedFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{filteredProducts.length} itens adicionados!</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      <span>Adicionar itens deste cômodo ({filteredProducts.length})</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Estado Vazio OU Grade de Produtos Limpa (4 cols desktop / 2 cols mobile) */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#004d61]/20 p-8 sm:p-12 text-center shadow-2xs animate-view-enter">
                <div className="w-14 h-14 rounded-2xl bg-[#eef5f7] text-[#004d61] flex items-center justify-center mx-auto mb-4">
                  <Package className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-[#004d61] mb-2">
                  Nenhum item encontrado neste filtro
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 max-w-lg mx-auto">
                  Em breve novidades cadastradas para este filtro — clique abaixo para consultar disponibilidade imediata no WhatsApp
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={`https://wa.me/${whatsDigits}?text=${encodeURIComponent(emptyStateWhatsText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-anim w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-bold text-sm shadow-md cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 icon-pop" />
                    <span>Consultar disponibilidade no WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSubType('todos');
                      onResetAllFilters();
                    }}
                    className="btn-anim w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#004d61] border border-[#004d61]/30 font-semibold text-sm cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Ver todos os produtos</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  key={`${activeCategory}-${activeRoom}-${activeSegment}-${activeSubType}-${searchQuery}-${safePage}-${sortOrder}`}
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5 animate-view-enter"
                >
                  {paginatedProducts.map((product) => {
                    const cat = categories.find((c) => c.id === product.category);
                    const showPhoto = Boolean(product.image) && !brokenImages[product.id];
                    const isAdded = recentlyAddedId === product.id;

                    return (
                      <article
                        key={product.id}
                        onClick={() => setQuickViewProduct(product)}
                        className="product-card bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between cursor-pointer group"
                      >
                        <div>
                          {/* Área de Imagem */}
                          <div className="relative h-36 sm:h-44 bg-white border-b border-slate-100 flex items-center justify-center overflow-hidden p-2">
                            {showPhoto ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={() =>
                                  setBrokenImages((prev) => ({ ...prev, [product.id]: true }))
                                }
                                className="w-full h-full object-contain sm:object-cover rounded-lg"
                              />
                            ) : (
                              <div className="product-icon-wrap w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#eef5f7] text-[#004d61] flex items-center justify-center border border-[#004d61]/10">
                                {renderLucideIcon(cat?.icon || 'package', 'w-7 h-7 sm:w-8 sm:h-8')}
                              </div>
                            )}
                          </div>

                          {/* Frente Limpa do Card (sem tag de categoria e sem selo de estoque) */}
                          <div className="p-3.5 sm:p-4 space-y-1.5">
                            {product.sku && (
                              <span className="block font-mono text-[11px] text-slate-400 tabular-nums truncate">
                                {product.sku}
                              </span>
                            )}

                            <h3 className="font-bold text-slate-900 text-sm sm:text-[15px] leading-snug group-hover:text-[#004d61] transition-colors line-clamp-2">
                              {product.name}
                            </h3>

                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                              {product.measures && product.measures !== 'Padrão comercial'
                                ? `${product.measures} · ${product.spec}`
                                : product.spec}
                            </p>
                          </div>
                        </div>

                        <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1">
                          <button
                            type="button"
                            onClick={(e) => handleQuickQuote(e, product)}
                            className={`btn-anim w-full min-h-[44px] py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                              isAdded
                                ? 'bg-[#003a49] text-white'
                                : 'bg-[#004d61] hover:bg-[#003a49] text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-4 h-4 shrink-0" />
                                <span>Adicionado!</span>
                              </>
                            ) : (
                              <>
                                <ClipboardList className="w-4 h-4 icon-pop shrink-0" />
                                <span>Cotar item</span>
                              </>
                            )}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Controles de Paginação Inteligente */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Paginação do catálogo"
                    className="pt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="min-w-[40px] min-h-[40px] px-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:border-[#004d61] disabled:opacity-40 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                      aria-label="Página anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {paginationItems.map((item, index) =>
                      item === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-sm font-semibold text-slate-400 select-none"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setCurrentPage(item);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`min-w-[40px] min-h-[40px] px-3 rounded-xl text-sm font-bold tabular-nums transition cursor-pointer ${
                            item === safePage
                              ? 'bg-[#004d61] text-white shadow-sm'
                              : 'bg-white border border-slate-300 text-slate-700 hover:border-[#004d61] hover:text-[#004d61]'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="min-w-[40px] min-h-[40px] px-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:border-[#004d61] disabled:opacity-40 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                      aria-label="Próxima página"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gaveta Mobile de Filtros (< 1024px) */}
      {mobileFiltersOpen && (
        <div
          onClick={() => setMobileFiltersOpen(false)}
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          className="fixed inset-0 z-[9990] bg-slate-900/50 lg:hidden flex justify-start animate-fade-in"
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs h-full bg-white shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-5 py-4 bg-[#004d61] text-white flex items-center justify-between">
              <span className="font-bold text-base">Filtrar Catálogo</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/15 cursor-pointer"
                aria-label="Fechar filtros"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{sidebarContent}</div>
          </aside>
        </div>
      )}

      {/* Modal Centralizado de Detalhes do Produto */}
      <ProductDetailModal
        product={quickViewProduct}
        categories={categories}
        rooms={rooms}
        onClose={() => setQuickViewProduct(null)}
        onAddToQuote={onAddToQuote}
        onSelectRoom={(rId) => onChangeRoom(rId)}
      />
    </section>
  );
};
