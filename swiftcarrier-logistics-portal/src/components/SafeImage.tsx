import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'cargo' | 'logo' | 'airplane' | 'ship' | 'truck' | 'warehouse' | 'port' | 'worker';
}

const FALLBACKS = {
  logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80',
  airplane: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
  cargo: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&auto=format&fit=crop&q=80',
  ship: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&auto=format&fit=crop&q=80',
  truck: 'https://images.unsplash.com/photo-1501700490588-4337a4474791?w=1200&auto=format&fit=crop&q=80',
  warehouse: 'https://images.unsplash.com/photo-1586528115694-9d4ab3c8310d?w=1200&auto=format&fit=crop&q=80',
  port: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
  worker: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80'
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className,
  fallbackType = 'cargo',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!src) {
      setError(true);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(false);
    
    // Convert source URLs cleanly to ensure correct base resolution
    let resolvedSrc = src;
    if (src.startsWith('/src/assets/')) {
      resolvedSrc = window.location.origin + src;
    } else if (src.startsWith('src/assets/')) {
      resolvedSrc = window.location.origin + '/' + src;
    }
    
    setImgSrc(resolvedSrc);
  }, [src]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
    const fallback = FALLBACKS[fallbackType] || FALLBACKS.cargo;
    setImgSrc(fallback);
  };

  return (
    <div className={`relative overflow-hidden bg-slate-950/10 flex items-center justify-center ${className || ''}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px] z-10">
          <Loader2 className="h-5 w-5 animate-spin text-[#ff3c00]" />
        </div>
      )}
      
      {error ? (
        <img
          src={imgSrc}
          alt={alt}
          className="w-full h-full object-cover filter brightness-[0.85] transition-opacity duration-300"
          onLoad={() => setLoading(false)}
          referrerPolicy="no-referrer"
          {...props}
        />
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-500 ${loading ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100 blur-0'}`}
          onLoad={handleLoad}
          onError={handleError}
          referrerPolicy="no-referrer"
          {...props}
        />
      )}
    </div>
  );
};
