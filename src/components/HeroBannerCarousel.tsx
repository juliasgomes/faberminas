import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroSlide } from '../types';

interface HeroBannerCarouselProps {
  slides: HeroSlide[];
  onNavigateCta: (ctaLink: string) => void;
}

export const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = ({
  slides,
  onNavigateCta
}) => {
  const activeSlides = slides.filter((s) => s.enabled);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [brokenSlideImages, setBrokenSlideImages] = useState<Record<string, boolean>>({});

  const safeIndex = activeSlides.length > 0 ? currentIndex % activeSlides.length : 0;

  useEffect(() => {
    if (activeSlides.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [activeSlides.length, paused]);

  if (activeSlides.length === 0) return null;

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  return (
    <section
      id="inicio"
      aria-label="Destaques Principais Faberminas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden bg-[#003a49] border-b border-white/15"
    >
      {/* Trilho deslizante suave */}
      <div
        className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${safeIndex * 100}%)` }}
      >
        {activeSlides.map((slide, idx) => {
          const hasImage = Boolean(slide.image) && !brokenSlideImages[slide.id];
          const showBtn = slide.showButton !== false;
          const hasTargetLink = Boolean((slide.ctaLink || '').trim());
          const makeWholeBannerClickable = !showBtn && hasTargetLink;

          const isExternal = hasTargetLink && /^https?:\/\//i.test(slide.ctaLink);
          const slideContent = hasImage ? (
            <>
              <img
                src={slide.image}
                alt={slide.title || `Banner Faberminas ${idx + 1}`}
                referrerPolicy="no-referrer"
                onError={() =>
                  setBrokenSlideImages((prev) => ({ ...prev, [slide.id]: true }))
                }
                className={`absolute inset-0 w-full h-full object-cover ${
                  makeWholeBannerClickable
                    ? 'transition-transform duration-500 group-hover:scale-[1.01]'
                    : ''
                }`}
              />
              {(slide.title || slide.subtitle || (showBtn && slide.ctaLabel)) && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#002b36]/88 via-[#004d61]/65 to-transparent pointer-events-none" />
              )}
              {(slide.title || slide.subtitle || (showBtn && slide.ctaLabel)) && (
                <div className="relative max-w-7xl mx-auto w-full px-10 sm:px-16 py-12 sm:py-16">
                  <div className="max-w-2xl space-y-4">
                    {slide.title && (
                      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight text-balance">
                        {slide.title}
                      </h1>
                    )}
                    {slide.subtitle && (
                      <p className="text-sm sm:text-lg text-white/90 leading-relaxed">
                        {slide.subtitle}
                      </p>
                    )}
                    {showBtn && slide.ctaLabel && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateCta(slide.ctaLink || '#/produtos');
                          }}
                          className="btn-anim min-h-[48px] inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#004d61] font-bold text-sm sm:text-base shadow-xl cursor-pointer"
                        >
                          <span>{slide.ctaLabel}</span>
                          <ArrowRight className="w-4 h-4 icon-right" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="absolute inset-0 hero-glow-overlay pointer-events-none" />
              <div className="relative max-w-7xl mx-auto w-full px-10 sm:px-16 py-12 sm:py-16">
                <div className="max-w-3xl mx-auto text-center">
                  <div className="w-14 h-1.5 rounded-full bg-white mx-auto mb-6" />
                  {idx === 0 ? (
                    <h1 className="text-2xl sm:text-4xl lg:text-[3.1rem] font-extrabold text-white tracking-tight leading-[1.13] mb-5 text-balance">
                      {slide.title}
                    </h1>
                  ) : (
                    <h2 className="text-2xl sm:text-4xl lg:text-[3.1rem] font-extrabold text-white tracking-tight leading-[1.13] mb-5 text-balance">
                      {slide.title}
                    </h2>
                  )}
                  <p className="text-sm sm:text-lg lg:text-xl text-white/90 font-medium leading-relaxed mb-8 max-w-2xl mx-auto">
                    {slide.subtitle}
                  </p>
                  {showBtn && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => onNavigateCta(slide.ctaLink || '#/produtos')}
                        className="btn-anim w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#004d61] font-bold text-sm sm:text-base shadow-xl cursor-pointer"
                      >
                        <span>{slide.ctaLabel || 'Conferir produtos'}</span>
                        <ArrowRight className="w-4 h-4 icon-right" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateCta('#contato')}
                        className="btn-anim w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#004d61]/80 hover:bg-[#004d61] text-white border-2 border-white font-semibold text-sm sm:text-base cursor-pointer"
                      >
                        <span>Entrar em contato</span>
                        <ArrowRight className="w-4 h-4 icon-right" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          );

          const baseClass = hasImage
            ? 'relative w-full min-h-[260px] sm:min-h-[380px] lg:min-h-[440px] flex items-center bg-[#004d61]'
            : 'relative bg-arch-grid-dark min-h-[300px] sm:min-h-[400px] lg:min-h-[430px] flex items-center';

          return (
            <div key={slide.id} className="w-full shrink-0 relative">
              {makeWholeBannerClickable ? (
                <a
                  href={slide.ctaLink}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  onClick={(e) => {
                    if (!isExternal) {
                      e.preventDefault();
                      onNavigateCta(slide.ctaLink);
                    }
                  }}
                  aria-label={slide.title || `Acessar destaque ${idx + 1}`}
                  className={`${baseClass} cursor-pointer group block`}
                >
                  {slideContent}
                </a>
              ) : (
                <div className={baseClass}>{slideContent}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Setas < > de navegação do carrossel */}
      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Slide anterior"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#004d61] shadow-lg flex items-center justify-center transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Próximo slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#004d61] shadow-lg flex items-center justify-center transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots de paginação */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
            {activeSlides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir para slide ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === safeIndex ? 'w-7 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
