import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardList,
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { QuoteItem } from '../types';

interface QuoteDrawerProps {
  open: boolean;
  quoteCart: QuoteItem[];
  onClose: () => void;
  onChangeQty: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onSendWhatsApp: () => void;
  onFillContact: () => void;
}

export const QuoteDrawer: React.FC<QuoteDrawerProps> = ({
  open,
  quoteCart,
  onClose,
  onChangeQty,
  onRemoveItem,
  onClearCart,
  onSendWhatsApp,
  onFillContact
}) => {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  const drawerContent = (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          className="fixed inset-0 z-[9995] bg-slate-900/50 transition-opacity animate-fade-in"
        />
      )}

      <aside
        aria-label="Cesta de Cotação"
        className={`fixed top-0 right-0 z-[9998] h-full w-full sm:max-w-md bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Cabeçalho da Gaveta */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 bg-[#004d61] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-5 h-5" />
            <h2 className="font-bold text-lg">Cesta de Cotação</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/15 text-white transition cursor-pointer"
            aria-label="Fechar cesta"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Faixa de Confiança B2B (CNPJ) & B2C (CPF) */}
        <div className="px-5 py-3 bg-[#eef5f7] border-b border-[#004d61]/15 flex items-start gap-2.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#004d61] shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-[#004d61] leading-snug">
            Atendemos Pessoas Físicas (CPF) e Empresas (CNPJ) • Entrega própria ágil em BH e Região Metropolitana
          </p>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {quoteCart.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="w-6 h-6" />
              </div>
              <p className="font-semibold text-slate-800 text-base">
                Sua cesta de cotação está vazia
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Clique em &ldquo;Cotar item&rdquo; nos produtos para montar sua lista de orçamento.
              </p>
            </div>
          ) : (
            quoteCart.map((item) => {
              const minQty = Math.max(1, Number(item.qtdMinima) || 1);
              const atMin = item.qty <= minQty;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    {item.sku && (
                      <span className="block font-mono text-[11px] font-semibold text-[#004d61]">
                        {item.sku}
                      </span>
                    )}
                    <p className="font-semibold text-slate-900 text-sm leading-snug">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{item.spec}</p>
                    {minQty > 1 && (
                      <p className="text-[11px] font-semibold text-[#004d61] mt-0.5">
                        Qtd. mínima: {minQty} un.
                      </p>
                    )}
                  </div>

                  {/* Controles táteis min-height 44px com bloqueio abaixo da qtdMinima */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={atMin}
                      title={atMin ? `Quantidade mínima: ${minQty}` : 'Diminuir quantidade'}
                      onClick={() => onChangeQty(item.id, -1)}
                      className="min-w-[44px] min-h-[44px] rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-900 tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onChangeQty(item.id, 1)}
                      className="min-w-[44px] min-h-[44px] rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="min-w-[40px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-600 cursor-pointer"
                      aria-label="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé de Ações */}
        {quoteCart.length > 0 && (
          <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50 space-y-2.5 shrink-0">
            <button
              type="button"
              onClick={onSendWhatsApp}
              className="btn-anim w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 icon-pop" />
              <span>Enviar Cotação no WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={onFillContact}
              className="btn-anim w-full min-h-[44px] py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#004d61] border border-[#004d61] font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 icon-right" />
              <span>Preencher no Formulário de Contato</span>
            </button>
            <button
              type="button"
              onClick={onClearCart}
              className="w-full min-h-[36px] text-xs text-slate-500 hover:text-red-600 py-1 cursor-pointer font-medium"
            >
              Limpar lista
            </button>
          </div>
        )}
      </aside>
    </>
  );

  return createPortal(drawerContent, document.body);
};
