import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  X,
  ClipboardList,
  Check,
  Layers,
  MessageCircle
} from 'lucide-react';
import { Category, Product, RoomZone } from '../types';
import { onlyDigits, renderLucideIcon } from '../utils/helpers';
import { ProductDetailModal } from './ProductDetailModal';

interface InteractiveHouseSectionProps {
  rooms: RoomZone[];
  categories: Category[];
  products: Product[];
  whatsapp: string;
  onAddToQuote: (product: Product, qty?: number) => void;
  onBulkAddRoom: (items: Product[]) => void;
  onExploreAll: () => void;
  onNavigateRoomCatalog: (roomId: string) => void;
}

// Projeção isométrica exata 2:1 centrada no SVG (viewBox 920 x 560)
function iso(u: number, v: number, z = 0): [number, number] {
  const x = 460 + (u - v) * 330;
  const y = 135 + (u + v) * 165 - z;
  return [Number(x.toFixed(1)), Number(y.toFixed(1))];
}

function pts(coords: Array<[number, number]>): string {
  return coords.map(([x, y]) => `${x},${y}`).join(' ');
}

function IsoBox({
  u1,
  v1,
  u2,
  v2,
  z1 = 0,
  z2,
  topFill = '#ffffff',
  leftFill = '#e2e8f0',
  rightFill = '#cbd5e1',
  stroke = '#004d61',
  strokeWidth = 1.35
}: {
  u1: number;
  v1: number;
  u2: number;
  v2: number;
  z1?: number;
  z2: number;
  topFill?: string;
  leftFill?: string;
  rightFill?: string;
  stroke?: string;
  strokeWidth?: number;
}) {
  const top = pts([iso(u1, v1, z2), iso(u2, v1, z2), iso(u2, v2, z2), iso(u1, v2, z2)]);
  const left = pts([iso(u1, v2, z1), iso(u2, v2, z1), iso(u2, v2, z2), iso(u1, v2, z2)]);
  const right = pts([iso(u2, v1, z1), iso(u2, v2, z1), iso(u2, v2, z2), iso(u2, v1, z2)]);

  return (
    <g stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round">
      <polygon points={left} fill={leftFill} />
      <polygon points={right} fill={rightFill} />
      <polygon points={top} fill={topFill} />
    </g>
  );
}

const CORE_PIN_POSITIONS: Record<string, { u: number; v: number }> = {
  cozinha: { u: 0.28, v: 0.28 },
  banheiro: { u: 0.78, v: 0.25 },
  escritorio: { u: 0.24, v: 0.78 },
  'area-servico': { u: 0.76, v: 0.76 }
};

