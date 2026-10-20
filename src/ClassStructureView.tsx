import { Users, Award, Shield } from 'lucide-react';

export interface SeksiItem {
  id: string;
  seksiName: string;
  personName: string;
}

export interface ClassStructure {
  waliKelas: string;
  ketuaKelas: string;
  wakilKetua: string;
  sekretaris1: string;
  sekretaris2: string;
  bendahara1: string;
  bendahara2: string;
  seksiList: SeksiItem[];
}

interface ClassStructureViewProps {
  structure: ClassStructure;
}

export function ClassStructureView({ structure }: ClassStructureViewProps) {
  const seksiItems = structure.seksiList || [];

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm overflow-x-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
        <span className="p-2 bg-black text-white rounded-lg">
          <Users className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-black tracking-wide">
            STRUKTUR ORGANISASI KELAS 7.1
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Kepengurusan Kelas MTs Al-Mursyidiyyah
          </p>
        </div>
      </div>

      {/* Diagram Bagan Struktur (Scrollable jika layar kecil) */}
      <div className="min-w-[620px] flex flex-col items-center py-4 select-none">
        {/* LEVEL 1: WALI KELAS */}
        <div className="flex flex-col items-center">
          <div className="w-64 bg-white border-2 border-black rounded-xl p-3.5 shadow-sm text-center relative hover:shadow-md transition">
            <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-1">
              <Award className="w-3.5 h-3.5" />
            </div>
            {/* Tebel tulisan wali kelasnya */}
            <div className="font-extrabold text-sm uppercase text-black tracking-wider">
              Wali Kelas
            </div>
            {/* Di bawah teks wali kelas ada teks lagi yaitu namanya */}
            <div className="mt-1 text-sm font-semibold text-gray-900 border-t border-gray-100 pt-1">
              {structure.waliKelas || '(Belum Diisi)'}
            </div>
          </div>

          {/* Garis & Panah ke Bawah dari Wali Kelas */}
          <div className="w-0.5 h-6 bg-black" />
          {/* Garis Horizontal ke Kiri dan Kanan */}
          <div className="w-96 h-0.5 bg-black relative">
            {/* Titik persimpangan */}
            <div className="absolute left-1/2 -top-1 -translate-x-1/2 w-2 h-2 rounded-full bg-black" />
          </div>
        </div>

        {/* LEVEL 2: KETUA KELAS & WAKIL KETUA KELAS (2 Panah Kiri dan Kanan) */}
        <div className="w-96 flex justify-between relative mt-0">
          {/* Cabang Kiri: Ketua Kelas */}
          <div className="flex flex-col items-center -ml-24 sm:-ml-20">
            {/* Panah ke bawah kiri */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-black" />
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-black -mt-0.5" />
            </div>
            {/* Kotak Kecil Ketua Kelas */}
            <div className="w-56 bg-white border-2 border-gray-900 rounded-xl p-3 shadow-sm text-center hover:shadow-md transition mt-1">
              <div className="font-extrabold text-xs uppercase text-black tracking-wider">
                Ketua Kelas
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-900 border-t border-gray-100 pt-1">
                {structure.ketuaKelas || '-'}
              </div>
            </div>
          </div>

          {/* Cabang Kanan: Wakil Ketua Kelas */}
          <div className="flex flex-col items-center -mr-24 sm:-mr-20">
            {/* Panah ke bawah kanan */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-black" />
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-black -mt-0.5" />
            </div>
            {/* Kotak Kecil Wakil Ketua Kelas */}
            <div className="w-56 bg-white border-2 border-gray-900 rounded-xl p-3 shadow-sm text-center hover:shadow-md transition mt-1">
              <div className="font-extrabold text-xs uppercase text-black tracking-wider">
                Wakil Ketua Kelas
              </div>
              <div className="mt-1 text-sm font-semibold text-gray-900 border-t border-gray-100 pt-1">
                {structure.wakilKetua || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Garis Penghubung Turun ke Sekretaris & Bendahara */}
        <div className="flex flex-col items-center mt-3">
          <div className="w-0.5 h-6 bg-gray-400" />
          <div className="w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-gray-400 -mt-0.5" />
        </div>

        {/* LEVEL 3: SEKRETARIS & BENDAHARA */}
        <div className="w-full max-w-2xl mt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Sekretaris 1 */}
            <div className="bg-white border border-gray-300 rounded-xl p-2.5 shadow-xs text-center">
              <div className="font-bold text-xs uppercase text-black">
                Sekretaris 1
              </div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-gray-800 border-t border-gray-100 pt-1">
                {structure.sekretaris1 || '-'}
              </div>
            </div>

            {/* Sekretaris 2 */}
            <div className="bg-white border border-gray-300 rounded-xl p-2.5 shadow-xs text-center">
              <div className="font-bold text-xs uppercase text-black">
                Sekretaris 2
              </div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-gray-800 border-t border-gray-100 pt-1">
                {structure.sekretaris2 || '-'}
              </div>
            </div>

            {/* Bendahara 1 */}
            <div className="bg-white border border-gray-300 rounded-xl p-2.5 shadow-xs text-center">
              <div className="font-bold text-xs uppercase text-black">
                Bendahara 1
              </div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-gray-800 border-t border-gray-100 pt-1">
                {structure.bendahara1 || '-'}
              </div>
            </div>

            {/* Bendahara 2 */}
            <div className="bg-white border border-gray-300 rounded-xl p-2.5 shadow-xs text-center">
              <div className="font-bold text-xs uppercase text-black">
                Bendahara 2
              </div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-gray-800 border-t border-gray-100 pt-1">
                {structure.bendahara2 || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Garis Penghubung Turun ke Seksi-Seksi Bidang */}
        {seksiItems.length > 0 && (
          <>
            <div className="flex flex-col items-center mt-3">
              <div className="w-0.5 h-6 bg-gray-400" />
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-gray-400 -mt-0.5" />
            </div>

            {/* LEVEL 4: SEKSI-SEKSI BIDANG (.update f6: dinamis ganti 'sie' jadi 'seksi') */}
            <div className="w-full max-w-2xl mt-2">
              <div className="text-center mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Seksi - Seksi Bidang
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {seksiItems.map((seksi) => (
                  <div
                    key={seksi.id}
                    className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-xs text-center hover:border-gray-300 transition"
                  >
                    <div className="font-bold text-xs text-black flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3 text-gray-600" />
                      <span>{seksi.seksiName || 'Seksi'}</span>
                    </div>
                    <div className="mt-1 text-xs sm:text-sm font-medium text-gray-800 border-t border-gray-100 pt-1">
                      {seksi.personName || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
