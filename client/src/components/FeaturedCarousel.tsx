import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselItem {
  id: string | number;
  title: string;
  description?: string;
  image?: string;
  link?: string;
  badge?: string;
  color?: string;
}

interface FeaturedCarouselProps {
  items: CarouselItem[];
  title: string;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  onItemClick?: (item: CarouselItem) => void;
  renderItem?: (item: CarouselItem, isActive: boolean) => React.ReactNode;
}

export default function FeaturedCarousel({
  items,
  title,
  autoPlayInterval = 5000,
  showIndicators = true,
  showArrows = true,
  onItemClick,
  renderItem,
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-play do carrossel
  useEffect(() => {
    if (!isAutoPlay || items.length <= 1 || isHovering) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlay, items.length, autoPlayInterval, isHovering]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  return (
    <section
      className="py-12 bg-white"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="container mx-auto px-4">
        {/* Título */}
        <h2
          className="text-2xl md:text-3xl font-bold text-center mb-2"
          style={{ color: 'var(--degase-blue-light)' }}
        >
          {title}
        </h2>
        <div
          className="w-16 h-1 mx-auto mb-8"
          style={{ backgroundColor: 'var(--degase-blue-dark)' }}
        />

        {/* Carrossel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Container do slide */}
          <div className="relative overflow-hidden rounded-lg shadow-lg bg-gray-100 min-h-64">
            {/* Slides */}
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                onClick={() => onItemClick?.(item)}
              >
                {renderItem ? (
                  renderItem(item, index === currentIndex)
                ) : (
                  <div className="w-full h-full flex flex-col md:flex-row items-center justify-center p-6 md:p-8">
                    {item.image && (
                      <div className="w-full md:w-1/2 mb-4 md:mb-0 md:mr-6">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-64 md:h-80 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className={`flex-1 ${item.image ? 'md:w-1/2' : 'w-full'}`}>
                      {item.badge && (
                        <span
                          className="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold mb-3"
                          style={{ backgroundColor: 'var(--degase-blue-dark)' }}
                        >
                          {item.badge}
                        </span>
                      )}
                      <h3
                        className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
                        style={{ color: 'var(--degase-blue-dark)' }}
                      >
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3">
                          {item.description}
                        </p>
                      )}
                      {item.link && (
                        <a
                          href={item.link}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
                          style={{ backgroundColor: 'var(--degase-blue-dark)' }}
                        >
                          Saiba Mais
                          <ChevronRight size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Setas de navegação */}
            {showArrows && items.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-all shadow-md"
                  aria-label="Slide anterior"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-all shadow-md"
                  aria-label="Próximo slide"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Indicadores de posição */}
            {showIndicators && items.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentIndex
                        ? 'bg-white w-8 h-2'
                        : 'bg-white/50 w-2 h-2 hover:bg-white/70'
                    }`}
                    aria-label={`Ir para slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Informação do slide atual */}
          {items.length > 1 && (
            <div className="text-center mt-4 text-sm text-gray-600">
              <span style={{ color: 'var(--degase-blue-dark)' }} className="font-semibold">
                {currentIndex + 1}
              </span>
              {' / '}
              <span>{items.length}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
