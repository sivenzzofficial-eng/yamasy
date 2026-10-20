/**
 * Utility functions for image compression and student avatar presets
 */

export function compressImageFile(
  file: File,
  maxDimension = 800,
  quality = 0.85
): Promise<{ dataUrl: string; width: number; height: number; originalSize: number; compressedSize: number }> {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak didukung'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const fallback = e.target?.result as string;
          resolve({
            dataUrl: fallback,
            width,
            height,
            originalSize,
            compressedSize: Math.round(fallback.length * 0.75),
          });
          return;
        }

        // Draw with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG for universal browser compatibility
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const compressedSize = Math.round(dataUrl.length * 0.75);

        resolve({
          dataUrl,
          width,
          height,
          originalSize,
          compressedSize,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Clean SVG-based school student avatar presets (100% self-contained, no external server dependency)
 */
export const PRESET_AVATARS = [
  {
    id: 'male-1',
    name: 'Siswa Laki-laki (Rapi)',
    url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#E2E8F0"/>
        <circle cx="100" cy="78" r="38" fill="#FBD38D"/>
        <!-- Rambut -->
        <path d="M62 70 C62 40 80 32 100 32 C120 32 138 40 138 70 C138 65 130 50 100 50 C70 50 62 65 62 70 Z" fill="#2D3748"/>
        <!-- Mata & Senyum -->
        <circle cx="88" cy="76" r="3.5" fill="#2D3748"/>
        <circle cx="112" cy="76" r="3.5" fill="#2D3748"/>
        <path d="M92 90 Q100 98 108 90" stroke="#2D3748" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Seragam Putih Biru MTS -->
        <path d="M50 165 L50 135 C50 115 75 110 100 110 C125 110 150 115 150 135 L150 165 Z" fill="#FFFFFF"/>
        <!-- Kerah & Dasi Biru MTS -->
        <path d="M85 110 L100 130 L115 110 Z" fill="#2B6CB0"/>
        <path d="M96 130 L104 130 L107 165 L93 165 Z" fill="#2B6CB0"/>
      </svg>
    `),
  },
  {
    id: 'male-peci',
    name: 'Siswa Berpeci (MTS)',
    url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#EBF8FF"/>
        <!-- Peci Hitam -->
        <rect x="65" y="32" width="70" height="30" rx="4" fill="#1A202C"/>
        <circle cx="100" cy="85" r="36" fill="#FBD38D"/>
        <!-- Mata & Senyum -->
        <circle cx="88" cy="82" r="3.5" fill="#2D3748"/>
        <circle cx="112" cy="82" r="3.5" fill="#2D3748"/>
        <path d="M92 96 Q100 104 108 96" stroke="#2D3748" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Seragam Putih -->
        <path d="M50 170 L50 140 C50 120 75 115 100 115 C125 115 150 120 150 140 L150 170 Z" fill="#FFFFFF"/>
        <!-- Kerah & Dasi Biru -->
        <path d="M85 115 L100 135 L115 115 Z" fill="#3182CE"/>
        <path d="M96 135 L104 135 L107 170 L93 170 Z" fill="#3182CE"/>
      </svg>
    `),
  },
  {
    id: 'female-hijab',
    name: 'Siswi Berhijab (MTS)',
    url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#FAF5FF"/>
        <!-- Kerudung / Jilbab Putih -->
        <path d="M60 70 C60 30 140 30 140 70 C140 120 155 165 155 165 L45 165 C45 165 60 120 60 70 Z" fill="#EDF2F7"/>
        <!-- Wajah -->
        <ellipse cx="100" cy="85" rx="28" ry="32" fill="#FBD38D"/>
        <!-- Inner kerudung -->
        <path d="M72 75 C72 58 128 58 128 75 Z" fill="#CBD5E0"/>
        <!-- Mata & Senyum -->
        <circle cx="89" cy="83" r="3" fill="#2D3748"/>
        <circle cx="111" cy="83" r="3" fill="#2D3748"/>
        <path d="M93 96 Q100 102 107 96" stroke="#2D3748" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Seragam Putih -->
        <path d="M55 165 L55 145 C55 130 80 125 100 125 C120 125 145 130 145 145 L145 165 Z" fill="#FFFFFF"/>
      </svg>
    `),
  },
  {
    id: 'female-1',
    name: 'Siswi Perempuan',
    url: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="#FFF5F5"/>
        <circle cx="100" cy="80" r="36" fill="#FBD38D"/>
        <!-- Rambut Panjang Kuncir -->
        <path d="M58 85 C58 40 80 32 100 32 C120 32 142 40 142 85 C142 120 135 130 135 130 L65 130 C65 130 58 120 58 85 Z" fill="#4A5568"/>
        <ellipse cx="100" cy="82" rx="30" ry="32" fill="#FBD38D"/>
        <!-- Poni -->
        <path d="M70 70 Q100 60 130 70 Q100 50 70 70 Z" fill="#4A5568"/>
        <!-- Mata & Senyum -->
        <circle cx="89" cy="80" r="3.5" fill="#2D3748"/>
        <circle cx="111" cy="80" r="3.5" fill="#2D3748"/>
        <path d="M93 94 Q100 101 107 94" stroke="#2D3748" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Seragam Putih -->
        <path d="M50 165 L50 135 C50 115 75 110 100 110 C125 110 150 115 150 135 L150 165 Z" fill="#FFFFFF"/>
        <!-- Dasi Biru -->
        <path d="M85 110 L100 130 L115 110 Z" fill="#3182CE"/>
        <path d="M96 130 L104 130 L107 165 L93 165 Z" fill="#3182CE"/>
      </svg>
    `),
  },
];
