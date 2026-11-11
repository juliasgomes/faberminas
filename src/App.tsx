import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ClipboardList,
  Menu,
  X,
  ArrowDown,
  ArrowRight,
  Search,
  XCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  MapPin,
  Clock,
  Navigation,
  ShieldCheck,
  Eye,
  Lock,
  Download,
  FileJson,
  Upload,
  RotateCcw,
  CheckCircle,
  Package,
  Sparkles,
  Droplets,
  CupSoda,
  Briefcase,
  LayoutGrid,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
  Truck,
  Building2,
  PackageCheck,
  Headphones,
  Tag,
  ChevronRight
} from 'lucide-react';

const BASE = import.meta.env.BASE_URL || './';
const CLEAN_BASE = BASE.endsWith('/') ? BASE : `${BASE}/`;
const EXACT_LOGO_PATH = `${CLEAN_BASE}assets/aistudio/logo_d65a277a.png`;
const STORAGE_KEY = 'faberminas_site_data_v2';
const EMBEDDED_FAVICON =
  'data:image/png;base64,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';

interface Product {
  id: number;
  name: string;
  category: string;
  spec: string;
  image: string;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  desc: string;
}

interface Differential {
  icon: string;
  title: string;
  desc: string;
}

interface SiteData {
  logoDataUrl: string;
  heroBgUrl: string;
  legalName: string;
  cnpj: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  differentials: Differential[];
  address: string;
  hours: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  mapsEmbed: string;
  categories: Category[];
  products: Product[];
}

interface QuoteItem {
  id: number;
  name: string;
  spec: string;
  qty: number;
}

const DEFAULT_SITE_DATA: SiteData = {
  logoDataUrl: EXACT_LOGO_PATH,
  heroBgUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80',
  legalName: 'FaberMinas Distribuidora Ltda',
  cnpj: '27.424.764/0001-60',
  heroTitle: 'Distribuidora de materiais de higiene, limpeza e suprimentos',
  heroSubtitle:
    'Fornecemos soluções completas para empresas, comércios, condomínios e indústrias com estoque variado, preços competitivos e entrega ágil.',
  heroCta: 'Venha conhecer nossos produtos',
  differentials: [
    { icon: 'truck', title: 'Entrega Própria', desc: 'Logística ágil em BH e Região Metropolitana' },
    { icon: 'building-2', title: 'Atendimento Corporativo', desc: 'Faturamento para empresas, condomínios e CNPJ' },
    { icon: 'package-check', title: 'Pronta Entrega', desc: 'Estoque variado com reposição constante' },
    { icon: 'headphones', title: 'Cotação Rápida', desc: 'Suporte comercial direto pelo WhatsApp' }
  ],
  address: 'R. dos Arquitetos, 408 — Alípio de Melo\nBelo Horizonte - MG, CEP 30840-160',
  hours: 'Segunda a Sexta: 08h00 às 18h00',
  phone: '(31) 3333-4455',
  whatsapp: '(31) 99999-8877',
  email: 'contato@faberminas.com.br',
  instagram: 'https://instagram.com/faberminas',
  mapsEmbed:
    'https://maps.google.com/maps?q=R.%20dos%20Arquitetos,%20408%20-%20Al%C3%ADpio%20de%20Melo,%20Belo%20Horizonte%20-%20MG,%2030840-160&t=&z=16&ie=UTF8&iwloc=&output=embed',
  categories: [
    { id: 'higiene', label: 'Higiene', icon: 'sparkles', desc: 'Papéis e sabonetes' },
    { id: 'limpeza', label: 'Limpeza', icon: 'droplets', desc: 'Químicos e acessórios' },
    { id: 'descartaveis', label: 'Descartáveis', icon: 'cup-soda', desc: 'Copos, sacos e luvas' },
    { id: 'escritorio', label: 'Escritório', icon: 'briefcase', desc: 'Papelaria e expediente' }
  ],
  products: [
    { id: 1, name: 'Papel Toalha Interfolhado Branco', category: 'higiene', spec: 'Fardo com 1.000 folhas • 100% Celulose Virgem', image: '' },
    { id: 2, name: 'Sabonete Líquido Perolado Erva-Doce', category: 'higiene', spec: 'Bombona 5 Litros • pH Neutro Institucional', image: '' },
    { id: 3, name: 'Papel Higiênico Rolão Institucional', category: 'higiene', spec: 'Fardo com 8 rolos de 300m • Folha Simples', image: '' },
    { id: 4, name: 'Detergente Neutro Concentrado', category: 'limpeza', spec: 'Galão 5 Litros • Alto rendimento', image: '' },
    { id: 5, name: 'Desinfetante Bactericida Lavanda', category: 'limpeza', spec: 'Galão 5 Litros • Ação germicida', image: '' },
    { id: 6, name: 'Água Sanitária Uso Geral', category: 'limpeza', spec: 'Galão 5 Litros • Teor de cloro ativo 2,0% a 2,5%', image: '' },
    { id: 7, name: 'Copo Descartável Água 200ml', category: 'descartaveis', spec: 'Caixa com 2.500 unidades (25 tiras de 100)', image: '' },
    { id: 8, name: 'Saco para Lixo Preto Reforçado 100L', category: 'descartaveis', spec: 'Fardo com 100 unidades • Alta resistência', image: '' },
    { id: 9, name: 'Luva Nitrílica Sem Talco Azul', category: 'descartaveis', spec: 'Caixa com 100 unidades • Tamanhos P/M/G', image: '' },
    { id: 10, name: 'Papel Sulfite A4 75g Branco', category: 'escritorio', spec: 'Caixa com 10 resmas (5.000 folhas)', image: '' },
    { id: 11, name: 'Caixa Arquivo Morto Polionda', category: 'escritorio', spec: 'Pacote com 10 unidades • Plástico resistente', image: '' },
    { id: 12, name: 'Fita Adesiva Transparente', category: 'escritorio', spec: 'Pacote com 5 rolos • 45mm x 45m', image: '' }
  ]
};

function onlyDigits(str: string): string {
  return (str || '').replace(/\D/g, '');
}

