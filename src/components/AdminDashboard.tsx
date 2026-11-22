import React, { useState, useRef } from 'react';
import {
  Lock,
  Eye,
  Download,
  FileJson,
  Upload,
  RotateCcw,
  CheckCircle,
  Package,
  Search,
  Image as ImageIcon,
  Layers,
  Building2,
  HardDriveDownload,
  Trash2,
  Pencil,
  Check,
  ArrowUp,
  ArrowDown,
  Plus,
  GripVertical
} from 'lucide-react';
import { BannerSlot, Category, HeroSlide, Product, RoomZone, SiteData } from '../types';
import {
  DEFAULT_SITE_DATA,
  EXACT_LOGO_PATH,
  LEGACY_STORAGE_KEYS,
  STORAGE_KEY
} from '../data/defaultSiteData';
import {
  compressImageToDataURL,
  renderLucideIcon,
  resolveLogoSrc,
  slugifyId
} from '../utils/helpers';
import { downloadUpdatedSiteHtml } from '../utils/exportStandaloneHtml';

type AdminTab = 'produtos' | 'banners' | 'taxonomy' | 'institucional' | 'deploy';

interface AdminDashboardProps {
  siteData: SiteData;
  onUpdateSiteData: (nextData: SiteData, message?: string) => void;
  onRestoreDefaults: () => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  siteData,
  onUpdateSiteData,
  onRestoreDefaults,
  onExitAdmin
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('produtos');
  const [toast, setToast] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [exportingHtml, setExportingHtml] = useState(false);

