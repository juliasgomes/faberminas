import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  Minus,
  ClipboardList,
  Info,
  FileText,
  Barcode,
  Ruler,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { Category, Product, RoomZone } from '../types';
import { renderLucideIcon } from '../utils/helpers';

interface ProductDetailModalProps {
  product: Product | null;
  categories: Category[];
  rooms: RoomZone[];
  onClose: () => void;
  onAddToQuote: (product: Product, qty: number) => void;
  onSelectRoom?: (roomId: string) => void;
}

type DetailTab = 'todos' | 'sobre' | 'ficha';

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  categories,
  rooms,
  onClose,
  onAddToQuote,
  onSelectRoom
}) => {
  const minQty = Math.max(1, Number(product?.qtdMinima) || 1);
  const [qty, setQty] = useState<number>(minQty);
  const [activeTab, setActiveTab] = useState<DetailTab>('todos');
  const [brokenImage, setBrokenImage] = useState(false);

  useEffect(() => {
    if (product) {
      setQty(Math.max(1, Number(product.qtdMinima) || 1));
      setActiveTab('todos');
      setBrokenImage(false);
    }
  }, [product]);

  // Lock body scroll and listen for Escape key while open
  useEffect(() => {
    if (!product) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const categoryObj = categories.find((c) => c.id === product.category);
  const skuText = (product.sku || '').trim() || 'Sob consulta';
  const measuresText = (product.measures || '').trim() || 'Padrão comercial';
  const specText = (product.spec || '').trim() || 'Uso geral / padrão distribuidor';

  const rawAbout = (product.about || '').trim();
  const rawDesc = (product.description || '').trim();

  const aboutText =
    rawAbout ||
    `${product.name} integra a linha ${categoryObj?.label || product.category} da Faberminas, atendendo demandas corporativas (CNPJ) e residenciais (CPF).`;

  const descriptionText =
    rawDesc && rawDesc.toLowerCase() !== aboutText.toLowerCase()
      ? rawDesc
      : `Aplicação e características técnicas: ${specText}. Dimensões/Capacidade: ${measuresText}. Disponível para cotação rápida com entrega própria em Belo Horizonte e Região Metropolitana.`;

  const modalNode = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)'
      }}
      className="bg-slate-900/60 p-3 sm:p-5 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Cabeçalho Fixo do Modal */}
        <div className="px-5 sm:px-6 py-4 bg-[#004d61] text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-bold uppercase tracking-wider text-white/90 truncate">
              {categoryObj?.label || product.category}
            </span>
            {product.sku && (
              <span className="font-mono text-xs bg-white/15 px-2 py-0.5 rounded shrink-0">
                SKU: {product.sku}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-white/15 text-white cursor-pointer shrink-0"
            aria-label="Fechar detalhes do produto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Rolável dentro dos 90vh */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Topo: Foto + Título + Pedido Mínimo */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            <div className="sm:col-span-4 aspect-square max-h-52 mx-auto w-full rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-center overflow-hidden">
              {product.image && !brokenImage ? (
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  onError={() => setBrokenImage(true)}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#eef5f7] text-[#004d61] flex items-center justify-center">
                  {renderLucideIcon(categoryObj?.icon || 'package', 'w-10 h-10')}
                </div>
              )}
            </div>

            <div className="sm:col-span-8 space-y-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h2>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Código (SKU)
                  </span>
                  <span className="font-mono text-sm font-bold text-[#004d61] break-all">
                    {skuText}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Medidas
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block truncate" title={measuresText}>
                    {measuresText}
                  </span>
                </div>
              </div>

              {/* Aviso de Quantidade Mínima */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#eef5f7] border border-[#004d61]/20 text-xs font-semibold text-[#004d61]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Quantidade mínima para cotação:{' '}
                  <strong className="tabular-nums">
                    {minQty} {minQty === 1 ? 'unidade' : 'unidades'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Abas Estruturadas */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('todos')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'todos'
                  ? 'bg-[#004d61] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Ficha Completa
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sobre')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'sobre'
                  ? 'bg-[#004d61] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sobre &amp; Descrição
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ficha')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'ficha'
                  ? 'bg-[#004d61] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Medidas &amp; Especificações
            </button>
          </div>

          {/* Seções Estruturadas */}
          <div className="space-y-3">
            {(activeTab === 'todos' || activeTab === 'sobre') && (
              <>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/90 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#004d61]">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Sobre o produto</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{aboutText}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/90 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#004d61]">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>Descrição</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{descriptionText}</p>
                </div>
              </>
            )}

            {(activeTab === 'todos' || activeTab === 'ficha') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/90 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#004d61]">
                    <Barcode className="w-3.5 h-3.5 shrink-0" />
                    <span>Código (SKU)</span>
                  </div>
                  <p className="font-mono text-sm font-bold text-slate-900">{skuText}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/90 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#004d61]">
                    <Ruler className="w-3.5 h-3.5 shrink-0" />
                    <span>Medidas</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{measuresText}</p>
                </div>

                <div className="sm:col-span-2 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/90 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#004d61]">
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span>Especificações</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{specText}</p>
                </div>
              </div>
            )}

            {product.rooms && product.rooms.length > 0 && (
              <div className="pt-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Indicado para os ambientes
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.rooms.map((rId) => {
                    const r = rooms.find((item) => item.id === rId);
                    if (!r) return null;
                    return (
                      <button
                        key={rId}
                        type="button"
                        onClick={() => {
                          if (onSelectRoom) {
                            onSelectRoom(rId);
                          }
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eef5f7] hover:bg-[#004d61] text-[#004d61] hover:text-white text-xs font-semibold transition cursor-pointer"
                      >
                        {renderLucideIcon(r.icon, 'w-3.5 h-3.5')}
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Fixo com Controles de Quantidade Mínima + CTA */}
        <div className="px-5 sm:px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="flex items-center justify-between sm:justify-start border border-slate-300 rounded-xl bg-white px-2">
            <button
              type="button"
              disabled={qty <= minQty}
              onClick={() => setQty((q) => Math.max(minQty, q - 1))}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#004d61] hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-bold text-slate-900 tabular-nums">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#004d61] hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onAddToQuote(product, Math.max(minQty, qty));
              onClose();
            }}
            className="btn-anim flex-1 min-h-[46px] px-6 py-3 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <ClipboardList className="w-4 h-4 icon-pop" />
            <span>Adicionar à cotação</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};