function compressImageToDataURL(file: File, maxWidth = 720, quality = 0.82): Promise<string> {
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

function renderLucideIcon(iconName: string, className = 'w-5 h-5') {
  switch (iconName) {
    case 'truck':
      return <Truck className={className} />;
    case 'building-2':
      return <Building2 className={className} />;
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
    default:
      return <Tag className={className} />;
  }
}

export default function App() {
  // Estado geral do site
  const [siteData, setSiteData] = useState<SiteData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SITE_DATA,
          ...parsed,
          // Sempre garantir que se a logo salva for o placeholder antigo ou vazio, usar a imagem exata enviada
          logoDataUrl: parsed.logoDataUrl && parsed.logoDataUrl !== 'logo.png' ? parsed.logoDataUrl : EXACT_LOGO_PATH,
          differentials: parsed.differentials || DEFAULT_SITE_DATA.differentials
        };
      }
    } catch (e) {
      console.error('Erro ao ler dados locais:', e);
    }
    return DEFAULT_SITE_DATA;
  });

  // Roteamento
  const [currentRoute, setCurrentRoute] = useState<string>(() => window.location.hash || '#/');
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<'produtos' | 'textos' | 'contato'>('produtos');
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // Estados da interface pública
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quoteDrawerOpen, setQuoteDrawerOpen] = useState(false);
  const [quoteCart, setQuoteCart] = useState<QuoteItem[]>([]);
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  // Formulário de edição de produto no Admin
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormCategory, setProdFormCategory] = useState('');
  const [prodFormSpec, setProdFormSpec] = useState('');
  const [prodFormImageUrl, setProdFormImageUrl] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const adminProductFormRef = useRef<HTMLFormElement>(null);
  const productsGridRef = useRef<HTMLDivElement>(null);
  const [isProductsInView, setIsProductsInView] = useState(false);

  // Garante o Favicon oficial embutido no navegador
  useEffect(() => {
    try {
      let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.type = 'image/png';
      link.href = EMBEDDED_FAVICON;
    } catch (e) {
      console.warn('Erro ao definir favicon dinâmico:', e);
    }
  }, []);

  // Efeito para detectar quando a grade de produtos entra na viewport
  useEffect(() => {
    const el = productsGridRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsProductsInView(true);
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Gerenciamento de rotas e atalho secreto Ctrl+Shift+A
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentRoute(hash);
      if (hash === '#/privacidade' || hash === '#privacidade') {
        setPrivacyModalOpen(true);
      } else {
        setPrivacyModalOpen(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        window.location.hash = '#/admin';
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showToast = (message: string) => {
    setAdminToast(message);
    setTimeout(() => {
      setAdminToast(null);
    }, 3500);
  };

  const saveUpdatedData = (newData: SiteData, msg = 'Alterações salvas com sucesso!') => {
    setSiteData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      showToast(msg);
    } catch {
      showToast('Aviso: Imagem muito grande para o armazenamento local. Prefira fotos mais leves.');
    }
  };

  // Funções da Cesta de Cotação
  const addToQuoteCart = (product: Product) => {
    setQuoteCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { id: product.id, name: product.name, spec: product.spec, qty: 1 }];
    });
    setQuoteDrawerOpen(true);
  };

  const changeQuoteQty = (productId: number, delta: number) => {
    setQuoteCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId) {
            return { ...item, qty: item.qty + delta };
          }
          return item;
        })
        .filter((item) => item.qty > 0);
    });
  };

  const removeFromQuoteCart = (productId: number) => {
    setQuoteCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearQuoteCart = () => {
    setQuoteCart([]);
  };

  const totalQuoteCount = useMemo(() => {
    return quoteCart.reduce((acc, item) => acc + item.qty, 0);
  }, [quoteCart]);

  const quoteMessageText = useMemo(() => {
    const lines = quoteCart.map((item) => `• ${item.qty}x ${item.name} (${item.spec})`);
    return `Olá, FaberMinas! Gostaria de solicitar uma cotação para os seguintes itens:\n\n${lines.join('\n')}\n\nAguardo retorno.`;
  }, [quoteCart]);

  const sendQuoteViaWhatsApp = () => {
    if (quoteCart.length === 0) return;
    const whatsDigits = onlyDigits(siteData.whatsapp);
    const whatsFull = whatsDigits.startsWith('55') ? whatsDigits : `55${whatsDigits}`;
    window.open(`https://wa.me/${whatsFull}?text=${encodeURIComponent(quoteMessageText)}`, '_blank', 'noopener,noreferrer');
  };

  const fillContactWithQuote = () => {
    if (quoteCart.length === 0) return;
    setContactMessage(quoteMessageText);
    setQuoteDrawerOpen(false);
    const contactElem = document.getElementById('contato');
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtro de produtos
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return siteData.products.filter((p) => {
      const matchCat = activeCategory === 'todos' || p.category === activeCategory;
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.spec.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [siteData.products, activeCategory, searchQuery]);

  const INITIAL_LIMIT = 8;
  const isLimited = activeCategory === 'todos' && !searchQuery.trim() && !showAllProducts && filteredProducts.length > INITIAL_LIMIT;
  const visibleProducts = isLimited ? filteredProducts.slice(0, INITIAL_LIMIT) : filteredProducts;

  // Categorias disponíveis
  const allCategoryPills = useMemo(() => {
    return [
      { id: 'todos', label: 'Todos', icon: 'layout-grid', desc: 'Todos os segmentos disponíveis' },
      ...siteData.categories
    ];
  }, [siteData.categories]);

  const activeCategoryObj = useMemo(() => {
    return allCategoryPills.find((c) => c.id === activeCategory);
  }, [allCategoryPills, activeCategory]);

  // Cálculos de links de contato
  const phoneDigits = useMemo(() => onlyDigits(siteData.phone), [siteData.phone]);
  const whatsDigits = useMemo(() => {
    const digits = onlyDigits(siteData.whatsapp);
    return digits.startsWith('55') ? digits : `55${digits}`;
  }, [siteData.whatsapp]);
  const mapsSearchUrl = useMemo(
    () => `https://maps.google.com/?q=${encodeURIComponent(siteData.address.replace(/\n/g, ', '))}`,
    [siteData.address]
  );

  // Logo da marca garantida
  const rawLogo = siteData.logoDataUrl || EXACT_LOGO_PATH;
  const logoImageSrc = rawLogo.startsWith('data:') || rawLogo.startsWith('http')
    ? rawLogo
    : (rawLogo.startsWith('/') && !rawLogo.startsWith(CLEAN_BASE)
      ? `${CLEAN_BASE}${rawLogo.replace(/^\/+/, '')}`
      : rawLogo);

  // Visualização Admin
  const isAdminView = currentRoute === '#/admin' || currentRoute === '#admin';

  // Se o usuário está na rota secreta #/admin
  if (isAdminView) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
        {/* Topo do Painel Admin */}
        <header className="bg-brand-strict text-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">FaberMinas</span>
              <span className="text-white/40">|</span>
              <span className="text-sm text-white/90">Painel de Edição (#/admin)</span>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#/';
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-brand-strict font-semibold text-sm hover:bg-white/90 transition cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Voltar para o Site</span>
              </button>
            </div>
          </div>
        </header>

        {/* Notificação Toast */}
        {adminToast && (
          <div className="fixed bottom-5 right-5 z-50 bg-brand-strict text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-sm font-medium animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            <span>{adminToast}</span>
          </div>
        )}

        {/* Tela de Login Simples */}
        {!isAdminAuthenticated ? (
          <div className="max-w-md mx-auto mt-16 px-4">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-brand-strict text-white flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Acesso ao Gerenciador</h1>
              <p className="text-sm text-slate-600 mb-6">Digite a senha para editar textos, produtos, fotos e contatos do site.</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPasswordInput.trim() === 'faber2026') {
                    setIsAdminAuthenticated(true);
                    setAdminLoginError(false);
                  } else {
                    setAdminLoginError(true);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="admin-pass" className="block text-sm font-medium text-slate-700 mb-1">
                    Senha de Acesso
                  </label>
                  <input
                    id="admin-pass"
                    type="password"
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="Digite a senha"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#004d61]"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Senha padrão inicial: <strong className="text-slate-700">faber2026</strong>
                  </p>
                </div>
                {adminLoginError && <p className="text-sm text-red-600 font-medium">Senha incorreta. Tente novamente.</p>}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-strict bg-brand-strict-hover text-white font-semibold text-sm transition cursor-pointer"
                >
                  Entrar no Painel
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Conteúdo do Painel Admin */
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Edição do Site FaberMinas</h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    As edições feitas aqui ficam salvas automaticamente neste navegador.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'faberminas-backup.json';
                      a.click();
                      URL.revokeObjectURL(url);
                      showToast('Backup JSON exportado!');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#004d61] text-brand-strict hover:bg-[#004d61]/5 font-semibold text-sm transition cursor-pointer"
                  >
                    <FileJson className="w-4 h-4" />
                    <span>Exportar Backup (.json)</span>
                  </button>

                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Importar Backup</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          try {
                            const imported = JSON.parse(reader.result as string);
                            if (imported && imported.products) {
                              saveUpdatedData({ ...DEFAULT_SITE_DATA, ...imported }, 'Backup importado com sucesso!');
                            }
                          } catch {
                            showToast('Arquivo de backup inválido.');
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Deseja realmente restaurar os dados originais?')) {
                        localStorage.removeItem(STORAGE_KEY);
                        setSiteData(DEFAULT_SITE_DATA);
                        showToast('Dados padrão restaurados.');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restaurar Padrão</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Abas */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => setAdminActiveTab('produtos')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer ${
                  adminActiveTab === 'produtos' ? 'bg-[#004d61] text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Produtos e Categorias
              </button>
              <button
                type="button"
                onClick={() => setAdminActiveTab('textos')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer ${
                  adminActiveTab === 'textos' ? 'bg-[#004d61] text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Textos da Página Inicial
              </button>
              <button
                type="button"
                onClick={() => setAdminActiveTab('contato')}
                className={`px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer ${
                  adminActiveTab === 'contato' ? 'bg-[#004d61] text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Endereço, Mapa e Contatos
              </button>
            </div>

            {/* ABA 1: PRODUTOS */}
            {adminActiveTab === 'produtos' && (
              <div className="space-y-6">
                {/* Form produto */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    {editingProductId ? 'Editando Produto' : 'Adicionar Novo Produto'}
                  </h3>
                  <form
                    ref={adminProductFormRef}
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const category = prodFormCategory || siteData.categories[0]?.id || 'higiene';
                      let finalImage = prodFormImageUrl;

                      if (editingProductId) {
                        const updated = siteData.products.map((p) =>
                          p.id === editingProductId
                            ? { ...p, name: prodFormName, category, spec: prodFormSpec, image: finalImage || p.image }
                            : p
                        );
                        saveUpdatedData({ ...siteData, products: updated }, 'Produto atualizado!');
                      } else {
                        const newProd: Product = {
                          id: Date.now(),
                          name: prodFormName,
                          category,
                          spec: prodFormSpec,
                          image: finalImage
                        };
                        saveUpdatedData({ ...siteData, products: [newProd, ...siteData.products] }, 'Produto adicionado!');
                      }

                      // Reset form
                      setEditingProductId(null);
                      setProdFormName('');
                      setProdFormCategory('');
                      setProdFormSpec('');
                      setProdFormImageUrl('');
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto *</label>
                      <input
                        type="text"
                        required
                        value={prodFormName}
                        onChange={(e) => setProdFormName(e.target.value)}
                        placeholder="Ex: Papel Toalha Interfolhado"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Categoria *</label>
                      <select
                        value={prodFormCategory || siteData.categories[0]?.id}
                        onChange={(e) => setProdFormCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#004d61]"
                      >
                        {siteData.categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Especificação / Embalagem *</label>
                      <input
                        type="text"
                        required
                        value={prodFormSpec}
                        onChange={(e) => setProdFormSpec(e.target.value)}
                        placeholder="Ex: Fardo com 1.000 folhas • Folha Dupla"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Foto do Produto (Arquivo do dispositivo)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const dataUrl = await compressImageToDataURL(f, 720, 0.82);
                            setProdFormImageUrl(dataUrl);
                          }
                        }}
                        className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#004d61]/10 file:text-[#004d61] hover:file:bg-[#004d61]/20 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Ou Link da Imagem (URL)</label>
                      <input
                        type="text"
                        value={prodFormImageUrl.startsWith('data:') ? '' : prodFormImageUrl}
                        onChange={(e) => setProdFormImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-semibold text-sm transition cursor-pointer"
                      >
                        {editingProductId ? 'Atualizar Produto' : 'Salvar Produto'}
                      </button>
                      {editingProductId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(null);
                            setProdFormName('');
                            setProdFormCategory('');
                            setProdFormSpec('');
                            setProdFormImageUrl('');
                          }}
                          className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium cursor-pointer"
                        >
                          Cancelar Edição
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Lista de Produtos */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Produtos Cadastrados ({siteData.products.length})
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {siteData.products.map((p) => {
                      const cat = siteData.categories.find((c) => c.id === p.category);
                      return (
                        <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-[#004d61]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 text-sm truncate">{p.name}</p>
                              <p className="text-xs text-slate-500 truncate">
                                {cat ? cat.label : p.category} • {p.spec}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProductId(p.id);
                                setProdFormName(p.name);
                                setProdFormCategory(p.category);
                                setProdFormSpec(p.spec);
                                setProdFormImageUrl(p.image);
                                adminProductFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#004d61] text-xs font-semibold text-slate-700 cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = siteData.products.filter((item) => item.id !== p.id);
                                saveUpdatedData({ ...siteData, products: updated }, 'Produto removido.');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-600 cursor-pointer"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Categorias */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Categorias (Filtros do Catálogo)</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const label = newCatName.trim();
                      const desc = newCatDesc.trim();
                      if (!label) return;
                      const id = label
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-');
                      if (!siteData.categories.some((c) => c.id === id)) {
                        const updated = [...siteData.categories, { id, label, icon: 'tag', desc }];
                        saveUpdatedData({ ...siteData, categories: updated }, 'Categoria adicionada!');
                        setNewCatName('');
                        setNewCatDesc('');
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-3 mb-4"
                  >
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Nome da nova categoria (ex: Embalagens)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                    />
                    <input
                      type="text"
                      required
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Subtítulo curto (ex: Caixas e fitas)"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#004d61] text-white font-semibold text-sm cursor-pointer"
                    >
                      Adicionar Categoria
                    </button>
                  </form>
                  <div className="flex flex-wrap gap-2">
                    {siteData.categories.map((c) => (
                      <div key={c.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-sm text-slate-800">
                        <span className="font-semibold">{c.label}</span>
                        <span className="text-xs text-slate-500">({c.desc})</span>
                        {siteData.categories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = siteData.categories.filter((cat) => cat.id !== c.id);
                              saveUpdatedData({ ...siteData, categories: updated }, 'Categoria removida.');
                            }}
                            className="text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer"
                            title="Remover categoria"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: TEXTOS DA PÁGINA INICIAL */}
            {adminActiveTab === 'textos' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Imagem da Logo (PNG Transparente / JPG)</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    A imagem oficial enviada está aplicada no cabeçalho e rodapé.
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="bg-[#004d61] p-4 rounded-xl flex items-center justify-center min-w-[200px] h-20">
                      <img src={logoImageSrc} alt="Prévia da Logo" className="max-h-12 w-auto object-contain" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const dataUrl = await compressImageToDataURL(f, 800, 0.92);
                            saveUpdatedData({ ...siteData, logoDataUrl: dataUrl }, 'Logo atualizada!');
                          }
                        }}
                        className="block w-full text-sm text-slate-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#004d61] file:text-white hover:file:bg-[#003a49] cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          saveUpdatedData({ ...siteData, logoDataUrl: EXACT_LOGO_PATH }, 'Logo padrão restaurada!');
                        }}
                        className="text-xs text-slate-500 hover:text-red-600 underline cursor-pointer"
                      >
                        Restaurar logo padrão exata
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Textos de Introdução</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveUpdatedData(siteData, 'Textos da página inicial atualizados!');
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Título Principal</label>
                      <input
                        type="text"
                        required
                        value={siteData.heroTitle}
                        onChange={(e) => setSiteData({ ...siteData, heroTitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Texto de Descrição</label>
                      <textarea
                        rows={3}
                        required
                        value={siteData.heroSubtitle}
                        onChange={(e) => setSiteData({ ...siteData, heroSubtitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Texto do Botão Principal</label>
                      <input
                        type="text"
                        required
                        value={siteData.heroCta}
                        onChange={(e) => setSiteData({ ...siteData, heroCta: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Imagem de Fundo do Início (URL da foto)
                      </label>
                      <input
                        type="text"
                        value={siteData.heroBgUrl}
                        onChange={(e) => setSiteData({ ...siteData, heroBgUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-semibold text-sm cursor-pointer"
                    >
                      Salvar Textos
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ABA 3: ENDEREÇO, MAPA E CONTATOS */}
            {adminActiveTab === 'contato' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Dados da Empresa e Atendimento</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveUpdatedData(siteData, 'Dados de contato e empresa atualizados!');
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone Fixo</label>
                    <input
                      type="text"
                      required
                      value={siteData.phone}
                      onChange={(e) => setSiteData({ ...siteData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={siteData.whatsapp}
                      onChange={(e) => setSiteData({ ...siteData, whatsapp: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail de Contato</label>
                    <input
                      type="email"
                      required
                      value={siteData.email}
                      onChange={(e) => setSiteData({ ...siteData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Link do Instagram</label>
                    <input
                      type="url"
                      value={siteData.instagram}
                      onChange={(e) => setSiteData({ ...siteData, instagram: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Horário de Funcionamento</label>
                    <input
                      type="text"
                      required
                      value={siteData.hours}
                      onChange={(e) => setSiteData({ ...siteData, hours: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                    <textarea
                      rows={2}
                      required
                      value={siteData.address}
                      onChange={(e) => setSiteData({ ...siteData, address: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Link Embed do Google Maps (URL iframe)</label>
                    <input
                      type="text"
                      required
                      value={siteData.mapsEmbed}
                      onChange={(e) => setSiteData({ ...siteData, mapsEmbed: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social</label>
                    <input
                      type="text"
                      required
                      value={siteData.legalName}
                      onChange={(e) => setSiteData({ ...siteData, legalName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ Oficial</label>
                    <input
                      type="text"
                      required
                      value={siteData.cnpj}
                      onChange={(e) => setSiteData({ ...siteData, cnpj: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Diferenciais Operacionais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {siteData.differentials.map((d, idx) => (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                          <input
                            type="text"
                            value={d.title}
                            onChange={(e) => {
                              const updated = [...siteData.differentials];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setSiteData({ ...siteData, differentials: updated });
                            }}
                            placeholder="Título"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold"
                          />
                          <input
                            type="text"
                            value={d.desc}
                            onChange={(e) => {
                              const updated = [...siteData.differentials];
                              updated[idx] = { ...updated[idx], desc: e.target.value };
                              setSiteData({ ...siteData, differentials: updated });
                            }}
                            placeholder="Descrição"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-semibold text-sm cursor-pointer"
                    >
                      Salvar Dados de Contato e Empresa
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // =====================================================================
  // VISÃO 1: SITE PÚBLICO
  // =====================================================================
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#004d61] selection:text-white">
      {/* 1. CABEÇALHO (#004d61 padronizado) */}
      <header className="sticky top-0 z-40 bg-[#004d61]/95 backdrop-blur-md text-white shadow-md border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-24">
            {/* Logo com a EXATA imagem enviada */}
            <a href="#inicio" className="logo-anim focus:outline-none py-2" aria-label="FaberMinas Início">
              <img
                src={logoImageSrc}
                alt="FaberMinas"
                className="h-11 sm:h-14 w-auto object-contain transition-transform duration-200"
              />
            </a>

            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center space-x-8" aria-label="Navegação principal">
              <a
                href="#inicio"
                className="nav-link-anim text-white/90 hover:text-white font-medium text-base py-2 transition-colors cursor-pointer"
              >
                Início
              </a>
              <a
                href="#produtos"
                className="nav-link-anim text-white/90 hover:text-white font-medium text-base py-2 transition-colors cursor-pointer"
              >
                Produtos
              </a>
              <a
                href="#localizacao"
                className="nav-link-anim text-white/90 hover:text-white font-medium text-base py-2 transition-colors cursor-pointer"
              >
                Localização
              </a>
              <a
                href="#contato"
                className="nav-link-anim text-white/90 hover:text-white font-medium text-base py-2 transition-colors cursor-pointer"
              >
                Contato
              </a>
              <button
                type="button"
                onClick={() => setQuoteDrawerOpen(true)}
                className="btn-anim inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-medium cursor-pointer shadow-2xs"
                aria-label="Abrir cesta de cotação"
              >
                <ClipboardList className="w-4 h-4 icon-pop" />
                <span>Cotação</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-white text-brand-strict transition-transform duration-200">
                  {totalQuoteCount}
                </span>
              </button>
            </nav>

            {/* Botões Mobile (Cotação + Menu) */}
            <div className="md:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuoteDrawerOpen(true)}
                className="btn-anim inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/15 text-white text-xs font-semibold cursor-pointer"
                aria-label="Abrir cesta de cotação"
              >
                <ClipboardList className="w-4 h-4" />
                <span>{totalQuoteCount}</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-lg text-white hover:bg-[#003a49] focus:outline-none transition cursor-pointer"
                aria-label="Abrir menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#003a49] border-t border-white/15 animate-fade-in shadow-xl">
            <div className="px-4 pt-3 pb-5 space-y-1">
              <a
                href="#inicio"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-[#004d61] transition"
              >
                Início
              </a>
              <a
                href="#produtos"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-[#004d61] transition"
              >
                Produtos
              </a>
              <a
                href="#localizacao"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-[#004d61] transition"
              >
                Localização
              </a>
              <a
                href="#contato"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-[#004d61] transition"
              >
                Contato
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* 2. SEÇÃO INÍCIO */}
        <section id="inicio" className="relative overflow-hidden bg-[#002029] pt-20 pb-24 sm:pt-28 sm:pb-32 border-b border-white/15">
          <img
            src={siteData.heroBgUrl || 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80'}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 pointer-events-none scale-102 transition-transform duration-1000"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80') {
                target.src = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80';
              }
            }}
          />
          {/* Camada em tons de petróleo (#004d61) com iluminação radial volumétrica */}
          <div className="absolute inset-0 hero-glow-overlay pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              {/* Linha de destaque superior minimalista */}
              <div className="w-16 h-1.5 rounded-full bg-white mx-auto mb-8 shadow-xs" />

              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-white tracking-tight leading-[1.15] mb-6 drop-shadow-sm">
                {siteData.heroTitle}
              </h1>

              <p className="text-lg sm:text-xl text-white/90 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
                {siteData.heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#produtos"
                  className="btn-anim w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-brand-strict font-bold text-base sm:text-lg shadow-xl cursor-pointer"
                >
                  <span>{siteData.heroCta}</span>
                  <ArrowDown className="w-5 h-5 icon-down" />
                </a>
                <a
                  href="#contato"
                  className="btn-anim w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#004d61]/80 hover:bg-[#004d61] text-white border-2 border-white font-semibold text-base sm:text-lg backdrop-blur-xs cursor-pointer shadow-md"
                >
                  <span>Entrar em contato</span>
                  <ArrowRight className="w-5 h-5 icon-right" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAIXA DE DIFERENCIAIS OPERACIONAIS EM AZUL #004d61 (Transição Suave) */}
        <section aria-label="Diferenciais operacionais" className="relative overflow-hidden bg-gradient-to-b from-[#003d4d] via-[#004d61] to-[#004759] py-12 sm:py-16 border-t border-white/10">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {siteData.differentials.map((item, idx) => (
                <div
                  key={idx}
                  className="card-interactive flex items-start gap-3.5 p-5 rounded-2xl bg-white border border-white/20 shadow-md cursor-default group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-strict text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs">
                    {renderLucideIcon(item.icon, 'w-5 h-5')}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-brand-strict transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. SEÇÃO PRODUTOS (Transição Suave do azul para o claro) */}
        <section id="produtos" className="relative bg-gradient-to-b from-[#eef5f7] via-[#F8FAFC] to-[#F1F6F8] py-16 sm:py-24">
          {/* Brilho suave superior que amortece o corte do azul */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#004d61]/8 to-transparent pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center justify-center gap-2 mb-3">
                <span className="w-8 h-0.5 rounded-full bg-brand-strict" />
                <span className="w-2 h-2 rounded-full bg-brand-strict" />
                <span className="w-8 h-0.5 rounded-full bg-brand-strict" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                Venha conhecer nossos produtos
              </h2>
              <p className="text-slate-600 text-base">
                Filtre por linha de suprimentos ou pesquise pelo nome do material.
              </p>
            </div>

            {/* Barra de Filtros + Busca */}
            <div className="max-w-5xl mx-auto mb-10 space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Pílulas de Categoria */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2" role="group" aria-label="Categorias de produtos">
                  {allCategoryPills.map((cat) => {
                    const isSelected = activeCategory === cat.id;
                    const btnClass = isSelected
                      ? 'bg-brand-strict text-white border-brand-strict shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-brand-strict hover:text-brand-strict';

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setShowAllProducts(false);
                        }}
                        className={`btn-anim inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium cursor-pointer ${btnClass}`}
                      >
                        {renderLucideIcon(cat.icon, 'w-4 h-4 icon-pop')}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Campo de Busca */}
                <div className="relative w-full md:w-72 shrink-0 bg-white rounded-xl border border-slate-200 focus-within:border-brand-strict focus-within:ring-4 focus-within:ring-[#004d61]/15 transition-all">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar produto..."
                    className="w-full pl-10 pr-9 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-transform hover:scale-110"
                      aria-label="Limpar busca"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  {activeCategoryObj?.desc ? `${activeCategoryObj.label}: ${activeCategoryObj.desc}` : activeCategoryObj?.label}
                </span>
                <span className="font-medium text-slate-600">
                  {filteredProducts.length === 1
                    ? '1 produto'
                    : isLimited
                    ? `Mostrando ${visibleProducts.length} de ${filteredProducts.length} produtos`
                    : `${filteredProducts.length} produtos`}
                </span>
              </div>
            </div>

            {/* Grade de Produtos */}
            {filteredProducts.length > 0 ? (
              <>
                <div
                  ref={productsGridRef}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
                >
                  {visibleProducts.map((product, idx) => {
                    const catObj = siteData.categories.find((c) => c.id === product.category);
                    const catName = catObj ? catObj.label : product.category;
                    const inCart = quoteCart.find((item) => item.id === product.id);
                    const btnLabel = inCart ? `Na cotação (${inCart.qty}x)` : 'Cotar item';
                    const btnStyle = inCart
                      ? 'bg-[#003a49] text-white shadow-xs'
                      : 'bg-brand-strict bg-brand-strict-hover text-white';

                    return (
                      <article
                        key={`${activeCategory}-${product.id}`}
                        onClick={() => addToQuoteCart(product)}
                        style={{
                          animationDelay: isProductsInView ? `${(idx % 8) * 80}ms` : '0ms'
                        }}
                        className={`product-card bg-white rounded-2xl border border-slate-200/90 transition flex flex-col justify-between overflow-hidden shadow-2xs group cursor-pointer ${
                          isProductsInView ? 'animate-fade-in-up' : 'opacity-0 translate-y-7'
                        }`}
                      >
                        <div>
                          <div className="h-32 bg-white border-b border-slate-100 flex items-center justify-center relative overflow-hidden">
                            <span className="absolute top-2.5 left-2.5 text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-700 backdrop-blur-xs z-10">
                              {catName}
                            </span>
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain p-3"
                              />
                            ) : (
                              <div className="product-icon-wrap w-12 h-12 rounded-xl bg-slate-50 text-brand-strict flex items-center justify-center shadow-2xs">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug mb-1 group-hover:text-brand-strict transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">{product.spec}</p>
                          </div>
                        </div>
                        <div className="px-4 pb-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToQuoteCart(product);
                            }}
                            className={`btn-anim w-full py-2.5 px-3 rounded-xl ${btnStyle} font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer`}
                          >
                            {inCart ? <Check className="w-3.5 h-3.5 icon-pop" /> : <Plus className="w-3.5 h-3.5 icon-pop" />}
                            <span>{btnLabel}</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Botão Expandir / Recolher */}
                {activeCategory === 'todos' && !searchQuery.trim() && filteredProducts.length > INITIAL_LIMIT && (
                  <div className="mt-10 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllProducts(!showAllProducts)}
                      className="btn-anim inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-brand-strict border border-brand-strict font-semibold text-sm shadow-2xs cursor-pointer"
                    >
                      <span>{showAllProducts ? 'Mostrar menos' : `Ver todos os ${filteredProducts.length} produtos`}</span>
                      {showAllProducts ? (
                        <ChevronUp className="w-4 h-4 icon-down" />
                      ) : (
                        <ChevronDown className="w-4 h-4 icon-down" />
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Estado Vazio */
              <div className="text-center py-14 px-4 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum produto encontrado</h3>
                <p className="text-sm text-slate-600 mb-5">Tente buscar outro termo ou selecione a opção "Todos".</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('todos');
                    setSearchQuery('');
                    setShowAllProducts(false);
                  }}
                  className="btn-anim px-5 py-2.5 rounded-xl bg-brand-strict bg-brand-strict-hover text-white text-sm font-semibold cursor-pointer"
                >
                  Mostrar todos os produtos
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 4. SEÇÃO CONTATO (Transição Suave do Claro para o Azul) */}
        <section id="contato" className="relative overflow-hidden bg-gradient-to-b from-[#003d4d] via-[#004d61] to-[#004758] py-16 sm:py-24 border-t border-[#004d61]/20">
          {/* Sombra suave superior que amortece o corte com o fundo claro de produtos */}
          <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-black/15 to-transparent pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center justify-center gap-2 mb-3">
                <span className="w-8 h-0.5 rounded-full bg-white/80" />
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="w-8 h-0.5 rounded-full bg-white/80" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Entre em contato conosco</h2>
              <p className="text-white/85 text-base">
                Fale com nossa equipe por telefone, WhatsApp, e-mail ou envie sua mensagem abaixo.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 max-w-6xl mx-auto">
              {/* Canais Diretos */}
              <div className="lg:col-span-5 space-y-4">
                <a
                  href={`https://wa.me/${whatsDigits}?text=${encodeURIComponent('Olá! Gostaria de falar com a FaberMinas.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-interactive flex items-center justify-between p-5 bg-white rounded-2xl border border-white/20 shadow-md transition group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-brand-strict text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-strict">WhatsApp</span>
                      <p className="text-base font-medium text-slate-800 truncate mt-0.5 group-hover:text-brand-strict transition-colors">{siteData.whatsapp}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-brand-strict/50 group-hover:text-brand-strict group-hover:translate-x-1.5 transition-all shrink-0" />
                </a>

                <a
                  href={`tel:+55${phoneDigits}`}
                  className="card-interactive flex items-center justify-between p-5 bg-white rounded-2xl border border-white/20 shadow-md transition group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-brand-strict text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-strict">Telefone</span>
                      <p className="text-base font-medium text-slate-800 truncate mt-0.5 group-hover:text-brand-strict transition-colors">{siteData.phone}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-brand-strict/50 group-hover:text-brand-strict group-hover:translate-x-1.5 transition-all shrink-0" />
                </a>

                <a
                  href={`mailto:${siteData.email}`}
                  className="card-interactive flex items-center justify-between p-5 bg-white rounded-2xl border border-white/20 shadow-md transition group cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-brand-strict text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wider text-brand-strict">E-mail</span>
                      <p className="text-sm sm:text-base font-medium text-slate-800 truncate mt-0.5 group-hover:text-brand-strict transition-colors">{siteData.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-brand-strict/50 group-hover:text-brand-strict group-hover:translate-x-1.5 transition-all shrink-0" />
                </a>
              </div>

              {/* Formulário de Mensagem */}
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
                      <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Nome *
                      </label>
                      <input
                        type="text"
                        id="contact-name"
                        required
                        placeholder="Seu nome"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 text-slate-800 focus:bg-white focus:outline-none focus:border-[#004d61] focus:ring-4 focus:ring-[#004d61]/20 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
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
                    <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-1.5">
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
                    <label htmlFor="contact-msg" className="block text-sm font-medium text-slate-700 mb-1.5">
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
                      className="btn-anim w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-strict bg-brand-strict-hover text-white font-semibold text-base shadow-md cursor-pointer"
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
                      className="text-brand-strict underline hover:opacity-80 cursor-pointer font-medium"
                    >
                      Política de Privacidade
                    </button>
                    .
                  </p>

                  {contactFormSubmitted && (
                    <div className="p-4 rounded-xl bg-[#004d61]/10 border border-[#004d61]/30 text-brand-strict text-sm font-medium flex items-center gap-3 animate-fade-in shadow-xs">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>Mensagem recebida! Entraremos em contato em breve.</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SEÇÃO LOCALIZAÇÃO (Transição Suave da saída do Azul) */}
        <section id="localizacao" className="relative bg-gradient-to-b from-[#eef5f7] via-white to-[#F8FAFC] py-16 sm:py-24 border-t border-[#004d61]/15">
          {/* Brilho suave superior que amortece a transição do azul escuro para o claro */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#004d61]/8 to-transparent pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Endereço e Horário */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <div className="w-10 h-1 rounded-full bg-brand-strict mb-4" />
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Localização</h2>
                  <p className="text-slate-600 text-base leading-relaxed">
                    Confira nosso endereço completo e horário de atendimento para retiradas e visitas comerciais.
                  </p>
                </div>

                <div className="card-interactive space-y-4 bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-brand-strict text-white flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Endereço</h3>
                      <p className="text-slate-700 text-base mt-1 leading-snug whitespace-pre-line">{siteData.address}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/70 pt-4 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#004d61]/10 text-brand-strict flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Horário de Atendimento</h3>
                      <p className="text-slate-700 text-sm sm:text-base mt-1 whitespace-pre-line">{siteData.hours}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <a
                    href={mapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-anim inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-strict bg-brand-strict-hover text-white font-semibold text-sm sm:text-base shadow-sm cursor-pointer"
                  >
                    <Navigation className="w-4 h-4 icon-pop" />
                    <span>Abrir no Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Mapa Google Maps Embed */}
              <div className="lg:col-span-7">
                <div className="w-full h-[340px] sm:h-[420px] rounded-2xl overflow-hidden border-2 border-[#004d61]/15 shadow-sm bg-slate-100">
                  <iframe
                    title="Mapa FaberMinas"
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
      </main>

      {/* 6. RODAPÉ (Transição Suave para o fechamento) */}
      <footer className="relative overflow-hidden bg-gradient-to-b from-[#003d4d] via-[#004d61] to-[#003442] text-white pt-14 pb-8 border-t border-white/15">
        <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pb-10 border-b border-white/15">
            {/* Logo Exata + Endereço */}
            <div className="text-center md:text-left space-y-3.5">
              <a href="#inicio" className="logo-anim inline-block focus:outline-none" aria-label="FaberMinas">
                <img
                  src={logoImageSrc}
                  alt="FaberMinas"
                  className="h-11 sm:h-14 w-auto object-contain mx-auto md:mx-0"
                />
              </a>
              <p className="text-sm text-white/80 max-w-xs mx-auto md:mx-0 leading-relaxed whitespace-pre-line">
                {siteData.address}
              </p>
            </div>

            {/* Navegação */}
            <div className="flex flex-col items-center md:items-start md:-translate-x-8 lg:-translate-x-12 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Navegação
              </h3>
              <nav className="flex flex-col items-center md:items-start space-y-2 text-sm font-medium text-white/90" aria-label="Navegação do rodapé">
                <a href="#inicio" className="hover:text-white transition">Início</a>
                <a href="#produtos" className="hover:text-white transition">Produtos</a>
                <a href="#contato" className="hover:text-white transition">Contato</a>
                <a href="#localizacao" className="hover:text-white transition">Localização</a>
              </nav>
            </div>

            {/* Contatos */}
            <div className="flex flex-col items-center md:items-end space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Contatos
              </h3>
              <div className="flex items-center justify-center md:justify-end gap-3">
                <a
                  href={`tel:+55${phoneDigits}`}
                  title="Telefone"
                  aria-label="Telefone"
                  className="social-orb w-11 h-11 rounded-full bg-white text-brand-strict hover:bg-white/95 flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                </a>

                <a
                  href="#localizacao"
                  title="Localização"
                  aria-label="Localização"
                  className="social-orb w-11 h-11 rounded-full bg-white text-brand-strict hover:bg-white/95 flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <MapPin className="w-5 h-5" />
                </a>

                <a
                  href={`mailto:${siteData.email}`}
                  title="E-mail"
                  aria-label="E-mail"
                  className="social-orb w-11 h-11 rounded-full bg-white text-brand-strict hover:bg-white/95 flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <Mail className="w-5 h-5" />
                </a>

                <a
                  href={`https://wa.me/${whatsDigits}?text=${encodeURIComponent('Olá! Vim pelo site da FaberMinas.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                  className="social-orb w-11 h-11 rounded-full bg-white text-brand-strict hover:bg-white/95 flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>

                <a
                  href={siteData.instagram || 'https://instagram.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  aria-label="Instagram"
                  className="social-orb w-11 h-11 rounded-full bg-white text-brand-strict hover:bg-white/95 flex items-center justify-center shadow-xs cursor-pointer"
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

          {/* Dados Fiscais + Copyright + Política de Privacidade */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/80 text-center sm:text-left">
            <div className="space-y-1">
              <p className="text-xs text-white/75">{siteData.legalName} • CNPJ: {siteData.cnpj}</p>
              <p>© 2026 FaberMinas. Todos os direitos reservados.</p>
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
        href={`https://wa.me/${whatsDigits}?text=${encodeURIComponent('Olá! Gostaria de solicitar atendimento da FaberMinas.')}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar pelo WhatsApp"
        title="Falar no WhatsApp"
        className="whatsapp-float-anim fixed bottom-5 right-5 z-30 w-13 h-13 p-3.5 rounded-full bg-brand-strict bg-brand-strict-hover text-white border-2 border-white shadow-lg flex items-center justify-center cursor-pointer"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* GAVETA LATERAL: CESTA DE COTAÇÃO */}
      {quoteDrawerOpen && (
        <div
          onClick={() => setQuoteDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/50 transition-opacity animate-fade-in"
        />
      )}
      <aside
        aria-label="Cesta de Cotação"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 flex flex-col ${
          quoteDrawerOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="px-6 py-5 bg-brand-strict text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-5 h-5" />
            <h2 className="font-bold text-lg">Cesta de Cotação</h2>
          </div>
          <button
            type="button"
            onClick={() => setQuoteDrawerOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/15 text-white transition cursor-pointer"
            aria-label="Fechar cesta"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {quoteCart.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="w-6 h-6" />
              </div>
              <p className="font-semibold text-slate-800 text-base">Sua cesta de cotação está vazia</p>
              <p className="text-sm text-slate-500 mt-1">
                Clique em "Cotar item" nos produtos para montar sua lista de orçamento.
              </p>
            </div>
          ) : (
            quoteCart.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 text-sm leading-snug">{item.name}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{item.spec}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => changeQuoteQty(item.id, -1)}
                    className="w-7 h-7 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-sm font-bold text-slate-900">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => changeQuoteQty(item.id, 1)}
                    className="w-7 h-7 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromQuoteCart(item.id)}
                    className="ml-1 p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                    aria-label="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {quoteCart.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
            <button
              type="button"
              onClick={sendQuoteViaWhatsApp}
              className="btn-anim w-full py-3.5 px-4 rounded-xl bg-brand-strict bg-brand-strict-hover text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 icon-pop" />
              <span>Enviar Cotação no WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={fillContactWithQuote}
              className="btn-anim w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-brand-strict border border-brand-strict font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 icon-right" />
              <span>Preencher no Formulário de Contato</span>
            </button>
            <button
              type="button"
              onClick={clearQuoteCart}
              className="w-full text-xs text-slate-500 hover:text-red-600 py-1 cursor-pointer"
            >
              Limpar lista
            </button>
          </div>
        )}
      </aside>

      {/* MODAL: POLÍTICA DE PRIVACIDADE */}
      {privacyModalOpen && (
        <div
          onClick={() => setPrivacyModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200 border-t-4 border-t-[#004d61] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-brand-strict text-white flex items-center justify-center">
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
                A <strong className="text-slate-800">{siteData.legalName}</strong> (CNPJ: {siteData.cnpj}), com sede na {siteData.address.replace(/\n/g, ', ')}, respeita a privacidade e a proteção dos dados pessoais de seus clientes, parceiros e visitantes, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
              <p>
                <strong>1. Coleta e Finalidade:</strong> Os dados pessoais fornecidos voluntariamente por meio do formulário de contato, cesta de cotação ou atendimento via WhatsApp (como nome, empresa, telefone e e-mail) são utilizados exclusivamente para retorno comercial, elaboração de orçamentos, faturamento e atendimento ao cliente.
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
                className="px-6 py-2.5 rounded-xl bg-brand-strict bg-brand-strict-hover text-white text-sm font-semibold cursor-pointer"
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