  // Tab 1: Produtos & SKUs
  const [prodSearch, setProdSearch] = useState('');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormSku, setProdFormSku] = useState('');
  const [prodFormCategory, setProdFormCategory] = useState('');
  const [prodFormQtdMinima, setProdFormQtdMinima] = useState<number>(1);
  const [prodFormAbout, setProdFormAbout] = useState('');
  const [prodFormDescription, setProdFormDescription] = useState('');
  const [prodFormMeasures, setProdFormMeasures] = useState('');
  const [prodFormSpec, setProdFormSpec] = useState('');
  const [prodFormImageUrl, setProdFormImageUrl] = useState('');
  const [prodFormRooms, setProdFormRooms] = useState<string[]>([]);
  const [prodFormSegments, setProdFormSegments] = useState<string[]>([]);
  const prodFormRef = useRef<HTMLDivElement>(null);

  // Tab 3: Cômodos & Categorias
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatLabel, setEditCatLabel] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [draggedCatIdx, setDraggedCatIdx] = useState<number | null>(null);

  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomShort, setNewRoomShort] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomLabel, setEditRoomLabel] = useState('');
  const [editRoomShort, setEditRoomShort] = useState('');
  const [editRoomDesc, setEditRoomDesc] = useState('');

  const logoSrc = resolveLogoSrc(siteData.logoDataUrl);

  const showAdminToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 3200);
  };

  const commitData = (next: SiteData, msg: string) => {
    onUpdateSiteData({ ...next, updatedAt: Date.now() });
    showAdminToast(msg);
  };

  const resetProdForm = () => {
    setEditingProductId(null);
    setProdFormName('');
    setProdFormSku('');
    setProdFormCategory('');
    setProdFormQtdMinima(1);
    setProdFormAbout('');
    setProdFormDescription('');
    setProdFormMeasures('');
    setProdFormSpec('');
    setProdFormImageUrl('');
    setProdFormRooms([]);
    setProdFormSegments([]);
  };

  const toggleProdFormRoom = (roomId: string) => {
    setProdFormRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const toggleProdFormSegment = (segId: string) => {
    setProdFormSegments((prev) =>
      prev.includes(segId) ? prev.filter((id) => id !== segId) : [...prev, segId]
    );
  };

  const filteredAdminProducts = siteData.products.filter((p) => {
    const q = prodSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.measures || '').toLowerCase().includes(q) ||
      p.spec.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const handleDownloadHtml = async () => {
    setExportingHtml(true);
    try {
      await downloadUpdatedSiteHtml(siteData);
      showAdminToast('Arquivo index.html atualizado gerado e baixado!');
    } finally {
      setExportingHtml(false);
    }
  };

  const moveCarouselSlide = (index: number, direction: -1 | 1) => {
    const list = [...siteData.banners.carousel];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    commitData(
      {
        ...siteData,
        banners: { ...siteData.banners, carousel: list }
      },
      'Ordem do carrossel atualizada!'
    );
  };

  const addCarouselSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      enabled: true,
      title: 'Novo Destaque Faberminas',
      subtitle: 'Higiene, limpeza e suprimentos com entrega própria para CNPJ e CPF.',
      showButton: true,
      ctaLabel: 'Conferir produtos',
      ctaLink: '#/produtos',
      image: ''
    };
    commitData(
      {
        ...siteData,
        banners: {
          ...siteData.banners,
          carousel: [...siteData.banners.carousel, newSlide]
        }
      },
      'Novo slide adicionado ao carrossel!'
    );
  };

  const promoBanners = Array.isArray(siteData.banners.promotional)
    ? siteData.banners.promotional
    : [];

  const addPromoBanner = () => {
    const newBanner: BannerSlot = {
      id: `promo-${Date.now()}`,
      enabled: true,
      image: '',
      title: 'Campanha Promocional Faberminas',
      linkUrl: '#/produtos',
      showButton: false,
      ctaLabel: 'Ver ofertas'
    };
    commitData(
      {
        ...siteData,
        banners: {
          ...siteData.banners,
          promotional: [...promoBanners, newBanner]
        }
      },
      'Novo banner promocional adicionado!'
    );
  };

  const movePromoBanner = (index: number, direction: -1 | 1) => {
    const list = [...promoBanners];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    commitData(
      {
        ...siteData,
        banners: { ...siteData.banners, promotional: list }
      },
      'Ordem dos banners atualizada!'
    );
  };

  const moveCategory = (index: number, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= siteData.categories.length || index === targetIndex) return;
    const next = [...siteData.categories];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    commitData({ ...siteData, categories: next }, 'Ordem das categorias atualizada!');
  };

  const linkPresetOptions = [
    { label: 'Escolher atalho de destino...', value: '' },
    { label: 'Catálogo Completo (#/produtos)', value: '#/produtos' },
    { label: 'Seção Sobre Nós (#sobre)', value: '#sobre' },
    { label: 'Seção Compre por Ambiente (#ambientes)', value: '#ambientes' },
    { label: 'Seção Localização (#localizacao)', value: '#localizacao' },
    { label: 'Seção Contato (#contato)', value: '#contato' },
    ...siteData.categories.map((c) => ({
      label: `Categoria: ${c.label}`,
      value: `#/produtos?cat=${c.id}`
    }))
  ];

  const tabButton = (id: AdminTab, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer whitespace-nowrap ${
        activeTab === id
          ? 'bg-[#004d61] text-white shadow-sm'
          : 'bg-white text-slate-700 border border-slate-200 hover:border-[#004d61]/40 hover:text-[#004d61]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* Cabeçalho Admin */}
      <header className="bg-[#004d61] text-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={logoSrc} alt="Faberminas" className="h-9 w-auto object-contain shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/15 px-2.5 py-1 rounded-md truncate">
              Painel Administrativo
            </span>
          </div>
          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg transition cursor-pointer shrink-0"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Site Público</span>
          </button>
        </div>
      </header>

      {/* Toast flutuante */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#004d61] text-white px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2.5 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {!isAuthenticated ? (
        <div className="max-w-md mx-auto mt-16 sm:mt-24 px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#004d61] text-white flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h1>
            <p className="text-sm text-slate-500 mb-6">
              Digite a senha de administrador para gerenciar produtos, carrossel, banners, cômodos e gerar o site atualizado.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (passwordInput === 'faber2026') {
                  setIsAuthenticated(true);
                  setLoginError(false);
                } else {
                  setLoginError(true);
                }
              }}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#004d61] focus:ring-2 focus:ring-[#004d61]/20"
                />
              </div>
              {loginError && (
                <p className="text-xs text-red-600 font-semibold">Senha incorreta. Tente novamente.</p>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-semibold text-sm transition cursor-pointer"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Abas */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-200">
            {tabButton('produtos', 'Produtos & SKUs', <Package className="w-4 h-4" />)}
            {tabButton('banners', 'Carrossel & Banners', <ImageIcon className="w-4 h-4" />)}
            {tabButton('taxonomy', 'Cômodos & Categorias', <Layers className="w-4 h-4" />)}
            {tabButton('institucional', 'Institucional & Contatos', <Building2 className="w-4 h-4" />)}
            {tabButton('deploy', 'Persistência & Deploy', <HardDriveDownload className="w-4 h-4" />)}
          </div>

          {/* ================================================================= */}
          {/* ABA 1: PRODUTOS & SKUs                                            */}
          {/* ================================================================= */}
          {activeTab === 'produtos' && (
            <div className="space-y-6">
              <div ref={prodFormRef} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  {editingProductId ? 'Editando Produto' : 'Adicionar Novo Produto'}
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const category = prodFormCategory || siteData.categories[0]?.id || 'limpeza';
                    const safeMin = Math.max(1, Number(prodFormQtdMinima) || 1);

                    if (editingProductId) {
                      const updated = siteData.products.map((p) =>
                        p.id === editingProductId
                          ? {
                              ...p,
                              name: prodFormName.trim(),
                              sku: prodFormSku.trim() || undefined,
                              category,
                              qtdMinima: safeMin,
                              about: prodFormAbout.trim() || undefined,
                              description: prodFormDescription.trim() || undefined,
                              measures: prodFormMeasures.trim() || 'Padrão comercial',
                              rooms: prodFormRooms,
                              segments: prodFormSegments,
                              spec: prodFormSpec.trim(),
                              image: prodFormImageUrl
                            }
                          : p
                      );
                      commitData({ ...siteData, products: updated }, 'Produto atualizado!');
                    } else {
                      const newProd: Product = {
                        id: Date.now(),
                        sku: prodFormSku.trim() || undefined,
                        name: prodFormName.trim(),
                        category,
                        qtdMinima: safeMin,
                        about: prodFormAbout.trim() || undefined,
                        description: prodFormDescription.trim() || undefined,
                        measures: prodFormMeasures.trim() || 'Padrão comercial',
                        rooms: prodFormRooms,
                        segments: prodFormSegments,
                        spec: prodFormSpec.trim(),
                        image: prodFormImageUrl
                      };
                      commitData({ ...siteData, products: [newProd, ...siteData.products] }, 'Produto adicionado!');
                    }

                    resetProdForm();
                  }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4"
                >
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodFormName}
                      onChange={(e) => setProdFormName(e.target.value)}
                      placeholder="Ex: Rodo Base Alumínio 40cm - Halley"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Código (SKU)
                    </label>
                    <input
                      type="text"
                      value={prodFormSku}
                      onChange={(e) => setProdFormSku(e.target.value)}
                      placeholder="Ex: FM23"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#004d61]"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Categoria *
                    </label>
                    <select
                      value={prodFormCategory || siteData.categories[0]?.id || ''}
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Quantidade Mínima *
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={prodFormQtdMinima}
                      onChange={(e) =>
                        setProdFormQtdMinima(Math.max(1, parseInt(e.target.value || '1', 10) || 1))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-[#004d61] focus:outline-none focus:border-[#004d61]"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Medidas
                    </label>
                    <input
                      type="text"
                      value={prodFormMeasures}
                      onChange={(e) => setProdFormMeasures(e.target.value)}
                      placeholder="Ex: Base 40cm | Cabo 160cm"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                    />
                  </div>

                  <div className="md:col-span-8">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Especificações (composição, material, marca, embalagem) *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodFormSpec}
                      onChange={(e) => setProdFormSpec(e.target.value)}
                      placeholder="Ex: Base alumínio, 2 borrachas, cabo madeira revestido, marca Halley"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Sobre o produto
                    </label>
                    <textarea
                      rows={2}
                      value={prodFormAbout}
                      onChange={(e) => setProdFormAbout(e.target.value)}
                      placeholder="Resumo rápido de aplicação e benefícios no dia a dia..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      rows={2}
                      value={prodFormDescription}
                      onChange={(e) => setProdFormDescription(e.target.value)}
                      placeholder="Descrição comercial e detalhada exibida no modal do produto..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                    />
                  </div>

                  {/* Multi-select de Cômodos */}
                  <div className="md:col-span-12">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cômodos / Ambientes Vinculados (Planta Interativa)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {siteData.rooms.map((room) => {
                        const checked = prodFormRooms.includes(room.id);
                        return (
                          <label
                            key={room.id}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium cursor-pointer transition ${
                              checked
                                ? 'bg-[#eef5f7] border-[#004d61] text-[#004d61]'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleProdFormRoom(room.id)}
                              className="w-4 h-4 accent-[#004d61] rounded cursor-pointer"
                            />
                            {renderLucideIcon(room.icon, 'w-4 h-4 shrink-0')}
                            <span className="truncate">{room.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multi-select de Segmentos */}
                  <div className="md:col-span-12">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Segmentos Atendidos (CNPJ &amp; CPF)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                      {siteData.segments.map((seg) => {
                        const checked = prodFormSegments.includes(seg.id);
                        return (
                          <label
                            key={seg.id}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition ${
                              checked
                                ? 'bg-[#eef5f7] border-[#004d61] text-[#004d61]'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleProdFormSegment(seg.id)}
                              className="w-4 h-4 accent-[#004d61] rounded cursor-pointer"
                            />
                            <span className="truncate">{seg.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upload de Foto */}
                  <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Foto do Produto (Arquivo — comprimido automaticamente)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const dataUrl = await compressImageToDataURL(f, 720, 0.82);
                          setProdFormImageUrl(dataUrl);
                        }
                        e.target.value = '';
                      }}
                      className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#004d61]/10 file:text-[#004d61] hover:file:bg-[#004d61]/20 cursor-pointer"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ou Link da Imagem (URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={prodFormImageUrl.startsWith('data:') ? '' : prodFormImageUrl}
                        onChange={(e) => setProdFormImageUrl(e.target.value)}
                        placeholder={
                          prodFormImageUrl.startsWith('data:')
                            ? 'Imagem enviada em Base64'
                            : 'https://...'
                        }
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                      />
                      {prodFormImageUrl && (
                        <button
                          type="button"
                          onClick={() => setProdFormImageUrl('')}
                          className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          Remover Foto
                        </button>
                      )}
                    </div>
                  </div>

                  {prodFormImageUrl && (
                    <div className="md:col-span-12 flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-slate-200">
                      <img
                        src={prodFormImageUrl}
                        alt="Prévia do produto"
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                      />
                      <span className="text-xs text-slate-600">
                        Prévia da imagem pronta para ser embutida no site.
                      </span>
                    </div>
                  )}

                  <div className="md:col-span-12 flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-semibold text-sm transition cursor-pointer"
                    >
                      {editingProductId ? 'Atualizar Produto' : 'Salvar Produto'}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={resetProdForm}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium cursor-pointer"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Lista Pesquisável de Produtos */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-900">
                    Produtos Cadastrados ({siteData.products.length})
                  </h2>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={prodSearch}
                      onChange={(e) => setProdSearch(e.target.value)}
                      placeholder="Filtrar produtos ou SKU..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                    />
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredAdminProducts.map((p) => {
                    const cat = siteData.categories.find((c) => c.id === p.category);
                    const roomText = (p.rooms || [])
                      .map((rId) => siteData.rooms.find((r) => r.id === rId)?.shortLabel)
                      .filter(Boolean)
                      .join(', ');

                    return (
                      <div
                        key={p.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-[#004d61]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900 text-sm truncate">{p.name}</p>
                              {p.sku && (
                                <span className="text-[11px] font-mono text-[#004d61] bg-[#eef5f7] px-1.5 py-0.5 rounded shrink-0">
                                  {p.sku}
                                </span>
                              )}
                              {p.qtdMinima > 1 && (
                                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                                  Mín: {p.qtdMinima}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">
                              {cat ? cat.label : p.category}
                              {p.measures ? ` · ${p.measures}` : ''}
                              {roomText ? ` · Ambientes: ${roomText}` : ''} · {p.spec}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProductId(p.id);
                              setProdFormName(p.name);
                              setProdFormSku(p.sku || '');
                              setProdFormCategory(p.category);
                              setProdFormQtdMinima(Math.max(1, Number(p.qtdMinima) || 1));
                              setProdFormAbout(p.about || '');
                              setProdFormDescription(p.description || '');
                              setProdFormMeasures(p.measures || '');
                              setProdFormSpec(p.spec);
                              setProdFormImageUrl(p.image || '');
                              setProdFormRooms(Array.isArray(p.rooms) ? p.rooms : []);
                              setProdFormSegments(Array.isArray(p.segments) ? p.segments : []);
                              prodFormRef.current?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#004d61] text-xs font-semibold text-slate-700 cursor-pointer"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = siteData.products.filter((item) => item.id !== p.id);
                              commitData({ ...siteData, products: updated }, 'Produto removido.');
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
            </div>
          )}

          {/* ================================================================= */}
          {/* ABA 2: CARROSSEL & BANNERS                                        */}
          {/* ================================================================= */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="bg-[#eef5f7] border border-[#004d61]/20 rounded-2xl p-5 text-sm text-[#004d61]">
                <strong>Persistência Multi-Dispositivo:</strong> Envie imagens (comprimidas automaticamente em Base64), adicione múltiplos banners, configure links internos ou externos e controle se o botão aparece sobre a imagem (&ldquo;Mostrar botão no banner&rdquo;). Ao baixar o arquivo <strong>index.html</strong> na aba &ldquo;Persistência &amp; Deploy&rdquo;, tudo fica salvo para qualquer dispositivo.
              </div>

              {/* Gerenciador do Carrossel Hero */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Carrossel Principal da Capa ({siteData.banners.carousel.length} slides)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Se &ldquo;Mostrar botão no banner&rdquo; estiver desligado, a imagem inteira vira um link clicável sem botão por cima.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addCarouselSlide}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white text-sm font-semibold cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Slide</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {siteData.banners.carousel.map((slide, idx) => {
                    const showBtn = slide.showButton !== false;
                    return (
                      <div
                        key={slide.id}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="px-2.5 py-1 rounded-lg bg-[#004d61] text-white text-xs font-bold tabular-nums">
                              Slide {idx + 1}
                            </span>
                            <label className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={slide.enabled}
                                onChange={(e) => {
                                  const next = siteData.banners.carousel.map((s) =>
                                    s.id === slide.id ? { ...s, enabled: e.target.checked } : s
                                  );
                                  commitData(
                                    { ...siteData, banners: { ...siteData.banners, carousel: next } },
                                    e.target.checked ? 'Slide ativado!' : 'Slide ocultado!'
                                  );
                                }}
                                className="w-4 h-4 accent-[#004d61] cursor-pointer"
                              />
                              <span>Ativo</span>
                            </label>

                            <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#004d61] bg-white border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={showBtn}
                                onChange={(e) => {
                                  const next = siteData.banners.carousel.map((s) =>
                                    s.id === slide.id ? { ...s, showButton: e.target.checked } : s
                                  );
                                  commitData(
                                    { ...siteData, banners: { ...siteData.banners, carousel: next } },
                                    e.target.checked
                                      ? 'Botão visível no banner!'
                                      : 'Botão ocultado (imagem clicável)!'
                                  );
                                }}
                                className="w-4 h-4 accent-[#004d61] cursor-pointer"
                              />
                              <span>Mostrar botão no banner: {showBtn ? 'Sim' : 'Não'}</span>
                            </label>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveCarouselSlide(idx, -1)}
                              className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 cursor-pointer"
                              title="Mover para cima"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === siteData.banners.carousel.length - 1}
                              onClick={() => moveCarouselSlide(idx, 1)}
                              className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 cursor-pointer"
                              title="Mover para baixo"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            {siteData.banners.carousel.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = siteData.banners.carousel.filter(
                                    (s) => s.id !== slide.id
                                  );
                                  commitData(
                                    { ...siteData, banners: { ...siteData.banners, carousel: next } },
                                    'Slide removido!'
                                  );
                                }}
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remover</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {slide.image && (
                          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white">
                            <img
                              src={slide.image}
                              alt={slide.title || `Slide ${idx + 1}`}
                              className="w-full max-h-48 object-cover"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Imagem do Slide (Opcional — arquivo Base64)
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (f) {
                                    const dataUrl = await compressImageToDataURL(f, 1600, 0.85);
                                    const next = siteData.banners.carousel.map((s) =>
                                      s.id === slide.id ? { ...s, image: dataUrl, enabled: true } : s
                                    );
                                    commitData(
                                      { ...siteData, banners: { ...siteData.banners, carousel: next } },
                                      'Imagem do slide atualizada!'
                                    );
                                  }
                                  e.target.value = '';
                                }}
                                className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#004d61] file:text-white cursor-pointer"
                              />
                              {slide.image && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = siteData.banners.carousel.map((s) =>
                                      s.id === slide.id ? { ...s, image: '' } : s
                                    );
                                    commitData(
                                      { ...siteData, banners: { ...siteData.banners, carousel: next } },
                                      'Imagem removida do slide.'
                                    );
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold shrink-0 cursor-pointer"
                                >
                                  Limpar Foto
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Link de Destino (URL externa, #seção ou categoria)
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={slide.ctaLink}
                                onChange={(e) => {
                                  const next = siteData.banners.carousel.map((s) =>
                                    s.id === slide.id ? { ...s, ctaLink: e.target.value } : s
                                  );
                                  onUpdateSiteData({
                                    ...siteData,
                                    banners: { ...siteData.banners, carousel: next }
                                  });
                                }}
                                placeholder="#/produtos, #ambientes ou https://..."
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                              />
                              <select
                                value=""
                                onChange={(e) => {
                                  if (!e.target.value) return;
                                  const next = siteData.banners.carousel.map((s) =>
                                    s.id === slide.id ? { ...s, ctaLink: e.target.value } : s
                                  );
                                  onUpdateSiteData({
                                    ...siteData,
                                    banners: { ...siteData.banners, carousel: next }
                                  });
                                }}
                                className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 cursor-pointer"
                              >
                                {linkPresetOptions.map((opt) => (
                                  <option key={opt.label} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Título do Slide (deixe vazio se a imagem já contiver texto)
                            </label>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => {
                                const next = siteData.banners.carousel.map((s) =>
                                  s.id === slide.id ? { ...s, title: e.target.value } : s
                                );
                                onUpdateSiteData({
                                  ...siteData,
                                  banners: { ...siteData.banners, carousel: next }
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Texto do Botão (quando ativo)
                            </label>
                            <input
                              type="text"
                              disabled={!showBtn}
                              value={slide.ctaLabel}
                              onChange={(e) => {
                                const next = siteData.banners.carousel.map((s) =>
                                  s.id === slide.id ? { ...s, ctaLabel: e.target.value } : s
                                );
                                onUpdateSiteData({
                                  ...siteData,
                                  banners: { ...siteData.banners, carousel: next }
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm disabled:opacity-50"
                            />
                          </div>

                          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex-1 w-full">
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Subtítulo / Descrição
                              </label>
                              <input
                                type="text"
                                value={slide.subtitle}
                                onChange={(e) => {
                                  const next = siteData.banners.carousel.map((s) =>
                                    s.id === slide.id ? { ...s, subtitle: e.target.value } : s
                                  );
                                  onUpdateSiteData({
                                    ...siteData,
                                    banners: { ...siteData.banners, carousel: next }
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => commitData(siteData, 'Slide do carrossel salvo!')}
                              className="px-4 py-2 rounded-xl bg-[#004d61] text-white text-sm font-semibold shrink-0 cursor-pointer"
                            >
                              Salvar Slide
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Banners Promocionais Múltiplos da Home */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Banners Promocionais da Página Inicial ({promoBanners.length})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Adicione quantos banners desejar. Se &ldquo;Mostrar botão no banner&rdquo; estiver desligado, a imagem inteira funciona como link direto.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addPromoBanner}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white text-sm font-semibold cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Banner Promocional</span>
                  </button>
                </div>

                {promoBanners.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-[#F8FAFC] p-6 text-center text-sm text-slate-500">
                    Nenhum banner promocional secundário cadastrado. Clique em &ldquo;Adicionar Banner Promocional&rdquo; para criar um.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {promoBanners.map((slot, idx) => {
                      const showBtn = Boolean(slot.showButton);
                      const bannerKey = slot.id || `promo-${idx}`;
                      return (
                        <div
                          key={bannerKey}
                          className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#F8FAFC] space-y-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="px-2.5 py-1 rounded-lg bg-[#004d61] text-white text-xs font-bold tabular-nums">
                                Banner {idx + 1}
                              </span>
                              <label className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={slot.enabled}
                                  onChange={(e) => {
                                    const next = promoBanners.map((b, i) =>
                                      i === idx ? { ...b, enabled: e.target.checked } : b
                                    );
                                    commitData(
                                      {
                                        ...siteData,
                                        banners: { ...siteData.banners, promotional: next }
                                      },
                                      e.target.checked ? 'Banner ativado!' : 'Banner ocultado!'
                                    );
                                  }}
                                  className="w-4 h-4 accent-[#004d61] cursor-pointer"
                                />
                                <span>Exibir no site</span>
                              </label>

                              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#004d61] bg-white border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={showBtn}
                                  onChange={(e) => {
                                    const next = promoBanners.map((b, i) =>
                                      i === idx ? { ...b, showButton: e.target.checked } : b
                                    );
                                    commitData(
                                      {
                                        ...siteData,
                                        banners: { ...siteData.banners, promotional: next }
                                      },
                                      e.target.checked
                                        ? 'Botão ativado no banner!'
                                        : 'Imagem inteira clicável (sem botão)!'
                                    );
                                  }}
                                  className="w-4 h-4 accent-[#004d61] cursor-pointer"
                                />
                                <span>Mostrar botão no banner: {showBtn ? 'Sim' : 'Não'}</span>
                              </label>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => movePromoBanner(idx, -1)}
                                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 cursor-pointer"
                                title="Mover para cima"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === promoBanners.length - 1}
                                onClick={() => movePromoBanner(idx, 1)}
                                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700 disabled:opacity-40 cursor-pointer"
                                title="Mover para baixo"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = promoBanners.filter((_, i) => i !== idx);
                                  commitData(
                                    {
                                      ...siteData,
                                      banners: { ...siteData.banners, promotional: next }
                                    },
                                    'Banner removido!'
                                  );
                                }}
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remover</span>
                              </button>
                            </div>
                          </div>

                          {slot.image ? (
                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                              <img
                                src={slot.image}
                                alt={slot.title || `Banner ${idx + 1}`}
                                className="w-full max-h-52 object-cover"
                              />
                            </div>
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
                              Envie uma imagem abaixo para ativar este banner.
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Enviar ou Substituir Imagem
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (f) {
                                    const dataUrl = await compressImageToDataURL(f, 1400, 0.85);
                                    const next = promoBanners.map((b, i) =>
                                      i === idx ? { ...b, image: dataUrl, enabled: true } : b
                                    );
                                    commitData(
                                      {
                                        ...siteData,
                                        banners: { ...siteData.banners, promotional: next }
                                      },
                                      'Imagem do banner atualizada!'
                                    );
                                  }
                                  e.target.value = '';
                                }}
                                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#004d61] file:text-white cursor-pointer"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Título / Texto Alternativo
                              </label>
                              <input
                                type="text"
                                value={slot.title}
                                onChange={(e) => {
                                  const next = promoBanners.map((b, i) =>
                                    i === idx ? { ...b, title: e.target.value } : b
                                  );
                                  onUpdateSiteData({
                                    ...siteData,
                                    banners: { ...siteData.banners, promotional: next }
                                  });
                                }}
                                placeholder="Ex: Condições especiais para condomínios"
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Link de Destino (URL, #seção ou categoria)
                              </label>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  value={slot.linkUrl}
                                  onChange={(e) => {
                                    const next = promoBanners.map((b, i) =>
                                      i === idx ? { ...b, linkUrl: e.target.value } : b
                                    );
                                    onUpdateSiteData({
                                      ...siteData,
                                      banners: { ...siteData.banners, promotional: next }
                                    });
                                  }}
                                  placeholder="#/produtos?cat=limpeza ou #contato"
                                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm"
                                />
                                <select
                                  value=""
                                  onChange={(e) => {
                                    if (!e.target.value) return;
                                    const next = promoBanners.map((b, i) =>
                                      i === idx ? { ...b, linkUrl: e.target.value } : b
                                    );
                                    onUpdateSiteData({
                                      ...siteData,
                                      banners: { ...siteData.banners, promotional: next }
                                    });
                                  }}
                                  className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 cursor-pointer"
                                >
                                  {linkPresetOptions.map((opt) => (
                                    <option key={opt.label} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="flex items-end gap-2">
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                  Texto do Botão (quando ativo)
                                </label>
                                <input
                                  type="text"
                                  disabled={!showBtn}
                                  value={slot.ctaLabel || ''}
                                  onChange={(e) => {
                                    const next = promoBanners.map((b, i) =>
                                      i === idx ? { ...b, ctaLabel: e.target.value } : b
                                    );
                                    onUpdateSiteData({
                                      ...siteData,
                                      banners: { ...siteData.banners, promotional: next }
                                    });
                                  }}
                                  placeholder="Ver ofertas"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm disabled:opacity-50"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => commitData(siteData, 'Banner salvo!')}
                                className="px-4 py-2 rounded-xl bg-[#004d61] text-white text-sm font-semibold shrink-0 cursor-pointer"
                              >
                                Salvar
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Banner Superior do Catálogo (#/produtos) */}
              {(() => {
                const slot = siteData.banners.catalog;
                const showBtn = Boolean(slot.showButton);
                return (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Banner Superior do Catálogo (#/produtos)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Exibido no topo da página de produtos quando ativado com imagem.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={slot.enabled}
                            onChange={(e) =>
                              commitData(
                                {
                                  ...siteData,
                                  banners: {
                                    ...siteData.banners,
                                    catalog: { ...slot, enabled: e.target.checked }
                                  }
                                },
                                e.target.checked ? 'Banner ativado!' : 'Banner ocultado!'
                              )
                            }
                            className="w-4 h-4 accent-[#004d61] cursor-pointer"
                          />
                          <span>Exibir no site</span>
                        </label>

                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#004d61] bg-[#F8FAFC] border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showBtn}
                            onChange={(e) =>
                              commitData(
                                {
                                  ...siteData,
                                  banners: {
                                    ...siteData.banners,
                                    catalog: { ...slot, showButton: e.target.checked }
                                  }
                                },
                                e.target.checked
                                  ? 'Botão ativado no banner!'
                                  : 'Imagem inteira clicável!'
                              )
                            }
                            className="w-4 h-4 accent-[#004d61] cursor-pointer"
                          />
                          <span>Mostrar botão no banner: {showBtn ? 'Sim' : 'Não'}</span>
                        </label>
                      </div>
                    </div>

                    {slot.image ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img
                          src={slot.image}
                          alt={slot.title || 'Banner do catálogo'}
                          className="w-full max-h-52 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-[#F8FAFC] p-5 text-center text-sm text-slate-500">
                        Nenhuma imagem configurada neste slot.
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Enviar ou Substituir Imagem
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const dataUrl = await compressImageToDataURL(f, 1400, 0.85);
                              commitData(
                                {
                                  ...siteData,
                                  banners: {
                                    ...siteData.banners,
                                    catalog: { ...slot, image: dataUrl, enabled: true }
                                  }
                                },
                                'Banner atualizado com sucesso!'
                              );
                            }
                            e.target.value = '';
                          }}
                          className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#004d61] file:text-white hover:file:bg-[#003a49] cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Texto Alternativo / Campanha
                        </label>
                        <input
                          type="text"
                          value={slot.title}
                          onChange={(e) =>
                            onUpdateSiteData({
                              ...siteData,
                              banners: {
                                ...siteData.banners,
                                catalog: { ...slot, title: e.target.value }
                              }
                            })
                          }
                          placeholder="Ex: Ofertas da semana"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Link de Destino (URL, #seção ou categoria)
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={slot.linkUrl}
                            onChange={(e) =>
                              onUpdateSiteData({
                                ...siteData,
                                banners: {
                                  ...siteData.banners,
                                  catalog: { ...slot, linkUrl: e.target.value }
                                }
                              })
                            }
                            placeholder="#/produtos?cat=limpeza"
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                          />
                          <select
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              onUpdateSiteData({
                                ...siteData,
                                banners: {
                                  ...siteData.banners,
                                  catalog: { ...slot, linkUrl: e.target.value }
                                }
                              });
                            }}
                            className="px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 cursor-pointer"
                          >
                            {linkPresetOptions.map((opt) => (
                              <option key={opt.label} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Texto do Botão (quando ativo)
                          </label>
                          <input
                            type="text"
                            disabled={!showBtn}
                            value={slot.ctaLabel || ''}
                            onChange={(e) =>
                              onUpdateSiteData({
                                ...siteData,
                                banners: {
                                  ...siteData.banners,
                                  catalog: { ...slot, ctaLabel: e.target.value }
                                }
                              })
                            }
                            placeholder="Ver ofertas"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm disabled:opacity-50"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => commitData(siteData, 'Banner salvo!')}
                          className="px-4 py-2 rounded-xl bg-[#004d61] text-white text-sm font-semibold cursor-pointer"
                        >
                          Salvar
                        </button>
                        {slot.image && (
                          <button
                            type="button"
                            onClick={() =>
                              commitData(
                                {
                                  ...siteData,
                                  banners: {
                                    ...siteData.banners,
                                    catalog: {
                                      enabled: false,
                                      image: '',
                                      title: '',
                                      linkUrl: '',
                                      showButton: false,
                                      ctaLabel: 'Ver ofertas'
                                    }
                                  }
                                },
                                'Banner limpo!'
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Limpar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ================================================================= */}
          {/* ABA 3: CÔMODOS & CATEGORIAS                                       */}
          {/* ================================================================= */}
          {activeTab === 'taxonomy' && (
            <div className="space-y-6">
              {/* Categorias */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Categorias do Catálogo e Menu &ldquo;Produtos ▾&rdquo;
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Qualquer alteração aqui atualiza imediatamente o mega-dropdown do sub-header e a barra lateral de #/produtos.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const label = newCatName.trim();
                    const desc = newCatDesc.trim();
                    if (!label) return;
                    const id = slugifyId(label);
                    if (!siteData.categories.some((c) => c.id === id)) {
                      const nextCat: Category = { id, label, icon: 'tag', desc };
                      commitData(
                        { ...siteData, categories: [...siteData.categories, nextCat] },
                        'Categoria adicionada!'
                      );
                      setNewCatName('');
                      setNewCatDesc('');
                    } else {
                      showAdminToast('Já existe uma categoria com esse nome.');
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3"
                >
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Nova categoria (ex: Embalagens)"
                    className="sm:col-span-4 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                  />
                  <input
                    type="text"
                    required
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Subtítulo curto (ex: Caixas e fitas)"
                    className="sm:col-span-5 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-3 px-4 py-2.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-semibold text-sm cursor-pointer"
                  >
                    Adicionar Categoria
                  </button>
                </form>

                <div className="divide-y divide-slate-100">
                  {siteData.categories.map((cat, idx) => (
                    <div
                      key={cat.id}
                      draggable={editingCatId !== cat.id}
                      onDragStart={() => setDraggedCatIdx(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedCatIdx !== null) {
                          moveCategory(draggedCatIdx, idx);
                          setDraggedCatIdx(null);
                        }
                      }}
                      onDragEnd={() => setDraggedCatIdx(null)}
                      className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        draggedCatIdx === idx ? 'opacity-50' : ''
                      }`}
                    >
                      {editingCatId === cat.id ? (
                        <div className="flex-1 flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={editCatLabel}
                            onChange={(e) => setEditCatLabel(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold"
                          />
                          <input
                            type="text"
                            value={editCatDesc}
                            onChange={(e) => setEditCatDesc(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = siteData.categories.map((c) =>
                                c.id === cat.id
                                  ? { ...c, label: editCatLabel.trim() || c.label, desc: editCatDesc.trim() }
                                  : c
                              );
                              commitData({ ...siteData, categories: updated }, 'Categoria renomeada!');
                              setEditingCatId(null);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#004d61] text-white text-xs font-semibold cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Salvar
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <span
                              className="text-slate-400 cursor-grab active:cursor-grabbing hidden sm:inline-flex"
                              title="Arraste para reordenar"
                            >
                              <GripVertical className="w-4 h-4" />
                            </span>
                            <div className="w-9 h-9 rounded-lg bg-[#eef5f7] text-[#004d61] flex items-center justify-center shrink-0">
                              {renderLucideIcon(cat.icon, 'w-4 h-4')}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{cat.label}</p>
                              <p className="text-xs text-slate-500">{cat.desc}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveCategory(idx, idx - 1)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:border-[#004d61] text-slate-700 disabled:opacity-35 cursor-pointer"
                              title="Subir categoria"
                              aria-label={`Subir categoria ${cat.label}`}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === siteData.categories.length - 1}
                              onClick={() => moveCategory(idx, idx + 1)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:border-[#004d61] text-slate-700 disabled:opacity-35 cursor-pointer"
                              title="Descer categoria"
                              aria-label={`Descer categoria ${cat.label}`}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCatId(cat.id);
                                setEditCatLabel(cat.label);
                                setEditCatDesc(cat.desc);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" /> Editar
                            </button>
                            {siteData.categories.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = siteData.categories.filter((c) => c.id !== cat.id);
                                  commitData({ ...siteData, categories: updated }, 'Categoria removida.');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-red-50 text-xs font-semibold text-red-600 cursor-pointer"
                              >
                                Excluir
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ambientes / Cômodos */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Cômodos &amp; Setores (Casinha Interativa e Modal do Ambiente)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Personalize os nomes, descrições ou crie novos setores para vincular produtos.
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const label = newRoomName.trim();
                    const shortLabel = (newRoomShort || label).trim();
                    const desc = newRoomDesc.trim();
                    if (!label) return;
                    const id = slugifyId(label);
                    if (!siteData.rooms.some((r) => r.id === id)) {
                      const nextRoom: RoomZone = { id, label, shortLabel, icon: 'home', desc };
                      commitData({ ...siteData, rooms: [...siteData.rooms, nextRoom] }, 'Ambiente adicionado!');
                      setNewRoomName('');
                      setNewRoomShort('');
                      setNewRoomDesc('');
                    } else {
                      showAdminToast('Já existe um ambiente com esse nome.');
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3"
                >
                  <input
                    type="text"
                    required
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Nome do cômodo (ex: Recepção / Sala de Espera)"
                    className="sm:col-span-4 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                  />
                  <input
                    type="text"
                    value={newRoomShort}
                    onChange={(e) => setNewRoomShort(e.target.value)}
                    placeholder="Rótulo curto (ex: Recepção)"
                    className="sm:col-span-3 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                  />
                  <input
                    type="text"
                    required
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    placeholder="Descrição curta dos produtos indicados"
                    className="sm:col-span-3 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-semibold text-sm cursor-pointer"
                  >
                    Adicionar
                  </button>
                </form>

                <div className="divide-y divide-slate-100">
                  {siteData.rooms.map((room) => {
                    const isCoreSvgRoom = ['cozinha', 'banheiro', 'escritorio', 'area-servico'].includes(room.id);
                    return (
                      <div key={room.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {editingRoomId === room.id ? (
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <input
                              type="text"
                              value={editRoomLabel}
                              onChange={(e) => setEditRoomLabel(e.target.value)}
                              className="sm:col-span-4 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-semibold"
                            />
                            <input
                              type="text"
                              value={editRoomShort}
                              onChange={(e) => setEditRoomShort(e.target.value)}
                              className="sm:col-span-3 px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                            />
                            <input
                              type="text"
                              value={editRoomDesc}
                              onChange={(e) => setEditRoomDesc(e.target.value)}
                              className="sm:col-span-3 px-3 py-1.5 rounded-lg border border-slate-300 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = siteData.rooms.map((r) =>
                                  r.id === room.id
                                    ? {
                                        ...r,
                                        label: editRoomLabel.trim() || r.label,
                                        shortLabel: editRoomShort.trim() || r.shortLabel,
                                        desc: editRoomDesc.trim()
                                      }
                                    : r
                                );
                                commitData({ ...siteData, rooms: updated }, 'Ambiente atualizado!');
                                setEditingRoomId(null);
                              }}
                              className="sm:col-span-2 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#004d61] text-white text-xs font-semibold cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Salvar
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-[#eef5f7] text-[#004d61] flex items-center justify-center shrink-0">
                                {renderLucideIcon(room.icon, 'w-4 h-4')}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 text-sm">
                                  {room.label}{' '}
                                  <span className="text-xs font-normal text-slate-400">
                                    ({room.shortLabel})
                                  </span>
                                </p>
                                <p className="text-xs text-slate-500 truncate">{room.desc}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRoomId(room.id);
                                  setEditRoomLabel(room.label);
                                  setEditRoomShort(room.shortLabel);
                                  setEditRoomDesc(room.desc);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                              >
                                <Pencil className="w-3 h-3" /> Editar
                              </button>
                              {!isCoreSvgRoom && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = siteData.rooms.filter((r) => r.id !== room.id);
                                    commitData({ ...siteData, rooms: updated }, 'Ambiente removido.');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-red-50 text-xs font-semibold text-red-600 cursor-pointer"
                                >
                                  Excluir
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* ABA 4: INSTITUCIONAL & CONTATOS                                   */}
          {/* ================================================================= */}
          {activeTab === 'institucional' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Logo Oficial</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="bg-[#004d61] p-4 rounded-xl flex items-center justify-center min-w-[200px] h-20">
                    <img src={logoSrc} alt="Prévia da Logo" className="max-h-12 w-auto object-contain" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const dataUrl = await compressImageToDataURL(f, 800, 0.92);
                          commitData({ ...siteData, logoDataUrl: dataUrl }, 'Logo atualizada!');
                        }
                        e.target.value = '';
                      }}
                      className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#004d61] file:text-white hover:file:bg-[#003a49] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        commitData({ ...siteData, logoDataUrl: EXACT_LOGO_PATH }, 'Logo padrão restaurada!')
                      }
                      className="text-xs text-slate-500 hover:text-[#004d61] underline cursor-pointer"
                    >
                      Restaurar logo padrão oficial
                    </button>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  commitData(siteData, 'Seção Sobre Nós atualizada!');
                }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4"
              >
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Seção &ldquo;Sobre Nós&rdquo; (#sobre)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Edite o título, o texto institucional e opcionalmente adicione uma imagem para exibição na página inicial.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Título da Seção
                  </label>
                  <input
                    type="text"
                    required
                    value={siteData.aboutUsTitle || ''}
                    onChange={(e) => onUpdateSiteData({ ...siteData, aboutUsTitle: e.target.value })}
                    placeholder="Ex: Sobre a Faberminas"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Texto Institucional
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={siteData.aboutUsText || ''}
                    onChange={(e) => onUpdateSiteData({ ...siteData, aboutUsText: e.target.value })}
                    placeholder="Descreva a atuação da Faberminas para clientes CNPJ e CPF..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#004d61]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-7 space-y-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Imagem Institucional (Opcional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const dataUrl = await compressImageToDataURL(f, 1200, 0.85);
                          commitData(
                            { ...siteData, aboutUsImage: dataUrl },
                            'Imagem da seção Sobre Nós atualizada!'
                          );
                        }
                        e.target.value = '';
                      }}
                      className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#004d61] file:text-white hover:file:bg-[#003a49] cursor-pointer"
                    />
                    {siteData.aboutUsImage && (
                      <button
                        type="button"
                        onClick={() =>
                          commitData(
                            { ...siteData, aboutUsImage: '' },
                            'Imagem removida da seção Sobre Nós!'
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover imagem</span>
                      </button>
                    )}
                  </div>

                  <div className="md:col-span-5">
                    {siteData.aboutUsImage ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-40">
                        <img
                          src={siteData.aboutUsImage}
                          alt={siteData.aboutUsTitle || 'Sobre a Faberminas'}
                          className="w-full h-36 object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-[#F8FAFC] p-4 text-center text-xs text-slate-500">
                        Nenhuma imagem selecionada (layout em texto centralizado).
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-semibold text-sm cursor-pointer"
                  >
                    Salvar Seção Sobre Nós
                  </button>
                </div>
              </form>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  commitData(siteData, 'Dados institucionais e contatos salvos!');
                }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6"
              >
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-3">Diferenciais Operacionais (4 cards)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {siteData.differentials.map((d, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                        <input
                          type="text"
                          value={d.title}
                          onChange={(e) => {
                            const updated = [...siteData.differentials];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            onUpdateSiteData({ ...siteData, differentials: updated });
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
                            onUpdateSiteData({ ...siteData, differentials: updated });
                          }}
                          placeholder="Descrição"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <h2 className="md:col-span-2 text-lg font-bold text-slate-900">Endereço, Canais e Dados Fiscais</h2>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone Fixo</label>
                    <input
                      type="text"
                      required
                      value={siteData.phone}
                      onChange={(e) => onUpdateSiteData({ ...siteData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Comercial</label>
                    <input
                      type="text"
                      required
                      value={siteData.whatsapp}
                      onChange={(e) => onUpdateSiteData({ ...siteData, whatsapp: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail de Contato</label>
                    <input
                      type="email"
                      required
                      value={siteData.email}
                      onChange={(e) => onUpdateSiteData({ ...siteData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Link do Instagram</label>
                    <input
                      type="url"
                      value={siteData.instagram}
                      onChange={(e) => onUpdateSiteData({ ...siteData, instagram: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Horário de Funcionamento</label>
                    <input
                      type="text"
                      required
                      value={siteData.hours}
                      onChange={(e) => onUpdateSiteData({ ...siteData, hours: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                    <textarea
                      rows={2}
                      required
                      value={siteData.address}
                      onChange={(e) => onUpdateSiteData({ ...siteData, address: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL Embed do Google Maps</label>
                    <input
                      type="text"
                      required
                      value={siteData.mapsEmbed}
                      onChange={(e) => onUpdateSiteData({ ...siteData, mapsEmbed: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome / Razão Social</label>
                    <input
                      type="text"
                      required
                      value={siteData.legalName}
                      onChange={(e) => onUpdateSiteData({ ...siteData, legalName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ Oficial</label>
                    <input
                      type="text"
                      required
                      value={siteData.cnpj}
                      onChange={(e) => onUpdateSiteData({ ...siteData, cnpj: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-semibold text-sm cursor-pointer"
                  >
                    Salvar Alterações Institucionais
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================= */}
          {/* ABA 5: PERSISTÊNCIA & DEPLOY                                      */}
          {/* ================================================================= */}
          {activeTab === 'deploy' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-[#004d61] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="space-y-2">
                  <h2 className="text-xl font-extrabold text-[#004d61]">
                    Publicação Direta e Permanente em Todos os Dispositivos
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                    O botão abaixo gera um arquivo <strong>index.html</strong> autônomo contendo todo o estado atual do site embutido (produtos, SKUs, segmentos, cômodos, fotos em Base64, slides do carrossel, banners secundários e contatos). Ao publicar esse arquivo, todos os visitantes verão as atualizações imediatamente em qualquer dispositivo.
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    disabled={exportingHtml}
                    onClick={handleDownloadHtml}
                    className="btn-anim inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-bold text-sm shadow-md cursor-pointer disabled:opacity-60"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {exportingHtml ? 'Gerando arquivo...' : 'Baixar Site Atualizado (.html)'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Backup JSON e Restauração</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(siteData, null, 2)], {
                        type: 'application/json;charset=utf-8'
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'faberminas-backup.json';
                      a.click();
                      URL.revokeObjectURL(url);
                      showAdminToast('Backup JSON exportado!');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#004d61] text-[#004d61] hover:bg-[#eef5f7] font-semibold text-sm transition cursor-pointer"
                  >
                    <FileJson className="w-4 h-4" />
                    <span>Exportar Backup (.json)</span>
                  </button>

                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Importar Backup (.json)</span>
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
                            if (imported && Array.isArray(imported.products)) {
                              const impBanners = imported.banners || {};
                              const normalizedPromo = Array.isArray(impBanners.promotional)
                                ? impBanners.promotional
                                : [impBanners.secondary1, impBanners.secondary2, impBanners.home]
                                    .filter((b) => Boolean(b && b.image))
                                    .map((b, idx) => ({
                                      id: b.id || `promo-${idx + 1}`,
                                      enabled: b.enabled !== false,
                                      image: b.image,
                                      title: b.title || '',
                                      linkUrl: b.linkUrl || '',
                                      showButton: Boolean(b.showButton),
                                      ctaLabel: b.ctaLabel || 'Ver ofertas'
                                    }));

                              const normalizedProducts = imported.products.map((p: Product) => ({
                                ...p,
                                qtdMinima: Math.max(1, Number(p.qtdMinima) || 1)
                              }));

                              commitData(
                                {
                                  ...DEFAULT_SITE_DATA,
                                  ...imported,
                                  products: normalizedProducts,
                                  banners: {
                                    carousel: Array.isArray(impBanners.carousel) && impBanners.carousel.length > 0
                                      ? impBanners.carousel.map((s: HeroSlide) => ({
                                          ...s,
                                          showButton: s.showButton !== false
                                        }))
                                      : DEFAULT_SITE_DATA.banners.carousel,
                                    promotional: normalizedPromo,
                                    catalog: {
                                      ...DEFAULT_SITE_DATA.banners.catalog,
                                      ...(impBanners.catalog || {})
                                    }
                                  },
                                  categories:
                                    Array.isArray(imported.categories) && imported.categories.length > 0
                                      ? imported.categories
                                      : DEFAULT_SITE_DATA.categories,
                                  rooms:
                                    Array.isArray(imported.rooms) && imported.rooms.length > 0
                                      ? imported.rooms
                                      : DEFAULT_SITE_DATA.rooms,
                                  segments:
                                    Array.isArray(imported.segments) && imported.segments.length > 0
                                      ? imported.segments
                                      : DEFAULT_SITE_DATA.segments
                                },
                                'Backup importado com sucesso!'
                              );
                            } else {
                              showAdminToast('Arquivo JSON inválido.');
                            }
                          } catch {
                            showAdminToast('Erro ao ler o arquivo JSON.');
                          }
                        };
                        reader.readAsText(file);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  {!confirmRestore ? (
                    <button
                      type="button"
                      onClick={() => setConfirmRestore(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-700 font-medium text-sm transition cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restaurar Dados Padrão</span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                      <span className="text-xs font-semibold text-red-700">Confirmar restauração?</span>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem(STORAGE_KEY);
                          LEGACY_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
                          onRestoreDefaults();
                          setConfirmRestore(false);
                          showAdminToast('Dados padrão restaurados.');
                        }}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Sim, restaurar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRestore(false)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