export const InteractiveHouseSection: React.FC<InteractiveHouseSectionProps> = ({
  rooms,
  categories,
  products,
  whatsapp,
  onAddToQuote,
  onBulkAddRoom,
  onExploreAll,
  onNavigateRoomCatalog
}) => {
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [kitAdded, setKitAdded] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!selectedRoomId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !detailProduct) {
        setSelectedRoomId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedRoomId, detailProduct]);

  const getRoomProducts = (roomId: string) =>
    products.filter((p) => Array.isArray(p.rooms) && p.rooms.includes(roomId));

  const getRoomCount = (roomId: string) => getRoomProducts(roomId).length;
  const findRoom = (id: string) => rooms.find((r) => r.id === id);

  const selectedRoom = selectedRoomId ? findRoom(selectedRoomId) || null : null;
  const selectedRoomProducts = selectedRoomId ? getRoomProducts(selectedRoomId) : [];
  const whatsDigits = onlyDigits(whatsapp);

  const openRoomModal = (roomId: string) => {
    setSelectedRoomId(roomId);
    setKitAdded(false);
  };

  return (
    <section
      id="ambientes"
      aria-label="Compre por Ambiente — Cada setor pede o material certo"
      className="relative bg-arch-grid-light py-16 sm:py-24 border-b border-slate-200/80 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da seção */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="w-12 h-1 bg-[#004d61] mx-auto mb-4 rounded-full" />
          <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-[#004d61] tracking-tight uppercase leading-tight text-balance">
            Cada setor pede o material certo.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            Clique em qualquer cômodo na planta interativa para visualizar os materiais recomendados e montar seu kit de cotação na hora.
          </p>
        </div>

        {/* Container principal da Casinha Isométrica (escala ampliada para fácil visualização e toque) */}
        <div className="relative max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-[#004d61]/5 p-2.5 sm:p-5 lg:p-6">

          {/* Planta SVG Arquitetônica Isométrica Detalhada */}
          <div className="relative w-full">
            <svg
              viewBox="0 0 920 560"
              className="w-full h-auto select-none touch-manipulation overflow-visible"
              role="img"
              aria-label="Planta arquitetônica interativa dos setores: Cozinha e Copa, Banheiro e Sanitários, Escritório e Recepção, Área de Serviço e Externa"
            >
              <defs>
                <pattern id="isoGridPattern" width="44" height="22" patternUnits="userSpaceOnUse">
                  <path
                    d="M 22 0 L 44 11 L 22 22 L 0 11 Z"
                    fill="none"
                    stroke="#004d61"
                    strokeWidth="0.6"
                    strokeOpacity="0.09"
                  />
                </pattern>
                <filter id="roomSoftShadow" x="-10%" y="-10%" width="120%" height="125%">
                  <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#004d61" floodOpacity="0.14" />
                </filter>
              </defs>

              <rect x="20" y="10" width="880" height="530" rx="20" fill="url(#isoGridPattern)" />

              {/* Eixos arquitetônicos sutis */}
              <g stroke="#004d61" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="4 4">
                <line x1={iso(-0.08, 0, 0)[0]} y1={iso(-0.08, 0, 0)[1]} x2={iso(1.08, 0, 0)[0]} y2={iso(1.08, 0, 0)[1]} />
                <line x1={iso(0, -0.08, 0)[0]} y1={iso(0, -0.08, 0)[1]} x2={iso(0, 1.08, 0)[0]} y2={iso(0, 1.08, 0)[1]} />
                <line x1={iso(1.08, 0, 0)[0]} y1={iso(1.08, 0, 0)[1]} x2={iso(1.08, 1.08, 0)[0]} y2={iso(1.08, 1.08, 0)[1]} />
                <line x1={iso(0, 1.08, 0)[0]} y1={iso(0, 1.08, 0)[1]} x2={iso(1.08, 1.08, 0)[0]} y2={iso(1.08, 1.08, 0)[1]} />
              </g>

              {/* Laje estrutural 3D */}
              <g filter="url(#roomSoftShadow)">
                <polygon
                  points={pts([iso(0, 1, 0), iso(1, 1, 0), iso(1, 1, -18), iso(0, 1, -18)])}
                  fill="#003a49"
                />
                <polygon
                  points={pts([iso(1, 0, 0), iso(1, 1, 0), iso(1, 1, -18), iso(1, 0, -18)])}
                  fill="#004d61"
                />
                <polygon
                  points={pts([iso(0, 0, 0), iso(1, 0, 0), iso(1, 1, 0), iso(0, 1, 0)])}
                  fill="#f8fafc"
                  stroke="#004d61"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
              </g>

              {/* Paredes traseiras */}
              <g stroke="#004d61" strokeWidth="1.8" strokeLinejoin="round">
                <polygon
                  points={pts([iso(0, 0, 0), iso(0, 1, 0), iso(0, 1, 86), iso(0, 0, 86)])}
                  fill="#eef5f7"
                />
                <polygon
                  points={pts([iso(0, 0, 0), iso(1, 0, 0), iso(1, 0, 86), iso(0, 0, 86)])}
                  fill="#f8fafc"
                />
                <polygon
                  points={pts([iso(-0.02, -0.02, 86), iso(0, 0, 86), iso(0, 1, 86), iso(-0.02, 1, 86)])}
                  fill="#004d61"
                />
                <polygon
                  points={pts([iso(-0.02, -0.02, 86), iso(1, -0.02, 86), iso(1, 0, 86), iso(0, 0, 86)])}
                  fill="#004d61"
                />
              </g>

              {/* ================================================================= */}
              {/* ZONA 1: COZINHA & COPA                                            */}
              {/* ================================================================= */}
              <g
                className={`svg-room-zone ${hoveredRoomId === 'cozinha' ? 'is-hovered' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`Setor Cozinha & Copa — ${getRoomCount('cozinha')} produtos`}
                onMouseEnter={() => setHoveredRoomId('cozinha')}
                onMouseLeave={() => setHoveredRoomId(null)}
                onFocus={() => setHoveredRoomId('cozinha')}
                onBlur={() => setHoveredRoomId(null)}
                onClick={() => openRoomModal('cozinha')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openRoomModal('cozinha');
                  }
                }}
              >
                <polygon
                  className="room-floor-highlight"
                  points={pts([iso(0, 0, 0.5), iso(0.55, 0, 0.5), iso(0.55, 0.55, 0.5), iso(0, 0.55, 0.5)])}
                  fill="#ffffff"
                  fillOpacity="0.92"
                  stroke="#004d61"
                  strokeOpacity="0.25"
                  strokeWidth="1.2"
                />
                <g stroke="#004d61" strokeOpacity="0.08" strokeWidth="0.8">
                  {[0.14, 0.28, 0.42].map((t) => (
                    <React.Fragment key={t}>
                      <line x1={iso(t, 0, 0.5)[0]} y1={iso(t, 0, 0.5)[1]} x2={iso(t, 0.55, 0.5)[0]} y2={iso(t, 0.55, 0.5)[1]} />
                      <line x1={iso(0, t, 0.5)[0]} y1={iso(0, t, 0.5)[1]} x2={iso(0.55, t, 0.5)[0]} y2={iso(0.55, t, 0.5)[1]} />
                    </React.Fragment>
                  ))}
                </g>

                {/* Janela panorâmica */}
                <polygon
                  points={pts([iso(0.12, 0.005, 42), iso(0.48, 0.005, 42), iso(0.48, 0.005, 72), iso(0.12, 0.005, 72)])}
                  fill="#eef5f7"
                  stroke="#004d61"
                  strokeWidth="1.3"
                />
                <line x1={iso(0.3, 0.005, 42)[0]} y1={iso(0.3, 0.005, 42)[1]} x2={iso(0.3, 0.005, 72)[0]} y2={iso(0.3, 0.005, 72)[1]} stroke="#004d61" strokeWidth="1" />

                {/* 3 Coifas industriais */}
                {[0.08, 0.22, 0.36].map((vPos, idx) => (
                  <g key={idx}>
                    <polygon
                      points={pts([
                        iso(0.01, vPos, 54),
                        iso(0.11, vPos, 54),
                        iso(0.11, vPos + 0.1, 54),
                        iso(0.01, vPos + 0.1, 54)
                      ])}
                      fill="#e2e8f0"
                      stroke="#004d61"
                      strokeWidth="1.1"
                    />
                    <polygon
                      points={pts([
                        iso(0.01, vPos, 54),
                        iso(0.01, vPos + 0.1, 54),
                        iso(0.03, vPos + 0.075, 74),
                        iso(0.03, vPos + 0.025, 74)
                      ])}
                      fill="#cbd5e1"
                      stroke="#004d61"
                      strokeWidth="1.1"
                    />
                    <polygon
                      points={pts([
                        iso(0.01, vPos + 0.1, 54),
                        iso(0.11, vPos + 0.1, 54),
                        iso(0.08, vPos + 0.075, 74),
                        iso(0.03, vPos + 0.075, 74)
                      ])}
                      fill="#f1f5f9"
                      stroke="#004d61"
                      strokeWidth="1.1"
                    />
                  </g>
                ))}

                {/* Geladeira vertical dupla */}
                <IsoBox u1={0.02} v1={0.44} u2={0.13} v2={0.54} z2={58} topFill="#f8fafc" leftFill="#e2e8f0" rightFill="#cbd5e1" />
                <line x1={iso(0.13, 0.44, 34)[0]} y1={iso(0.13, 0.44, 34)[1]} x2={iso(0.13, 0.54, 34)[0]} y2={iso(0.13, 0.54, 34)[1]} stroke="#004d61" strokeWidth="1" />
                <line x1={iso(0.131, 0.46, 38)[0]} y1={iso(0.131, 0.46, 38)[1]} x2={iso(0.131, 0.46, 48)[0]} y2={iso(0.131, 0.46, 48)[1]} stroke="#004d61" strokeWidth="1.8" strokeLinecap="round" />

                {/* Bancada de fogões + fornos */}
                <IsoBox u1={0.02} v1={0.06} u2={0.14} v2={0.43} z2={24} topFill="#ffffff" leftFill="#e2e8f0" rightFill="#cbd5e1" />
                {[0.1, 0.24, 0.36].map((vPos, idx) => {
                  const [cx, cy] = iso(0.08, vPos + 0.02, 24.5);
                  return (
                    <g key={idx}>
                      <ellipse cx={cx} cy={cy} rx="6" ry="3" fill="#004d61" />
                      <ellipse cx={cx + 10} cy={cy - 5} rx="5" ry="2.5" fill="#004d61" fillOpacity="0.65" />
                      {/* Porta do forno */}
                      <polygon
                        points={pts([iso(0.141, vPos - 0.01, 5), iso(0.141, vPos + 0.07, 5), iso(0.141, vPos + 0.07, 18), iso(0.141, vPos - 0.01, 18)])}
                        fill="#004d61"
                        fillOpacity="0.16"
                        stroke="#004d61"
                        strokeWidth="0.9"
                      />
                    </g>
                  );
                })}

                {/* Bancada de pias duplas com torneiras */}
                <IsoBox u1={0.14} v1={0.02} u2={0.52} v2={0.14} z2={24} topFill="#ffffff" leftFill="#e2e8f0" rightFill="#cbd5e1" />
                {[0.24, 0.38].map((uPos, idx) => (
                  <g key={idx}>
                    <polygon
                      points={pts([
                        iso(uPos, 0.04, 24.5),
                        iso(uPos + 0.09, 0.04, 24.5),
                        iso(uPos + 0.09, 0.11, 24.5),
                        iso(uPos, 0.11, 24.5)
                      ])}
                      fill="#eef5f7"
                      stroke="#004d61"
                      strokeWidth="1.2"
                    />
                    <path
                      d={`M ${iso(uPos + 0.045, 0.03, 24.5).join(',')} L ${iso(uPos + 0.045, 0.03, 33).join(',')} L ${iso(uPos + 0.045, 0.06, 33).join(',')}`}
                      fill="none"
                      stroke="#004d61"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </g>
                ))}

                {/* Ilha central com divisórias */}
                <IsoBox u1={0.22} v1={0.24} u2={0.44} v2={0.42} z2={22} topFill="#ffffff" leftFill="#e2e8f0" rightFill="#cbd5e1" />

                {/* Lixeira de pedal 100L + tampa destacada */}
                <IsoBox u1={0.45} v1={0.43} u2={0.52} v2={0.5} z2={21} topFill="#004d61" leftFill="#003a49" rightFill="#004d61" />
                <IsoBox u1={0.445} v1={0.425} u2={0.525} v2={0.505} z1={21} z2={24} topFill="#003a49" leftFill="#002b36" rightFill="#003a49" />
              </g>

              {/* PAREDE DIVISÓRIA #004d61 */}
              <g stroke="#002b36" strokeWidth="1.2" strokeLinejoin="round">
                <polygon
                  points={pts([iso(0.55, 0, 0), iso(0.55, 0.52, 0), iso(0.55, 0.52, 74), iso(0.55, 0, 74)])}
                  fill="#004d61"
                />
                <polygon
                  points={pts([iso(0.55, 0, 74), iso(0.575, 0, 74), iso(0.575, 0.52, 74), iso(0.55, 0.52, 74)])}
                  fill="#003a49"
                />
              </g>

              {/* ================================================================= */}
              {/* ZONA 2: BANHEIRO & SANITÁRIOS                                     */}
              {/* ================================================================= */}
              <g
                className={`svg-room-zone ${hoveredRoomId === 'banheiro' ? 'is-hovered' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`Setor Banheiro & Sanitários — ${getRoomCount('banheiro')} produtos`}
                onMouseEnter={() => setHoveredRoomId('banheiro')}
                onMouseLeave={() => setHoveredRoomId(null)}
                onFocus={() => setHoveredRoomId('banheiro')}
                onBlur={() => setHoveredRoomId(null)}
                onClick={() => openRoomModal('banheiro')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openRoomModal('banheiro');
                  }
                }}
              >
                <polygon
                  className="room-floor-highlight"
                  points={pts([iso(0.575, 0, 0.5), iso(1, 0, 0.5), iso(1, 0.52, 0.5), iso(0.575, 0.52, 0.5)])}
                  fill="#f8fafc"
                  fillOpacity="0.95"
                  stroke="#004d61"
                  strokeOpacity="0.25"
                  strokeWidth="1.2"
                />
                <g stroke="#004d61" strokeOpacity="0.09" strokeWidth="0.8">
                  {[0.7, 0.85].map((uPos) => (
                    <line key={uPos} x1={iso(uPos, 0, 0.5)[0]} y1={iso(uPos, 0, 0.5)[1]} x2={iso(uPos, 0.52, 0.5)[0]} y2={iso(uPos, 0.52, 0.5)[1]} />
                  ))}
                  {[0.17, 0.34].map((vPos) => (
                    <line key={vPos} x1={iso(0.575, vPos, 0.5)[0]} y1={iso(0.575, vPos, 0.5)[1]} x2={iso(1, vPos, 0.5)[0]} y2={iso(1, vPos, 0.5)[1]} />
                  ))}
                </g>

                {/* Vaso Sanitário + Caixa acoplada + Suporte de Papel Higiênico */}
                <IsoBox u1={0.59} v1={0.14} u2={0.64} v2={0.22} z2={25} topFill="#ffffff" leftFill="#e2e8f0" rightFill="#cbd5e1" />
                <IsoBox u1={0.64} v1={0.14} u2={0.72} v2={0.22} z2={13} topFill="#ffffff" leftFill="#e2e8f0" rightFill="#cbd5e1" />
                <ellipse cx={iso(0.68, 0.18, 13.5)[0]} cy={iso(0.68, 0.18, 13.5)[1]} rx="9" ry="5" fill="#eef5f7" stroke="#004d61" strokeWidth="1" />
                {/* Dispenser de papel higiênico rolão na divisória */}
                <IsoBox u1={0.575} v1={0.27} u2={0.60} v2={0.33} z1={18} z2={27} topFill="#ffffff" leftFill="#e2e8f0" rightFill="#004d61" />

                {/* Dispenser de Papel Toalha e Saboneteira na parede */}
                <IsoBox u1={0.64} v1={0.02} u2={0.71} v2={0.05} z1={34} z2={50} topFill="#ffffff" leftFill="#e2e8f0" rightFill="#004d61" />
                <IsoBox u1={0.73} v1={0.02} u2={0.77} v2={0.05} z1={34} z2={46} topFill="#ffffff" leftFill="#eef5f7" rightFill="#004d61" />

                {/* Escova sanitária com suporte */}
                <IsoBox u1={0.6} v1={0.35} u2={0.64} v2={0.39} z2={11} topFill="#004d61" leftFill="#003a49" rightFill="#004d61" />
                <line
                  x1={iso(0.62, 0.37, 11)[0]}
                  y1={iso(0.62, 0.37, 11)[1]}
                  x2={iso(0.62, 0.37, 25)[0]}
                  y2={iso(0.62, 0.37, 25)[1]}
                  stroke="#004d61"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />

                {/* Pias gêmeas com cuba, torneiras e espelhos */}
                {[0.8, 0.9].map((uPos, idx) => (
                  <g key={idx}>
                    <polygon
                      points={pts([
                        iso(uPos, 0.01, 36),
                        iso(uPos + 0.075, 0.01, 36),
                        iso(uPos + 0.075, 0.01, 64),
                        iso(uPos, 0.01, 64)
                      ])}
                      fill="#eef5f7"
                      stroke="#004d61"
                      strokeWidth="1.2"
                    />
                    <IsoBox u1={uPos} v1={0.04} u2={uPos + 0.075} v2={0.13} z1={16} z2={24} topFill="#ffffff" leftFill="#e2e8f0" rightFill="#cbd5e1" />
                    <IsoBox u1={uPos + 0.02} v1={0.05} u2={uPos + 0.055} v2={0.09} z1={0} z2={16} topFill="#e2e8f0" leftFill="#cbd5e1" rightFill="#94a3b8" />
                    <ellipse cx={iso(uPos + 0.038, 0.085, 24.4)[0]} cy={iso(uPos + 0.038, 0.085, 24.4)[1]} rx="6" ry="3.2" fill="#eef5f7" stroke="#004d61" strokeWidth="0.9" />
                    <path
                      d={`M ${iso(uPos + 0.038, 0.045, 24.4).join(',')} L ${iso(uPos + 0.038, 0.045, 31).join(',')} L ${iso(uPos + 0.038, 0.07, 31).join(',')}`}
                      fill="none"
                      stroke="#004d61"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </g>
                ))}

                {/* Divisória de vidro do boxe/sanitário */}
                <polygon
                  points={pts([iso(0.84, 0.34, 0.5), iso(0.98, 0.34, 0.5), iso(0.98, 0.34, 52), iso(0.84, 0.34, 52)])}
                  fill="#004d61"
                  fillOpacity="0.12"
                  stroke="#004d61"
                  strokeWidth="1.2"
                />
              </g>

              {/* ================================================================= */}
              {/* ZONA 3: ESCRITÓRIO & RECEPÇÃO                                     */}
              {/* ================================================================= */}
              <g
                className={`svg-room-zone ${hoveredRoomId === 'escritorio' ? 'is-hovered' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`Setor Escritório & Recepção — ${getRoomCount('escritorio')} produtos`}
                onMouseEnter={() => setHoveredRoomId('escritorio')}
                onMouseLeave={() => setHoveredRoomId(null)}
                onFocus={() => setHoveredRoomId('escritorio')}
                onBlur={() => setHoveredRoomId(null)}
                onClick={() => openRoomModal('escritorio')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openRoomModal('escritorio');
                  }
                }}
              >
                <polygon
                  className="room-floor-highlight"
                  points={pts([iso(0, 0.56, 0.5), iso(0.52, 0.56, 0.5), iso(0.52, 1, 0.5), iso(0, 1, 0.5)])}
                  fill="#ffffff"
                  fillOpacity="0.92"
                  stroke="#004d61"
                  strokeOpacity="0.25"
                  strokeWidth="1.2"
                />

                {/* Mureta divisória baixa */}
                <IsoBox u1={0.02} v1={0.56} u2={0.44} v2={0.585} z2={34} topFill="#004d61" leftFill="#003a49" rightFill="#004d61" />

                {/* Estante / Arquivo com caixas polionda */}
                <IsoBox u1={0.03} v1={0.64} u2={0.1} v2={0.86} z2={34} topFill="#ffffff" leftFill="#e2e8f0" rightFill="#cbd5e1" />
                <IsoBox u1={0.04} v1={0.66} u2={0.09} v2={0.74} z1={34} z2={44} topFill="#eef5f7" leftFill="#004d61" rightFill="#003a49" />
                <IsoBox u1={0.04} v1={0.76} u2={0.09} v2={0.84} z1={34} z2={44} topFill="#eef5f7" leftFill="#004d61" rightFill="#003a49" />

                {/* Mesa Executiva em L */}
                <IsoBox u1={0.14} v1={0.68} u2={0.4} v2={0.82} z1={18} z2={22} topFill="#ffffff" leftFill="#e2e8f0" rightFill="#cbd5e1" />
                <IsoBox u1={0.14} v1={0.68} u2={0.18} v2={0.82} z1={0} z2={18} topFill="#cbd5e1" leftFill="#cbd5e1" rightFill="#94a3b8" />
                <IsoBox u1={0.36} v1={0.68} u2={0.4} v2={0.82} z1={0} z2={18} topFill="#cbd5e1" leftFill="#cbd5e1" rightFill="#94a3b8" />

                {/* Computador (Monitor + Base + Teclado) & Resmas A4 */}
                <IsoBox u1={0.21} v1={0.70} u2={0.29} v2={0.725} z1={23} z2={38} topFill="#004d61" leftFill="#003a49" rightFill="#004d61" />
                <IsoBox u1={0.21} v1={0.75} u2={0.28} v2={0.79} z1={22} z2={23.5} topFill="#cbd5e1" leftFill="#94a3b8" rightFill="#64748b" />
                <IsoBox u1={0.31} v1={0.71} u2={0.38} v2={0.78} z1={22} z2={27} topFill="#eef5f7" leftFill="#cbd5e1" rightFill="#94a3b8" />

                {/* Cadeira giratória */}
                <IsoBox u1={0.22} v1={0.84} u2={0.3} v2={0.92} z1={10} z2={15} topFill="#004d61" leftFill="#003a49" rightFill="#004d61" />
                <IsoBox u1={0.22} v1={0.9} u2={0.3} v2={0.93} z1={15} z2={31} topFill="#004d61" leftFill="#003a49" rightFill="#004d61" />

                {/* Lixeira de escritório */}
                <IsoBox u1={0.42} v1={0.78} u2={0.47} v2={0.83} z2={14} topFill="#eef5f7" leftFill="#004d61" rightFill="#003a49" />
              </g>

              {/* ================================================================= */}
              {/* ZONA 4: ÁREA DE SERVIÇO & EXTERNA                                 */}
              {/* ================================================================= */}
              <g
                className={`svg-room-zone ${hoveredRoomId === 'area-servico' ? 'is-hovered' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`Setor Área de Serviço & Externa — ${getRoomCount('area-servico')} produtos`}
                onMouseEnter={() => setHoveredRoomId('area-servico')}
                onMouseLeave={() => setHoveredRoomId(null)}
                onFocus={() => setHoveredRoomId('area-servico')}
                onBlur={() => setHoveredRoomId(null)}
                onClick={() => openRoomModal('area-servico')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openRoomModal('area-servico');
                  }
                }}
              >
                <polygon
                  className="room-floor-highlight"
                  points={pts([iso(0.52, 0.52, 0.5), iso(1, 0.52, 0.5), iso(1, 1, 0.5), iso(0.52, 1, 0.5)])}
                  fill="#f8fafc"
                  fillOpacity="0.95"
                  stroke="#004d61"
                  strokeOpacity="0.25"
                  strokeWidth="1.2"
                />

                {/* Parede divisória #004d61 do DML */}
                <IsoBox u1={0.52} v1={0.56} u2={0.545} v2={0.88} z2={56} topFill="#003a49" leftFill="#004d61" rightFill="#003a49" />

                {/* Tanque de Serviço com torneira */}
                <IsoBox u1={0.85} v1={0.55} u2={0.97} v2={0.68} z1={14} z2={25} topFill="#ffffff" leftFill="#e2e8f0" rightFill="#cbd5e1" />
                <IsoBox u1={0.88} v1={0.58} u2={0.94} v2={0.65} z1={25} z2={25.5} topFill="#eef5f7" leftFill="#cbd5e1" rightFill="#94a3b8" />
                <path
                  d={`M ${iso(0.95, 0.61, 25).join(',')} L ${iso(0.95, 0.61, 34).join(',')} L ${iso(0.91, 0.61, 34).join(',')}`}
                  fill="none"
                  stroke="#004d61"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Prateleira de suprimentos e galões 5L */}
                <IsoBox u1={0.57} v1={0.86} u2={0.64} v2={0.94} z2={16} topFill="#004d61" leftFill="#eef5f7" rightFill="#cbd5e1" />
                <IsoBox u1={0.57} v1={0.77} u2={0.64} v2={0.84} z2={16} topFill="#004d61" leftFill="#eef5f7" rightFill="#cbd5e1" />

                {/* Balcão de Limpeza com Esponjas e Palha de Aço */}
                <IsoBox u1={0.66} v1={0.84} u2={0.94} v2={0.96} z2={22} topFill="#ffffff" leftFill="#e2e8f0" rightFill="#cbd5e1" />
                <IsoBox u1={0.7} v1={0.87} u2={0.77} v2={0.93} z1={22} z2={26} topFill="#004d61" leftFill="#003a49" rightFill="#004d61" />
                <IsoBox u1={0.81} v1={0.87} u2={0.88} v2={0.93} z1={22} z2={26} topFill="#475569" leftFill="#334155" rightFill="#1e293b" />

                {/* Balde Espremedor Profissional com Mop */}
                <IsoBox u1={0.61} v1={0.62} u2={0.7} v2={0.71} z2={18} topFill="#004d61" leftFill="#003a49" rightFill="#004d61" />
                <line
                  x1={iso(0.66, 0.66, 16)[0]}
                  y1={iso(0.66, 0.66, 16)[1]}
                  x2={iso(0.68, 0.64, 52)[0]}
                  y2={iso(0.68, 0.64, 52)[1]}
                  stroke="#004d61"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />

                {/* Vassoura Pesada apoiada */}
                <line
                  x1={iso(0.77, 0.60, 6)[0]}
                  y1={iso(0.77, 0.60, 6)[1]}
                  x2={iso(0.77, 0.60, 54)[0]}
                  y2={iso(0.77, 0.60, 54)[1]}
                  stroke="#004d61"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <IsoBox u1={0.74} v1={0.57} u2={0.8} v2={0.63} z2={7} topFill="#004d61" leftFill="#003a49" rightFill="#002b36" />
              </g>

              {/* PINS INTERATIVOS NOS 4 SETORES */}
              {(['cozinha', 'banheiro', 'escritorio', 'area-servico'] as const).map((rId) => {
                const room = findRoom(rId);
                if (!room) return null;
                const pos = CORE_PIN_POSITIONS[rId];
                const [px, py] = iso(pos.u, pos.v, 36);
                const count = getRoomCount(rId);
                const isHovered = hoveredRoomId === rId;

                return (
                  <g
                    key={rId}
                    className="pointer-events-none"
                    transform={`translate(${px}, ${py})`}
                  >
                    <g className={`svg-room-pin ${isHovered ? 'scale-115' : ''}`}>
                      <path
                        d="M0,0 C-10,-14 -16,-22 -16,-31 A16,16 0 1,1 16,-31 C16,-22 10,-14 0,0 Z"
                        fill={isHovered ? '#003a49' : '#004d61'}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      />
                      <circle cx="0" cy="-31" r="6" fill="#ffffff" />
                    </g>

                    <g transform="translate(0, 14)">
                      <rect
                        x="-68"
                        y="0"
                        width="136"
                        height="26"
                        rx="6"
                        fill={isHovered ? '#004d61' : '#ffffff'}
                        stroke="#004d61"
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="17"
                        textAnchor="middle"
                        fill={isHovered ? '#ffffff' : '#004d61'}
                        fontSize="11.5"
                        fontWeight="700"
                        fontFamily="Inter, sans-serif"
                      >
                        {count > 0 ? `${room.shortLabel} (${count})` : room.shortLabel}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Único CTA limpo abaixo da casinha (sem barra redundante de atalhos) */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={onExploreAll}
            className="btn-anim inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-bold text-base shadow-lg cursor-pointer"
          >
            <span>Explorar catálogo completo</span>
            <ArrowRight className="w-5 h-5 icon-right" />
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODAL IN-PLACE DO AMBIENTE ("Caixinha do Ambiente") via Portal    */}
      {/* ================================================================= */}
      {selectedRoom &&
        createPortal(
          <div
            onClick={() => setSelectedRoomId(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9990,
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
              aria-label={`Produtos para ${selectedRoom.label}`}
              className="bg-white w-full sm:max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Cabeçalho do Modal do Ambiente */}
              <div className="px-6 py-5 bg-[#004d61] text-white flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                    {renderLucideIcon(selectedRoom.icon, 'w-5 h-5 text-white')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                        {selectedRoom.label}
                      </h3>
                      <span className="text-xs font-semibold text-white/80 tabular-nums">
                        · {selectedRoomProducts.length}{' '}
                        {selectedRoomProducts.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/85 mt-1 leading-relaxed">
                      {selectedRoom.desc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRoomId(null)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-white/15 text-white transition cursor-pointer shrink-0"
                  aria-label="Fechar janela do ambiente"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo Rolável com Produtos do Ambiente */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#F8FAFC]">
                {selectedRoomProducts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#004d61]/20 p-8 text-center space-y-4">
                    <p className="text-slate-700 font-medium">
                      Em breve novidades cadastradas para este ambiente — clique abaixo para consultar disponibilidade imediata no WhatsApp.
                    </p>
                    <a
                      href={`https://wa.me/${whatsDigits}?text=${encodeURIComponent(
                        `Olá! Gostaria de consultar materiais disponíveis para o setor "${selectedRoom.label}" na Faberminas.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-anim inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#004d61] text-white font-bold text-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Consultar disponibilidade no WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedRoomProducts.map((product) => {
                      const cat = categories.find((c) => c.id === product.category);
                      const isAdded = addedProductId === product.id;
                      const showPhoto = Boolean(product.image) && !brokenImages[product.id];
                      const minQty = Math.max(1, Number(product.qtdMinima) || 1);

                      return (
                        <div
                          key={product.id}
                          onClick={() => setDetailProduct(product)}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-2xs cursor-pointer hover:border-[#004d61]/50 transition"
                        >
                          <div>
                            <div className="h-32 bg-white border-b border-slate-100 flex items-center justify-center overflow-hidden p-2">
                              {showPhoto ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  referrerPolicy="no-referrer"
                                  onError={() =>
                                    setBrokenImages((prev) => ({ ...prev, [product.id]: true }))
                                  }
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-[#eef5f7] text-[#004d61] flex items-center justify-center">
                                  {renderLucideIcon(cat?.icon || 'package', 'w-6 h-6')}
                                </div>
                              )}
                            </div>
                            <div className="p-4 space-y-1">
                              {product.sku && (
                                <span className="block font-mono text-[11px] text-slate-400 tabular-nums">
                                  {product.sku}
                                </span>
                              )}
                              <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                                {product.name}
                              </h4>
                              <p className="text-xs text-slate-600 line-clamp-2">
                                {product.measures && product.measures !== 'Padrão comercial'
                                  ? `${product.measures} · ${product.spec}`
                                  : product.spec}
                              </p>
                            </div>
                          </div>

                          <div className="px-4 pb-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToQuote(product, minQty);
                                setAddedProductId(product.id);
                                setTimeout(() => {
                                  setAddedProductId((prev) =>
                                    prev === product.id ? null : prev
                                  );
                                }, 1200);
                              }}
                              className={`btn-anim w-full min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                                isAdded
                                  ? 'bg-[#003a49] text-white'
                                  : 'bg-[#004d61] hover:bg-[#003a49] text-white'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Adicionado!</span>
                                </>
                              ) : (
                                <>
                                  <ClipboardList className="w-3.5 h-3.5" />
                                  <span>Adicionar à cotação</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Rodapé do Modal com Kit Completo + Link para Catálogo */}
              {selectedRoomProducts.length > 0 && (
                <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedRoom.id;
                      setSelectedRoomId(null);
                      onNavigateRoomCatalog(target);
                    }}
                    className="text-sm font-semibold text-[#004d61] hover:underline cursor-pointer text-center sm:text-left"
                  >
                    Ver setor no catálogo completo →
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onBulkAddRoom(selectedRoomProducts);
                      setKitAdded(true);
                      setTimeout(() => {
                        setSelectedRoomId(null);
                      }, 450);
                    }}
                    className="btn-anim min-h-[46px] px-6 py-3 rounded-xl bg-[#004d61] hover:bg-[#003a49] text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    {kitAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Kit adicionado à cesta!</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4" />
                        <span>
                          Adicionar kit completo do ambiente ({selectedRoomProducts.length})
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Modal de Detalhes do Produto ao clicar dentro do ambiente */}
      <ProductDetailModal
        product={detailProduct}
        categories={categories}
        rooms={rooms}
        onClose={() => setDetailProduct(null)}
        onAddToQuote={onAddToQuote}
        onSelectRoom={(rId) => {
          setDetailProduct(null);
          setSelectedRoomId(null);
          onNavigateRoomCatalog(rId);
        }}
      />
    </section>
  );
};
