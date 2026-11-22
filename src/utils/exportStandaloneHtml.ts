import { SiteData } from '../types';
import { EMBEDDED_FAVICON } from '../data/defaultSiteData';
import { resolveLogoSrc } from './helpers';

async function toInlineDataUrl(src: string): Promise<string> {
  if (!src || src.startsWith('data:')) return src;
  try {
    const res = await fetch(src);
    if (!res.ok) return src;
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || src);
      reader.onerror = () => resolve(src);
      reader.readAsDataURL(blob);
    });
  } catch {
    return src;
  }
}

function isoPoint(u: number, v: number, z = 0): string {
  const x = (460 + (u - v) * 330).toFixed(1);
  const y = (135 + (u + v) * 165 - z).toFixed(1);
  return `${x},${y}`;
}

export async function downloadUpdatedSiteHtml(siteData: SiteData): Promise<void> {
  const resolvedLogo = await toInlineDataUrl(resolveLogoSrc(siteData.logoDataUrl));
  const payloadData: SiteData = {
    ...siteData,
    updatedAt: Date.now(),
    logoDataUrl: resolvedLogo
  };

  const serializedJson = JSON.stringify(payloadData).replace(/<\/script>/gi, '<\\/script>');
  const safeFavicon = EMBEDDED_FAVICON;

  const html = `<!doctype html>
<html lang="pt-BR" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#004d61" />
  <meta name="color-scheme" content="light only" />
  <title>Faberminas</title>
  <meta name="description" content="Materiais de higiene, limpeza, descartáveis e suprimentos em Belo Horizonte e Região Metropolitana." />
  <meta property="og:title" content="Faberminas" />
  <meta property="og:description" content="Materiais de higiene, limpeza, descartáveis e suprimentos em Belo Horizonte e Região Metropolitana." />
  <meta property="og:type" content="website" />
  <link rel="icon" type="image/png" href="${safeFavicon}" />
  <link rel="apple-touch-icon" href="${safeFavicon}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { theme: { extend: { fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] } } } };
  </script>
  <style>
    :root { color-scheme: light only; }
    html, body { color-scheme: light only; forced-color-adjust: none; font-family: 'Inter', system-ui, sans-serif; background: #fff; color: #1e293b; overflow-x: clip; }
    .bg-arch-grid-dark {
      background-color: #004d61;
      background-image: linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 36px 36px;
    }
    .bg-arch-grid-light {
      background-color: #F8FAFC;
      background-image: linear-gradient(to right, rgba(0,77,97,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,77,97,0.045) 1px, transparent 1px);
      background-size: 36px 36px;
    }
    .nav-dropdown-panel { display: none; opacity: 0; transform: translateY(6px); pointer-events: none; transition: opacity .18s ease, transform .18s ease; }
    .nav-dropdown-group.is-open .nav-dropdown-panel { display: block; opacity: 1; transform: translateY(0); pointer-events: auto; }
    .nav-dropdown-group.is-open .nav-chevron { transform: rotate(180deg); }
    .sidebar-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,77,97,0.35) transparent; }
    .sidebar-scroll::-webkit-scrollbar { width: 6px; }
    .sidebar-scroll::-webkit-scrollbar-thumb { background-color: rgba(0,77,97,0.3); border-radius: 9999px; }
    .svg-room-zone { cursor: pointer; touch-action: manipulation; transition: transform .25s ease, filter .25s ease; }
    .svg-room-zone:hover { transform: translateY(-4px); filter: drop-shadow(0 10px 16px rgba(0,77,97,0.22)); }
    .svg-room-zone:hover .room-floor { fill: #004d61; fill-opacity: 0.14; stroke: #004d61; stroke-width: 2.5; }
  </style>
  <script>
    window.__FABERMINAS_SITE_DATA__ = ${serializedJson};
  </script>
</head>
<body class="bg-white text-slate-800 antialiased selection:bg-[#004d61] selection:text-white">
  <div id="app"></div>
  <div id="portal-root"></div>
  <script>
    (function () {
      const STORAGE_KEY = 'faberminas_site_data_v6';
      const BASE_DATA = window.__FABERMINAS_SITE_DATA__;
      let SITE_DATA = BASE_DATA;
      try {
        const localRaw = localStorage.getItem(STORAGE_KEY);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (parsed && (!BASE_DATA.updatedAt || (parsed.updatedAt && parsed.updatedAt >= BASE_DATA.updatedAt))) {
            SITE_DATA = Object.assign({}, BASE_DATA, parsed);
          }
        }
      } catch (e) {}

      function norm(s) {
        return String(s || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
      }

      const SUBTYPE_FILTERS = [
        { id: 'luva', label: 'Luvas', test: n => /\\bluva\\b/.test(n) },
        { id: 'rodo', label: 'Rodos', test: n => /\\brodo\\b/.test(n) },
        { id: 'fralda', label: 'Fraldas', test: n => /\\bfralda\\b/.test(n) },
        { id: 'vassoura', label: 'Vassouras & Vasculhos', test: n => /\\b(vassoura|vassourao|vasculho)\\b/.test(n) },
        { id: 'escova', label: 'Escovas', test: n => /\\bescova\\b/.test(n) },
        { id: 'pano-flanela', label: 'Panos & Flanelas', test: n => /\\b(pano|flanela)\\b/.test(n) },
        { id: 'esponja-fibra', label: 'Esponjas, Fibras & Palha de Aço', test: n => /\\b(esponja|fibra|palha de aco)\\b/.test(n) },
        { id: 'lixeira-pa', label: 'Lixeiras & Pás de Lixo', test: n => /\\b(lixeira|pa de lixo)\\b/.test(n) },
        { id: 'sabonete-sabao', label: 'Sabonetes & Sabão', test: n => /\\b(sabonete|sabao|saponaceo)\\b/.test(n) },
        { id: 'desentupidor', label: 'Desentupidores', test: n => /\\bdesentupidor\\b/.test(n) },
        { id: 'disco', label: 'Discos p/ Enceradeira', test: n => /\\bdisco\\b/.test(n) },
        { id: 'mop', label: 'Mops & Refis', test: n => /\\bmop\\b/.test(n) },
        { id: 'cabo', label: 'Cabos & Extensores', test: n => /^(cabo|prolongador)\\b/.test(n) },
        { id: 'balde', label: 'Baldes', test: n => /\\bbalde\\b/.test(n) },
        { id: 'capa', label: "Capas Caixa d'Água", test: n => /^capa\\b/.test(n) },
        { id: 'absorvente', label: 'Absorventes', test: n => /\\babsorvente\\b/.test(n) },
        { id: 'avental-touca', label: 'Aventais & Toucas TNT', test: n => /\\b(avental|touca)\\b/.test(n) },
        { id: 'compressa', label: 'Compressas & Curativos', test: n => /\\b(compressa|malha tubular)\\b/.test(n) },
        { id: 'mamadeira-bico', label: 'Mamadeiras & Bicos', test: n => /^(mamadeira|bico|chupeta)\\b/.test(n) },
        { id: 'tala-colar', label: 'Talas & Colares Cervicais', test: n => /\\b(tala|colar|splint)\\b/.test(n) },
        { id: 'gelo-isopor', label: 'Gelo Rígido & Isopor', test: n => /\\b(gelo|isopor)\\b/.test(n) },
        { id: 'shampoo-cuidado', label: 'Shampoos, Cremes & Pessoais', test: n => /\\b(shampoo|condicionador|creme|desodorante|repelente|protetor|cortador|haste|aparelho|fio dental|banheira)\\b/.test(n) },
        { id: 'oculos', label: 'Óculos de Proteção', test: n => /\\boculos\\b/.test(n) },
        { id: 'ferramenta-manual', label: 'Ferramentas Manuais', test: n => /\\b(martelo|arco de serra|trena|camara de ar)\\b/.test(n) }
      ];

      let quoteCart = [];
      let route = window.location.hash || '#/inicio';
      let activeCat = 'todos';
      let activeRoom = 'todos';
      let activeSeg = 'todos';
      let activeSubType = 'todos';
      let searchQuery = '';
      let slideIdx = 0;
      let currentPage = 1;
      let drawerOpen = false;
      let mobileMenuOpen = false;
      let subTypesOpen = false;
      let modalRoomId = null;
      let detailProductId = null;
      let detailQty = 1;
      let detailTab = 'todos';

      function esc(str) {
        return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      }
      function digits(s) { return String(s || '').replace(/\\D/g, ''); }

      function syncBodyLock() {
        document.body.style.overflow = (drawerOpen || modalRoomId || detailProductId) ? 'hidden' : '';
      }

      function parseHash() {
        const h = window.location.hash || '#/inicio';
        route = h;
        if (h.startsWith('#/produtos')) {
          const qs = h.split('?')[1] || '';
          const params = new URLSearchParams(qs);
          activeCat = params.get('cat') || 'todos';
          activeRoom = params.get('room') || 'todos';
          activeSeg = params.get('seg') || 'todos';
        }
      }

      window.goCatalog = function (cat, room, seg) {
        activeCat = cat || 'todos';
        activeRoom = room || 'todos';
        activeSeg = seg || 'todos';
        activeSubType = 'todos';
        currentPage = 1;
        const p = new URLSearchParams();
        if (activeCat !== 'todos') p.set('cat', activeCat);
        if (activeRoom !== 'todos') p.set('room', activeRoom);
        if (activeSeg !== 'todos') p.set('seg', activeSeg);
        window.location.hash = '#/produtos' + (p.toString() ? '?' + p.toString() : '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      window.goHomeSection = function (secId) {
        window.location.hash = '#/inicio';
        setTimeout(function () {
          if (secId) {
            var el = document.getElementById(secId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 60);
      };

      window.handleTargetLink = function (url) {
        if (!url || url.startsWith('#/produtos')) {
          const qs = (url || '').split('?')[1] || '';
          const params = new URLSearchParams(qs);
          window.goCatalog(params.get('cat') || 'todos', params.get('room') || 'todos', params.get('seg') || 'todos');
        } else if (url.startsWith('#')) {
          window.goHomeSection(url.replace(/^#/, ''));
        } else {
          var a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.click();
        }
      };

      window.addToQuote = function (id, qty) {
        const p = SITE_DATA.products.find(x => x.id === id);
        if (!p) return;
        const minQty = Math.max(1, Number(p.qtdMinima) || 1);
        const found = quoteCart.find(x => x.id === id);
        if (found) {
          found.qtdMinima = minQty;
          found.qty = Math.max(minQty, found.qty + (qty !== undefined ? Math.max(1, qty) : 1));
        } else {
          quoteCart.push({
            id: p.id,
            sku: p.sku || '',
            name: p.name,
            spec: p.spec,
            measures: p.measures || '',
            qtdMinima: minQty,
            qty: Math.max(minQty, qty || minQty)
          });
        }
        render();
      };

      window.bulkAddRoom = function (roomId) {
        const items = SITE_DATA.products.filter(p => Array.isArray(p.rooms) && p.rooms.includes(roomId));
        items.forEach(p => {
          const minQty = Math.max(1, Number(p.qtdMinima) || 1);
          const found = quoteCart.find(x => x.id === p.id);
          if (found) found.qty = Math.max(minQty, found.qty + 1);
          else quoteCart.push({ id: p.id, sku: p.sku || '', name: p.name, spec: p.spec, measures: p.measures || '', qtdMinima: minQty, qty: minQty });
        });
        modalRoomId = null;
        drawerOpen = true;
        render();
      };

      window.changeQty = function (id, delta) {
        quoteCart = quoteCart.map(x => {
          if (x.id !== id) return x;
          const minQty = Math.max(1, Number(x.qtdMinima) || 1);
          return Object.assign({}, x, { qty: Math.max(minQty, x.qty + delta) });
        });
        render();
      };

      window.removeFromQuote = function (id) {
        quoteCart = quoteCart.filter(x => x.id !== id);
        render();
      };

      window.openProductDetail = function (id) {
        const p = SITE_DATA.products.find(x => x.id === id);
        if (!p) return;
        detailProductId = id;
        detailQty = Math.max(1, Number(p.qtdMinima) || 1);
        detailTab = 'todos';
        render();
      };

      window.closeProductDetail = function () {
        detailProductId = null;
        render();
      };

      window.setDetailTab = function (tab) { detailTab = tab; render(); };
      window.stepDetailQty = function (delta) {
        const p = SITE_DATA.products.find(x => x.id === detailProductId);
        const minQty = Math.max(1, Number(p && p.qtdMinima) || 1);
        detailQty = Math.max(minQty, detailQty + delta);
        render();
      };
      window.setSubType = function (st) { activeSubType = st; currentPage = 1; render(); };
      window.setPage = function (pg) { currentPage = pg; window.scrollTo({ top: 0, behavior: 'smooth' }); render(); };

      window.sendWhatsQuote = function () {
        if (!quoteCart.length) return;
        const lines = quoteCart.map(i => '- ' + i.qty + 'x ' + (i.sku ? '[' + i.sku + '] ' : '') + i.name + (i.spec ? ' (' + i.spec + ')' : ''));
        const msg = 'Olá! Gostaria de solicitar uma cotação com a Faberminas:\\n\\n' + lines.join('\\n') + '\\n\\nAguardo retorno.';
        var a = document.createElement('a');
        a.href = 'https://wa.me/' + digits(SITE_DATA.whatsapp) + '?text=' + encodeURIComponent(msg);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.click();
      };

      window.__setProductsMenu = function (open) {
        var el = document.getElementById('nav-products-group');
        if (el) {
          if (open) el.classList.add('is-open');
          else el.classList.remove('is-open');
        }
      };
      window.__toggleSubTypes = function () { subTypesOpen = !subTypesOpen; render(); };

      function renderHeader() {
        const total = quoteCart.reduce((a, b) => a + b.qty, 0);
        const catLinks = '<a href="javascript:void(0)" onclick="window.__setProductsMenu(false);goCatalog(\\'todos\\',\\'todos\\',\\'todos\\')" class="block px-4 py-2.5 text-sm font-bold text-[#004d61] hover:bg-[#eef5f7] border-b border-slate-100">Todos os Produtos</a>' +
          SITE_DATA.categories.map(c => '<a href="javascript:void(0)" onclick="window.__setProductsMenu(false);goCatalog(\\'' + esc(c.id) + '\\',\\'todos\\',\\'todos\\')" class="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#eef5f7] hover:text-[#004d61]">' + esc(c.label) + '</a>').join('');

        return '<header class="sticky top-0 z-40 bg-[#004d61] text-white shadow-md">' +
          '<div class="w-full px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-4">' +
            '<a href="javascript:void(0)" onclick="goHomeSection()" class="shrink-0"><img src="' + esc(SITE_DATA.logoDataUrl) + '" alt="Faberminas" class="h-9 sm:h-12 w-auto object-contain" /></a>' +
            '<div class="hidden md:flex flex-1"><form onsubmit="event.preventDefault();goCatalog(\\'todos\\',\\'todos\\',\\'todos\\')" class="flex w-full bg-white rounded-xl overflow-hidden shadow-sm"><input type="text" value="' + esc(searchQuery) + '" oninput="searchQuery=this.value" placeholder="Busque por produtos de higiene, limpeza, descartáveis ou código SKU..." class="flex-1 px-4 py-2.5 text-sm text-slate-800 focus:outline-none" /><button type="submit" class="px-5 bg-[#eef5f7] text-[#004d61] font-bold text-sm">Buscar</button></form></div>' +
            '<div class="flex items-center gap-2 shrink-0">' +
              '<button type="button" onclick="window.__toggleDrawer(true)" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold cursor-pointer"><span>Cesta de Cotação</span><span class="px-2 py-0.5 text-xs font-bold rounded-full bg-white text-[#004d61]">' + total + '</span></button>' +
              '<button type="button" onclick="window.__toggleMobileMenu()" class="md:hidden px-3 py-2 rounded-lg bg-white/10 text-white text-xs font-bold">Menu</button>' +
            '</div>' +
          '</div>' +
          '<div class="hidden md:block bg-[#003a49] border-t border-white/10">' +
            '<nav class="w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4 h-11 text-sm font-medium">' +
              '<a href="javascript:void(0)" onclick="goHomeSection()" class="text-white/90 hover:text-white whitespace-nowrap">Início</a>' +
              '<div id="nav-products-group" onmouseenter="window.__setProductsMenu(true)" onmouseleave="window.__setProductsMenu(false)" class="relative nav-dropdown-group"><button type="button" onclick="window.__setProductsMenu(false);goCatalog(\\'todos\\',\\'todos\\',\\'todos\\')" class="inline-flex items-center gap-1 text-white/90 hover:text-white cursor-pointer whitespace-nowrap"><span>Produtos</span><span class="nav-chevron inline-block transition-transform duration-200">▾</span></button><div class="nav-dropdown-panel absolute left-0 top-full pt-1 w-64 z-50"><div class="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden py-1.5 max-h-[65vh] overflow-y-auto sidebar-scroll">' + catLinks + '</div></div></div>' +
              '<a href="javascript:void(0)" onclick="goHomeSection(\\'segmentos\\')" class="text-white/90 hover:text-white whitespace-nowrap">Segmentos</a>' +
              '<a href="javascript:void(0)" onclick="goHomeSection(\\'sobre\\')" class="text-white/90 hover:text-white whitespace-nowrap">Sobre Nós</a>' +
              '<a href="javascript:void(0)" onclick="goHomeSection(\\'ambientes\\')" class="text-white/90 hover:text-white whitespace-nowrap">Compre por Ambiente</a>' +
              '<a href="javascript:void(0)" onclick="goHomeSection(\\'localizacao\\')" class="text-white/90 hover:text-white whitespace-nowrap">Localização</a>' +
              '<a href="javascript:void(0)" onclick="goHomeSection(\\'contato\\')" class="text-white/90 hover:text-white whitespace-nowrap">Contato</a>' +
            '</nav>' +
          '</div>' +
          (mobileMenuOpen ? '<div class="md:hidden bg-[#003a49] px-4 py-3 space-y-1 border-t border-white/10">' +
            '<a href="javascript:void(0)" onclick="window.__toggleMobileMenu();goHomeSection()" class="block px-3 py-2 text-white">Início</a>' +
            '<a href="javascript:void(0)" onclick="window.__toggleMobileMenu();goCatalog(\\'todos\\',\\'todos\\',\\'todos\\')" class="block px-3 py-2 text-white font-bold">Todos os Produtos</a>' +
            SITE_DATA.categories.map(c => '<a href="javascript:void(0)" onclick="window.__toggleMobileMenu();goCatalog(\\'' + esc(c.id) + '\\',\\'todos\\',\\'todos\\')" class="block pl-6 py-1.5 text-sm text-white/85">' + esc(c.label) + '</a>').join('') +
            '<a href="javascript:void(0)" onclick="window.__toggleMobileMenu();goHomeSection(\\'segmentos\\')" class="block px-3 py-2 text-white">Segmentos</a>' +
            '<a href="javascript:void(0)" onclick="window.__toggleMobileMenu();goHomeSection(\\'sobre\\')" class="block px-3 py-2 text-white">Sobre Nós</a>' +
            '<a href="javascript:void(0)" onclick="window.__toggleMobileMenu();goHomeSection(\\'ambientes\\')" class="block px-3 py-2 text-white">Compre por Ambiente</a>' +
            '<a href="javascript:void(0)" onclick="window.__toggleMobileMenu();goHomeSection(\\'localizacao\\')" class="block px-3 py-2 text-white">Localização</a>' +
            '<a href="javascript:void(0)" onclick="window.__toggleMobileMenu();goHomeSection(\\'contato\\')" class="block px-3 py-2 text-white">Contato</a>' +
          '</div>' : '') +
        '</header>';
      }

      function renderCarousel() {
        const slides = (SITE_DATA.banners && SITE_DATA.banners.carousel ? SITE_DATA.banners.carousel : []).filter(s => s.enabled);
        if (!slides.length) return '';
        const s = slides[slideIdx % slides.length];
        const showBtn = s.showButton !== false && s.ctaLabel;
        const makeWhole = !showBtn && s.ctaLink;
        const inner = (s.image ? '<img src="' + esc(s.image) + '" class="absolute inset-0 w-full h-full object-cover" />' : '') +
          '<div class="relative max-w-4xl mx-auto px-12 py-16 text-center">' +
            (s.title ? '<h1 class="text-3xl sm:text-5xl font-extrabold mb-4">' + esc(s.title) + '</h1>' : '') +
            (s.subtitle ? '<p class="text-base sm:text-lg text-white/90 mb-7">' + esc(s.subtitle) + '</p>' : '') +
            (showBtn ? '<button type="button" onclick="handleTargetLink(\\'' + esc(s.ctaLink || '#/produtos') + '\\')" class="px-7 py-3.5 rounded-xl bg-white text-[#004d61] font-bold text-sm sm:text-base shadow-xl cursor-pointer">' + esc(s.ctaLabel) + '</button>' : '') +
          '</div>';
        const navBtns = slides.length > 1 ? '<button type="button" onclick="event.stopPropagation();window.__prevSlide()" class="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white text-[#004d61] font-bold">&lsaquo;</button><button type="button" onclick="event.stopPropagation();window.__nextSlide()" class="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white text-[#004d61] font-bold">&rsaquo;</button>' : '';
        if (makeWhole) {
          return '<section class="relative bg-arch-grid-dark text-white min-h-[340px]">' +
            '<a href="' + esc(s.ctaLink) + '" onclick="event.preventDefault();handleTargetLink(\\'' + esc(s.ctaLink) + '\\')" class="relative min-h-[340px] flex items-center w-full cursor-pointer">' + inner + '</a>' +
            navBtns +
          '</section>';
        }
        return '<section class="relative bg-arch-grid-dark text-white min-h-[340px] flex items-center">' + inner + navBtns + '</section>';
      }

      function renderHouse() {
        const countRoom = (rId) => SITE_DATA.products.filter(p => Array.isArray(p.rooms) && p.rooms.includes(rId)).length;
        const p1 = isoPoint(0,0,0), p2 = isoPoint(1,0,0), p3 = isoPoint(1,1,0), p4 = isoPoint(0,1,0);
        const cz = [isoPoint(0,0,1), isoPoint(0.55,0,1), isoPoint(0.55,0.55,1), isoPoint(0,0.55,1)].join(' ');
        const bn = [isoPoint(0.57,0,1), isoPoint(1,0,1), isoPoint(1,0.52,1), isoPoint(0.57,0.52,1)].join(' ');
        const es = [isoPoint(0,0.56,1), isoPoint(0.52,0.56,1), isoPoint(0.52,1,1), isoPoint(0,1,1)].join(' ');
        const ar = [isoPoint(0.52,0.52,1), isoPoint(1,0.52,1), isoPoint(1,1,1), isoPoint(0.52,1,1)].join(' ');

        const pins = [
          { id: 'cozinha', u: 0.28, v: 0.28 },
          { id: 'banheiro', u: 0.78, v: 0.25 },
          { id: 'escritorio', u: 0.24, v: 0.78 },
          { id: 'area-servico', u: 0.76, v: 0.76 }
        ].map(pt => {
          const r = SITE_DATA.rooms.find(x => x.id === pt.id);
          if (!r) return '';
          const xy = isoPoint(pt.u, pt.v, 36);
          return '<g transform="translate(' + xy + ')" class="pointer-events-none">' +
            '<path d="M0,0 C-10,-14 -16,-22 -16,-31 A16,16 0 1,1 16,-31 C16,-22 10,-14 0,0 Z" fill="#004d61" stroke="#fff" stroke-width="2.5"/>' +
            '<circle cx="0" cy="-31" r="6" fill="#fff"/>' +
            '<rect x="-68" y="12" width="136" height="26" rx="6" fill="#fff" stroke="#004d61" stroke-width="1.5"/>' +
            '<text x="0" y="29" text-anchor="middle" fill="#004d61" font-size="11.5" font-weight="700">' + esc(r.shortLabel) + ' (' + countRoom(r.id) + ')</text>' +
          '</g>';
        }).join('');

        return '<section id="ambientes" class="bg-arch-grid-light py-16 sm:py-24 border-b border-slate-200">' +
          '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">' +
            '<div class="text-center max-w-3xl mx-auto mb-10"><div class="w-12 h-1 bg-[#004d61] mx-auto mb-4 rounded-full"></div>' +
              '<h2 class="text-3xl sm:text-4xl font-extrabold text-[#004d61] uppercase">Cada setor pede o material certo.</h2>' +
              '<p class="text-slate-600 mt-3">Clique em qualquer ambiente da planta para abrir a lista recomendada e montar seu kit de cotação.</p>' +
            '</div>' +
            '<div class="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg p-3 sm:p-6">' +
              '<svg viewBox="0 0 920 560" class="w-full h-auto touch-manipulation">' +
                '<polygon points="' + p1 + ' ' + p2 + ' ' + p3 + ' ' + p4 + '" fill="#f8fafc" stroke="#004d61" stroke-width="2.2" />' +
                '<g class="svg-room-zone" onclick="window.__openRoomModal(\\'cozinha\\')"><polygon class="room-floor" points="' + cz + '" fill="#ffffff" stroke="#004d61" stroke-opacity="0.3" /></g>' +
                '<g class="svg-room-zone" onclick="window.__openRoomModal(\\'banheiro\\')"><polygon class="room-floor" points="' + bn + '" fill="#eef5f7" stroke="#004d61" stroke-opacity="0.3" /></g>' +
                '<g class="svg-room-zone" onclick="window.__openRoomModal(\\'escritorio\\')"><polygon class="room-floor" points="' + es + '" fill="#ffffff" stroke="#004d61" stroke-opacity="0.3" /></g>' +
                '<g class="svg-room-zone" onclick="window.__openRoomModal(\\'area-servico\\')"><polygon class="room-floor" points="' + ar + '" fill="#f1f5f9" stroke="#004d61" stroke-opacity="0.3" /></g>' +
                pins +
              '</svg>' +
            '</div>' +
            '<div class="mt-10 text-center"><button type="button" onclick="goCatalog(\\'todos\\',\\'todos\\',\\'todos\\')" class="px-8 py-4 rounded-xl bg-[#004d61] text-white font-bold text-base shadow-lg cursor-pointer">Explorar catálogo completo &rarr;</button></div>' +
          '</div>' +
        '</section>';
      }

      function renderRoomModal() {
        if (!modalRoomId) return '';
        const room = SITE_DATA.rooms.find(r => r.id === modalRoomId);
        if (!room) return '';
        const items = SITE_DATA.products.filter(p => Array.isArray(p.rooms) && p.rooms.includes(modalRoomId));
        return '<div onclick="window.__openRoomModal(null)" style="position:fixed;inset:0;z-index:9990;backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center" class="bg-slate-900/60 p-4">' +
          '<div onclick="event.stopPropagation()" class="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">' +
            '<div class="px-6 py-5 bg-[#004d61] text-white flex justify-between items-start gap-4">' +
              '<div><h3 class="text-2xl font-extrabold">' + esc(room.label) + '</h3><p class="text-sm text-white/85 mt-1">' + esc(room.desc) + '</p></div>' +
              '<button type="button" onclick="window.__openRoomModal(null)" class="px-3 py-1 rounded bg-white/15 font-bold cursor-pointer">Fechar</button>' +
            '</div>' +
            '<div class="p-6 overflow-y-auto bg-[#F8FAFC] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">' +
              items.map(p => '<div onclick="openProductDetail(' + p.id + ')" class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between gap-3 cursor-pointer hover:border-[#004d61]/50 transition"><div>' + (p.sku ? '<span class="text-[11px] font-mono text-slate-400">' + esc(p.sku) + '</span>' : '') + '<h4 class="font-bold text-slate-900 text-sm">' + esc(p.name) + '</h4>' + (p.measures ? '<p class="text-xs text-[#004d61] font-medium mt-1">' + esc(p.measures) + '</p>' : '') + '</div><button type="button" onclick="event.stopPropagation();addToQuote(' + p.id + ')" class="w-full py-2 rounded-lg bg-[#004d61] text-white text-xs font-bold cursor-pointer">Adicionar à cotação</button></div>').join('') +
            '</div>' +
            (items.length ? '<div class="px-6 py-4 bg-white border-t flex justify-end"><button type="button" onclick="bulkAddRoom(\\'' + esc(room.id) + '\\')" class="px-6 py-3 rounded-xl bg-[#004d61] text-white font-bold text-sm cursor-pointer">Adicionar kit completo do ambiente (' + items.length + ')</button></div>' : '') +
          '</div>' +
        '</div>';
      }

      function renderProductDetailModal() {
        if (!detailProductId) return '';
        const p = SITE_DATA.products.find(x => x.id === detailProductId);
        if (!p) return '';
        const cat = SITE_DATA.categories.find(c => c.id === p.category);
        const minQty = Math.max(1, Number(p.qtdMinima) || 1);
        const showSobre = detailTab === 'todos' || detailTab === 'sobre';
        const showFicha = detailTab === 'todos' || detailTab === 'ficha';

        return '<div onclick="closeProductDetail()" style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)" class="bg-slate-900/60 p-4">' +
          '<div onclick="event.stopPropagation()" class="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 flex flex-col">' +
            '<div class="sticky top-0 z-10 bg-[#004d61] text-white px-6 py-4 flex items-start justify-between gap-4">' +
              '<div class="min-w-0">' +
                (cat ? '<span class="text-xs font-semibold text-white/80 block mb-0.5">' + esc(cat.label) + '</span>' : '') +
                '<h3 class="text-lg sm:text-xl font-extrabold leading-snug">' + esc(p.name) + '</h3>' +
              '</div>' +
              '<button type="button" onclick="closeProductDetail()" class="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-bold cursor-pointer shrink-0">Fechar</button>' +
            '</div>' +
            '<div class="p-6 space-y-5">' +
              '<div class="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">' +
                '<div class="sm:col-span-5 h-52 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-center justify-center p-4">' +
                  (p.image ? '<img src="' + esc(p.image) + '" class="max-h-full max-w-full object-contain" />' : '<span class="text-xs font-bold text-[#004d61]/40">FABERMINAS</span>') +
                '</div>' +
                '<div class="sm:col-span-7 space-y-3">' +
                  (p.sku ? '<div><span class="text-[11px] font-bold uppercase text-slate-400">Código (SKU)</span><p class="font-mono font-bold text-sm text-[#004d61]">' + esc(p.sku) + '</p></div>' : '') +
                  (p.measures ? '<div><span class="text-[11px] font-bold uppercase text-slate-400">Medidas</span><p class="text-sm font-semibold text-slate-800">' + esc(p.measures) + '</p></div>' : '') +
                  (minQty > 1 ? '<div class="p-2.5 rounded-lg bg-[#eef5f7] border border-[#004d61]/20 text-xs font-semibold text-[#004d61]">Quantidade mínima para cotação: ' + minQty + ' unidades</div>' : '') +
                '</div>' +
              '</div>' +
              '<div class="flex flex-wrap gap-2 border-b border-slate-200 pb-3">' +
                '<button type="button" onclick="setDetailTab(\\'todos\\')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ' + (detailTab === 'todos' ? 'bg-[#004d61] text-white' : 'bg-slate-100 text-slate-700') + '">Visão Completa</button>' +
                '<button type="button" onclick="setDetailTab(\\'sobre\\')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ' + (detailTab === 'sobre' ? 'bg-[#004d61] text-white' : 'bg-slate-100 text-slate-700') + '">Sobre & Descrição</button>' +
                '<button type="button" onclick="setDetailTab(\\'ficha\\')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ' + (detailTab === 'ficha' ? 'bg-[#004d61] text-white' : 'bg-slate-100 text-slate-700') + '">Código, Medidas & Especificações</button>' +
              '</div>' +
              (showSobre ? '<div class="space-y-3 bg-[#F8FAFC] p-4 rounded-xl border border-slate-200">' +
                '<div><h4 class="text-xs font-bold uppercase text-[#004d61] mb-1">Sobre o produto</h4><p class="text-sm text-slate-700 leading-relaxed">' + esc(p.about || p.name) + '</p></div>' +
                '<div><h4 class="text-xs font-bold uppercase text-[#004d61] mb-1">Descrição</h4><p class="text-sm text-slate-600 leading-relaxed">' + esc((p.description && p.description !== p.about) ? p.description : ('Aplicação e especificações: ' + (p.spec || p.name) + (p.measures ? ' · Medidas: ' + p.measures : ''))) + '</p></div>' +
              '</div>' : '') +
              (showFicha ? '<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">' +
                '<div class="p-3.5 rounded-xl bg-white border border-slate-200"><span class="text-[11px] font-bold uppercase text-slate-400 block mb-1">Código (SKU)</span><p class="font-mono text-sm font-bold text-slate-900">' + esc(p.sku || 'N/I') + '</p></div>' +
                '<div class="p-3.5 rounded-xl bg-white border border-slate-200"><span class="text-[11px] font-bold uppercase text-slate-400 block mb-1">Medidas</span><p class="text-sm font-medium text-slate-800">' + esc(p.measures || 'Padrão de fábrica') + '</p></div>' +
                '<div class="p-3.5 rounded-xl bg-white border border-slate-200 sm:col-span-3"><span class="text-[11px] font-bold uppercase text-slate-400 block mb-1">Especificações</span><p class="text-sm text-slate-700 leading-relaxed">' + esc(p.spec || 'Uso profissional e residencial') + '</p></div>' +
              '</div>' : '') +
            '</div>' +
            '<div class="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">' +
              '<div class="flex items-center gap-2">' +
                '<button type="button" onclick="stepDetailQty(-1)" ' + (detailQty <= minQty ? 'disabled' : '') + ' class="w-10 h-10 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 disabled:opacity-40 cursor-pointer">-</button>' +
                '<span class="w-12 text-center font-bold text-slate-900">' + detailQty + '</span>' +
                '<button type="button" onclick="stepDetailQty(1)" class="w-10 h-10 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 cursor-pointer">+</button>' +
              '</div>' +
              '<button type="button" onclick="addToQuote(' + p.id + ', ' + detailQty + ');closeProductDetail()" class="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-bold text-sm cursor-pointer">Adicionar à cotação</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }

      function renderCatalog() {
        const q = searchQuery.trim().toLowerCase();
        const baseFiltered = SITE_DATA.products.filter(p => {
          const okC = activeCat === 'todos' || p.category === activeCat;
          const okR = activeRoom === 'todos' || (Array.isArray(p.rooms) && p.rooms.includes(activeRoom));
          const okS = activeSeg === 'todos' || (Array.isArray(p.segments) && p.segments.includes(activeSeg));
          const okQ = !q || p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q) || (p.spec || '').toLowerCase().includes(q);
          return okC && okR && okS && okQ;
        });

        const availableSubTypes = SUBTYPE_FILTERS.filter(st => baseFiltered.some(p => st.test(norm(p.name))));
        const activeSubObj = SUBTYPE_FILTERS.find(st => st.id === activeSubType);
        const filtered = activeSubObj ? baseFiltered.filter(p => activeSubObj.test(norm(p.name))) : baseFiltered;

        const sidebar = '<aside class="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 space-y-5 h-fit">' +
          '<div><h3 class="font-bold text-sm text-slate-900 mb-2">Categorias</h3><div class="max-h-56 overflow-y-auto pr-1 sidebar-scroll space-y-1">' +
            '<button type="button" onclick="goCatalog(\\'todos\\',\\'' + esc(activeRoom) + '\\',\\'' + esc(activeSeg) + '\\')" class="w-full text-left px-3 py-1.5 rounded-lg text-sm cursor-pointer ' + (activeCat === 'todos' ? 'bg-[#004d61] text-white font-semibold' : 'text-slate-700') + '">Todos</button>' +
            SITE_DATA.categories.map(c => '<button type="button" onclick="goCatalog(\\'' + esc(c.id) + '\\',\\'' + esc(activeRoom) + '\\',\\'' + esc(activeSeg) + '\\')" class="w-full text-left px-3 py-1.5 rounded-lg text-sm cursor-pointer ' + (activeCat === c.id ? 'bg-[#004d61] text-white font-semibold' : 'text-slate-700') + '">' + esc(c.label) + '</button>').join('') +
          '</div></div>' +
          (availableSubTypes.length > 0 ? '<div class="border-t border-slate-100 pt-4"><button type="button" onclick="window.__toggleSubTypes()" class="w-full flex items-center justify-between font-bold text-sm text-slate-900 cursor-pointer"><span>Tipos de Produto</span><span>' + (subTypesOpen ? '▾' : '▸') + '</span></button>' +
            (subTypesOpen ? '<div class="mt-2 max-h-56 overflow-y-auto pr-1 sidebar-scroll space-y-1"><button type="button" onclick="setSubType(\\'todos\\')" class="w-full text-left px-3 py-1.5 rounded-lg text-sm cursor-pointer ' + (activeSubType === 'todos' ? 'bg-[#004d61] text-white font-semibold' : 'text-slate-700') + '">Todos</button>' +
              availableSubTypes.map(st => '<button type="button" onclick="setSubType(\\'' + esc(st.id) + '\\')" class="w-full text-left px-3 py-1.5 rounded-lg text-sm cursor-pointer ' + (activeSubType === st.id ? 'bg-[#004d61] text-white font-semibold' : 'text-slate-700') + '">' + esc(st.label) + '</button>').join('') +
            '</div>' : '') +
          '</div>' : '') +
          '<div class="border-t border-slate-100 pt-4"><h3 class="font-bold text-sm text-slate-900 mb-2">Ambientes</h3><div class="max-h-56 overflow-y-auto pr-1 sidebar-scroll space-y-1">' +
            '<button type="button" onclick="goCatalog(\\'' + esc(activeCat) + '\\',\\'todos\\',\\'' + esc(activeSeg) + '\\')" class="w-full text-left px-3 py-1.5 rounded-lg text-sm cursor-pointer ' + (activeRoom === 'todos' ? 'bg-[#004d61] text-white font-semibold' : 'text-slate-700') + '">Todos</button>' +
            SITE_DATA.rooms.map(r => '<button type="button" onclick="goCatalog(\\'' + esc(activeCat) + '\\',\\'' + esc(r.id) + '\\',\\'' + esc(activeSeg) + '\\')" class="w-full text-left px-3 py-1.5 rounded-lg text-sm cursor-pointer ' + (activeRoom === r.id ? 'bg-[#004d61] text-white font-semibold' : 'text-slate-700') + '">' + esc(r.label) + '</button>').join('') +
          '</div></div>' +
        '</aside>';

        const perPage = 12;
        const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
        if (currentPage > totalPages) currentPage = 1;
        const pageItems = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

        let paginationHtml = '';
        if (totalPages > 1) {
          paginationHtml = '<div class="flex items-center justify-center gap-2 pt-4 flex-wrap">' +
            '<button type="button" onclick="setPage(' + Math.max(1, currentPage - 1) + ')" ' + (currentPage === 1 ? 'disabled' : '') + ' class="px-3 py-1.5 rounded-lg border bg-white text-xs font-bold disabled:opacity-40 cursor-pointer">&lsaquo; Anterior</button>' +
            '<span class="text-xs font-semibold text-slate-600 px-2">Página ' + currentPage + ' de ' + totalPages + '</span>' +
            '<button type="button" onclick="setPage(' + Math.min(totalPages, currentPage + 1) + ')" ' + (currentPage === totalPages ? 'disabled' : '') + ' class="px-3 py-1.5 rounded-lg border bg-white text-xs font-bold disabled:opacity-40 cursor-pointer">Próxima &rsaquo;</button>' +
          '</div>';
        }

        const grid = '<div class="lg:col-span-9 space-y-5">' +
          '<div class="bg-white rounded-2xl border border-slate-200 px-5 py-3 flex justify-between items-center text-sm"><span>Exibindo <strong>' + filtered.length + '</strong> produtos</span></div>' +
          '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">' +
            pageItems.map(p =>
              '<article onclick="openProductDetail(' + p.id + ')" class="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between cursor-pointer hover:border-[#004d61]/50 hover:shadow-md transition">' +
                '<div>' +
                  '<div class="h-36 bg-white border-b flex items-center justify-center p-2">' + (p.image ? '<img src="' + esc(p.image) + '" class="w-full h-full object-contain" />' : '<span class="text-xs font-bold text-[#004d61]/50">FABERMINAS</span>') + '</div>' +
                  '<div class="p-4">' +
                    (p.sku ? '<span class="block text-[11px] font-mono text-slate-400">' + esc(p.sku) + '</span>' : '') +
                    '<h3 class="font-bold text-slate-900 text-sm mt-1 line-clamp-2">' + esc(p.name) + '</h3>' +
                    '<p class="text-xs text-slate-600 mt-1 line-clamp-2">' + esc(p.measures || p.spec) + '</p>' +
                  '</div>' +
                '</div>' +
                '<div class="p-4 pt-0"><button type="button" onclick="event.stopPropagation();addToQuote(' + p.id + ')" class="w-full min-h-[44px] py-2 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-bold text-xs cursor-pointer">Cotar item</button></div>' +
              '</article>'
            ).join('') +
          '</div>' +
          paginationHtml +
        '</div>';

        return '<section class="bg-[#F8FAFC] py-10 min-h-[75vh]"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-7">' + sidebar + grid + '</div></section>';
      }

      function renderHome() {
        const promoList = (SITE_DATA.banners && Array.isArray(SITE_DATA.banners.promotional)
          ? SITE_DATA.banners.promotional
          : [SITE_DATA.banners && SITE_DATA.banners.secondary1, SITE_DATA.banners && SITE_DATA.banners.secondary2].filter(Boolean)
        ).filter(b => b && b.enabled && b.image);

        const aboutSectionHtml =
          '<section id="sobre" class="bg-arch-grid-dark py-14 sm:py-20 text-white border-b border-white/10"><div class="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">' +
            '<div class="lg:col-span-7 space-y-4">' +
              '<div class="w-12 h-1 rounded-full bg-white"></div>' +
              '<h2 class="text-3xl sm:text-4xl font-extrabold">' + esc(SITE_DATA.aboutUsTitle || 'Sobre a Faberminas') + '</h2>' +
              '<p class="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed whitespace-pre-line">' + esc(SITE_DATA.aboutUsText || '') + '</p>' +
            '</div>' +
            '<div class="lg:col-span-5">' +
              (SITE_DATA.aboutUsImage
                ? '<div class="rounded-2xl overflow-hidden border-2 border-white/25 shadow-2xl bg-[#003a49] aspect-[4/3]"><img src="' + esc(SITE_DATA.aboutUsImage) + '" alt="' + esc(SITE_DATA.aboutUsTitle || 'Faberminas') + '" class="w-full h-full object-cover" /></div>'
                : '<div class="rounded-2xl border-2 border-dashed border-white/30 bg-[#003a49]/70 aspect-[4/3] flex flex-col items-center justify-center p-6 text-center"><p class="text-sm sm:text-base font-bold text-white">Espaço para foto institucional</p><p class="text-xs text-white/75 mt-1">Adicione uma foto pelo painel administrativo.</p></div>') +
            '</div>' +
          '</div></section>';

        return renderCarousel() +
          '<section class="bg-[#004d61] py-12"><div class="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">' +
            SITE_DATA.differentials.map(d => '<div class="bg-white p-5 rounded-2xl shadow-md"><h3 class="font-bold text-slate-900">' + esc(d.title) + '</h3><p class="text-xs text-slate-600 mt-1">' + esc(d.desc) + '</p></div>').join('') +
          '</div></section>' +
          '<section id="segmentos" class="bg-white py-14 border-b border-slate-200"><div class="max-w-7xl mx-auto px-4"><h2 class="text-2xl sm:text-3xl font-extrabold text-[#004d61] mb-6 text-center">Compre por Segmento</h2><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">' +
            (SITE_DATA.segments || []).map(seg => '<button type="button" onclick="goCatalog(\\'todos\\',\\'todos\\',\\'' + esc(seg.id) + '\\')" class="p-5 rounded-2xl border border-slate-200 hover:border-[#004d61] bg-[#F8FAFC] text-left transition cursor-pointer"><h3 class="font-bold text-slate-900 text-sm">' + esc(seg.label) + '</h3><p class="text-xs text-slate-600 mt-1">' + esc(seg.desc) + '</p></button>').join('') +
          '</div></div></section>' +
          (promoList.length > 0 ? '<section class="py-10 bg-[#F8FAFC] border-b border-slate-200"><div class="max-w-7xl mx-auto px-4 grid grid-cols-1 ' + (promoList.length > 1 ? 'md:grid-cols-2' : '') + ' gap-6">' +
            promoList.map(slot => {
              const hasLink = Boolean(slot.linkUrl && slot.linkUrl.trim());
              const showBtn = Boolean(slot.showButton && hasLink);
              if (hasLink && !showBtn) {
                return '<div class="rounded-2xl overflow-hidden border shadow-sm bg-white"><a href="' + esc(slot.linkUrl) + '" onclick="event.preventDefault();handleTargetLink(\\'' + esc(slot.linkUrl) + '\\')" class="block w-full cursor-pointer"><img src="' + esc(slot.image) + '" class="w-full max-h-72 object-cover" /></a></div>';
              }
              return '<div class="relative rounded-2xl overflow-hidden border shadow-sm bg-white"><img src="' + esc(slot.image) + '" class="w-full max-h-72 object-cover" />' +
                (showBtn ? '<div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#002b36]/80 to-transparent flex justify-end"><button type="button" onclick="handleTargetLink(\\'' + esc(slot.linkUrl) + '\\')" class="px-4 py-2 rounded-xl bg-white text-[#004d61] font-bold text-xs shadow cursor-pointer">' + esc(slot.ctaLabel || 'Ver ofertas') + ' &rarr;</button></div>' : '') +
              '</div>';
            }).join('') +
          '</div></section>' : '') +
          aboutSectionHtml +
          renderHouse() +
          '<section id="localizacao" class="bg-[#F8FAFC] py-16"><div class="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"><div><h2 class="text-3xl font-bold text-slate-900 mb-3">Localização</h2><p class="text-slate-700 whitespace-pre-line mb-3">' + esc(SITE_DATA.address) + '</p><p class="text-sm text-slate-600">' + esc(SITE_DATA.hours) + '</p></div><div class="h-80 rounded-2xl overflow-hidden border border-slate-200"><iframe title="Mapa Faberminas" src="' + esc(SITE_DATA.mapsEmbed) + '" class="w-full h-full border-0" loading="lazy"></iframe></div></div></section>' +
          '<section id="contato" class="bg-arch-grid-dark text-white py-16"><div class="max-w-4xl mx-auto px-4 text-center space-y-4"><h2 class="text-3xl font-bold">Entre em contato conosco</h2><p class="text-white/85">WhatsApp: ' + esc(SITE_DATA.whatsapp) + ' · Telefone: ' + esc(SITE_DATA.phone) + ' · E-mail: ' + esc(SITE_DATA.email) + '</p><a href="https://wa.me/' + digits(SITE_DATA.whatsapp) + '" target="_blank" class="inline-block px-7 py-3.5 rounded-xl bg-white text-[#004d61] font-bold">Falar no WhatsApp</a></div></section>';
      }

      function renderDrawer() {
        if (!drawerOpen) return '';
        return '<div onclick="window.__toggleDrawer(false)" style="backdrop-filter:blur(8px);z-index:9995" class="fixed inset-0 bg-slate-900/50"></div>' +
          '<aside style="z-index:9996" class="fixed top-0 right-0 h-full w-full sm:max-w-md bg-white shadow-2xl flex flex-col">' +
            '<div class="px-6 py-4 bg-[#004d61] text-white flex justify-between items-center"><h2 class="font-bold text-lg">Cesta de Cotação</h2><button type="button" onclick="window.__toggleDrawer(false)" class="px-3 py-1 rounded bg-white/15 cursor-pointer">Fechar</button></div>' +
            '<div class="px-5 py-3 bg-[#eef5f7] text-xs font-semibold text-[#004d61]">Atendemos Pessoas Físicas (CPF) e Empresas (CNPJ) • Entrega própria ágil em BH e Região Metropolitana</div>' +
            '<div class="flex-1 overflow-y-auto p-5 space-y-3">' +
              (quoteCart.length === 0 ? '<p class="text-center text-slate-500 py-10">Sua cesta está vazia.</p>' : quoteCart.map(i => {
                const minQ = Math.max(1, Number(i.qtdMinima) || 1);
                return '<div class="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3"><div class="min-w-0 flex-1"><p class="font-semibold text-sm text-slate-900">' + esc(i.name) + '</p><p class="text-xs text-slate-500 truncate">' + esc(i.spec) + '</p>' + (minQ > 1 ? '<span class="text-[11px] font-semibold text-[#004d61]">Qtd. mínima: ' + minQ + ' un.</span>' : '') + '</div><div class="flex items-center gap-1.5"><button type="button" onclick="changeQty(' + i.id + ',-1)" ' + (i.qty <= minQ ? 'disabled' : '') + ' class="w-9 h-9 border rounded-lg font-bold disabled:opacity-40 cursor-pointer">-</button><span class="font-bold w-6 text-center">' + i.qty + '</span><button type="button" onclick="changeQty(' + i.id + ',1)" class="w-9 h-9 border rounded-lg font-bold cursor-pointer">+</button><button type="button" onclick="removeFromQuote(' + i.id + ')" class="px-2 py-1 text-xs text-red-500 font-bold cursor-pointer">×</button></div></div>';
              }).join('')) +
            '</div>' +
            (quoteCart.length ? '<div class="p-5 border-t bg-slate-50"><button type="button" onclick="sendWhatsQuote()" class="w-full py-3.5 rounded-xl bg-[#004d61] text-white font-bold cursor-pointer">Enviar Cotação no WhatsApp</button></div>' : '') +
          '</aside>';
      }

      window.__toggleDrawer = function (val) { drawerOpen = val; render(); };
      window.__toggleMobileMenu = function () { mobileMenuOpen = !mobileMenuOpen; render(); };
      window.__openRoomModal = function (id) { modalRoomId = id; render(); };
      window.__prevSlide = function () { slideIdx = Math.max(0, slideIdx - 1); render(); };
      window.__nextSlide = function () { slideIdx += 1; render(); };

      function render() {
        parseHash();
        syncBodyLock();
        const footer = '<footer class="bg-[#004d61] text-white py-10"><div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-4 text-sm">' +
          '<div><p class="font-bold">' + esc(SITE_DATA.legalName) + ' • CNPJ: ' + esc(SITE_DATA.cnpj) + '</p><p class="text-white/75">© 2026 Faberminas. Todos os direitos reservados.</p></div>' +
          '<p class="text-white/80 whitespace-pre-line">' + esc(SITE_DATA.address) + '</p>' +
        '</div></footer>';

        document.getElementById('app').innerHTML = renderHeader() + '<main>' + (route.startsWith('#/produtos') ? renderCatalog() : renderHome()) + '</main>' + footer;
        document.getElementById('portal-root').innerHTML = renderDrawer() + renderRoomModal() + renderProductDetailModal();
      }

      window.addEventListener('hashchange', render);
      render();
    })();
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'index.html';
  anchor.click();
  URL.revokeObjectURL(url);
}
