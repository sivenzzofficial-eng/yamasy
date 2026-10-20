import { useEffect, useRef } from 'react';
import { ExternalLink, Info, Code, Calendar } from 'lucide-react';

export type FeaturePosition = 'top_banner' | 'between_banner_and_desc' | 'below_desc' | 'bottom_page';
export type FeatureType = 'custom_code' | 'info_box' | 'button_link' | 'schedule_table';

export interface CustomFeature {
  id: string;
  title: string;
  type: FeatureType;
  position: FeaturePosition;
  content: string;
  buttonUrl?: string;
  buttonText?: string;
  isActive: boolean;
  createdAt: string;
}

interface CustomFeatureRendererProps {
  feature: CustomFeature;
}

export function CustomFeatureRenderer({ feature }: CustomFeatureRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-resize iframe for custom_code type
  useEffect(() => {
    if (feature.type === 'custom_code' && iframeRef.current) {
      const iframe = iframeRef.current;
      const handleLoad = () => {
        try {
          if (iframe.contentWindow?.document?.body) {
            const h = iframe.contentWindow.document.body.scrollHeight;
            iframe.style.height = `${Math.max(h + 20, 100)}px`;
          }
        } catch {
          iframe.style.height = '240px';
        }
      };

      iframe.addEventListener('load', handleLoad);
      return () => iframe.removeEventListener('load', handleLoad);
    }
  }, [feature.content, feature.type]);

  if (!feature.isActive) return null;

  // 1. Tipe: Custom Code / Codingan Custom (HTML, CSS, JS, Iframe, Widget)
  if (feature.type === 'custom_code') {
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <style>
            body {
              margin: 0;
              padding: 12px;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #111827;
              background-color: transparent;
            }
          </style>
        </head>
        <body>
          ${feature.content || '<div class="text-gray-400 text-sm">Codingan kosong</div>'}
        </body>
      </html>
    `;

    return (
      <div className="w-full bg-white border border-gray-200 rounded-xl p-4 shadow-sm my-4 overflow-hidden">
        {feature.title && (
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <Code className="w-4 h-4 text-gray-700" />
            <h3 className="font-bold text-sm sm:text-base text-black">{feature.title}</h3>
          </div>
        )}
        <iframe
          ref={iframeRef}
          srcDoc={fullHtml}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          className="w-full border-0 rounded overflow-hidden min-h-[90px] block transition-all"
          title={feature.title || 'Custom UI Code'}
        />
      </div>
    );
  }

  // 2. Tipe: Info Box (Kotak Informasi / Teks Penting)
  if (feature.type === 'info_box') {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-xl p-5 shadow-sm my-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-black" />
          <h3 className="font-bold text-base text-black">{feature.title}</h3>
        </div>
        <div className="text-black text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
          {feature.content || '(Teks informasi kosong)'}
        </div>
      </div>
    );
  }

  // 3. Tipe: Tombol Aksi / Link Eksternal
  if (feature.type === 'button_link') {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-xl p-5 shadow-sm my-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-black">{feature.title}</h3>
          {feature.content && (
            <p className="text-sm text-gray-600 mt-1">{feature.content}</p>
          )}
        </div>
        {feature.buttonUrl && (
          <a
            href={feature.buttonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-medium text-sm rounded-xl hover:bg-gray-800 transition whitespace-nowrap cursor-pointer shadow-sm"
          >
            <span>{feature.buttonText || 'Buka Link'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    );
  }

  // 4. Tipe: Tabel Jadwal / Piket
  if (feature.type === 'schedule_table') {
    const lines = (feature.content || '').split('\n').filter((l) => l.trim().length > 0);
    return (
      <div className="w-full bg-white border border-gray-200 rounded-xl p-5 shadow-sm my-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-black" />
          <h3 className="font-bold text-base text-black">{feature.title}</h3>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm text-black">
            <tbody className="divide-y divide-gray-200">
              {lines.map((line, idx) => {
                const parts = line.split('|').map((p) => p.trim());
                if (idx === 0 && parts.length > 1) {
                  return (
                    <tr key={idx} className="bg-gray-100 font-semibold text-xs text-gray-700 uppercase">
                      {parts.map((cell, cIdx) => (
                        <th key={cIdx} className="px-4 py-2.5 border-r border-gray-200 last:border-0">
                          {cell}
                        </th>
                      ))}
                    </tr>
                  );
                }
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    {parts.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 border-r border-gray-200 last:border-0 text-sm">
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}
