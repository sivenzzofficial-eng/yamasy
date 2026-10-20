import { useState, useEffect } from 'react';
import { User, AlertCircle, RefreshCw, ZoomIn } from 'lucide-react';

interface StudentPhotoProps {
  src?: string;
  name?: string;
  studentId?: number;
  className?: string;
  imageClassName?: string;
  alt?: string;
  showZoomIcon?: boolean;
  onZoomClick?: () => void;
  onErrorStateChange?: (hasError: boolean) => void;
}

export function StudentPhoto({
  src,
  name,
  studentId,
  className = '',
  imageClassName = '',
  alt,
  showZoomIcon = false,
  onZoomClick,
  onErrorStateChange,
}: StudentPhotoProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src || '');
  const [hasError, setHasError] = useState<boolean>(false);
  const [triedProxy, setTriedProxy] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(src));

  useEffect(() => {
    setCurrentSrc(src || '');
    setHasError(false);
    setTriedProxy(false);
    setIsLoading(Boolean(src));
    if (onErrorStateChange) onErrorStateChange(false);
  }, [src]);

  const handleImageError = () => {
    // If the direct external URL failed and we haven't tried the server proxy yet:
    if (src && src.startsWith('http') && !triedProxy && !src.includes('/api/image-proxy')) {
      setTriedProxy(true);
      setCurrentSrc(`/api/image-proxy?url=${encodeURIComponent(src)}`);
      setIsLoading(true);
      return;
    }

    // Both direct and proxy (or data URL) failed:
    setHasError(true);
    setIsLoading(false);
    if (onErrorStateChange) onErrorStateChange(true);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    if (onErrorStateChange) onErrorStateChange(false);
  };

  const initials = name && name.trim().length > 0
    ? name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : `${studentId || ''}`;

  // If no photo or image has error, show stylish student placeholder
  if (!src || hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 text-gray-500 overflow-hidden select-none border border-gray-200 ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center text-gray-700 font-bold text-base mb-1">
          {initials ? initials : <User className="w-6 h-6 text-gray-400" />}
        </div>
        <span className="text-[11px] font-semibold text-gray-600 truncate max-w-[90%] px-1">
          {name || `Murid #${studentId || ''}`}
        </span>
        <span className="text-[9px] text-gray-400">
          {hasError ? 'Foto tidak dapat dimuat' : 'Belum ada foto'}
        </span>

        {hasError && src && (
          <div
            title="Klik untuk mencoba memuat ulang gambar"
            onClick={(e) => {
              e.stopPropagation();
              setHasError(false);
              setTriedProxy(false);
              setCurrentSrc(src + (src.includes('?') ? '&_r=' : '?_r=') + Date.now());
              setIsLoading(true);
            }}
            className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-white rounded-md shadow-xs text-red-500 hover:text-black cursor-pointer border border-red-200 transition"
          >
            <RefreshCw className="w-3 h-3" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group bg-gray-100 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10 animate-pulse">
          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <img
        src={currentSrc}
        alt={alt || name || `Foto Murid #${studentId || ''}`}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-transform duration-300 ${
          showZoomIcon ? 'group-hover:scale-105' : ''
        } ${imageClassName}`}
      />

      {showZoomIcon && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onZoomClick) onZoomClick();
          }}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
          title="Perbesar Foto"
        >
          <div className="p-2 bg-white/20 backdrop-blur-xs rounded-full border border-white/40">
            <ZoomIn className="w-4 h-4" />
          </div>
        </button>
      )}
    </div>
  );
}
