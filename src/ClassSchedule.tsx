import { useState, useRef } from 'react';
import { Calendar, Clock, BookOpen, ChevronLeft, ChevronRight, User, Phone } from 'lucide-react';

export interface ScheduleItem {
  jamKe?: string | number;
  time: string;
  subject: string;
  code?: string;
  isActivity?: boolean;
}

export interface DaySchedule {
  day: string;
  dayShort: string;
  items: ScheduleItem[];
  piketGuru: string;
  piketHp: string;
}

export const scheduleData71: DaySchedule[] = [
  {
    day: 'Senin',
    dayShort: 'Sen',
    piketGuru: 'Muhamad Rivaldy, S.Pd',
    piketHp: '0858-8790-5697',
    items: [
      { time: '06.50 - 07.00', subject: 'Persiapan Upacara / Shalat Dhuha', isActivity: true },
      { time: '07.00 - 07.40', subject: 'Upacara Bendera', isActivity: true },
      { jamKe: 1, time: '07.40 - 08.20', subject: 'Bahasa Arab', code: '4a' },
      { jamKe: 2, time: '08.20 - 09.00', subject: 'Bahasa Arab', code: '4a' },
      { jamKe: 3, time: '09.00 - 09.40', subject: 'Bahasa Indonesia', code: '15' },
      { jamKe: 4, time: '09.40 - 10.20', subject: 'Bahasa Indonesia', code: '15' },
      { time: '10.20 - 10.50', subject: 'Istirahat (Shalat Dhuha)', isActivity: true },
      { jamKe: 5, time: '10.50 - 11.30', subject: 'Bahasa Arab', code: '4a' },
      { jamKe: 6, time: '11.30 - 12.10', subject: 'Bahasa Indonesia', code: '15' },
      { jamKe: 7, time: '12.10 - 12.50', subject: 'IPA', code: '8' },
      { jamKe: 8, time: '12.50 - 13.30', subject: 'IPA', code: '8' },
      { time: '13.30 - 14.10', subject: 'Shalat Berjama\'ah', isActivity: true },
      {
        time: '14.10 - 15.30',
        subject: 'Ekskul: Angklung / Bimb. BTQ / Bimb. Ibadah / Jurnalistik / Tari Saman',
        isActivity: true,
      },
    ],
  },
  {
    day: 'Selasa',
    dayShort: 'Sel',
    piketGuru: 'Drs. H. M. Yamin Roemly, MM',
    piketHp: '0817-821-918',
    items: [
      { time: '06.50 - 07.00', subject: 'Membaca Do\'a Belajar', isActivity: true },
      { time: '07.00 - 07.10', subject: 'Tadarus Al-Qur\'an', isActivity: true },
      { jamKe: 1, time: '07.10 - 07.50', subject: 'IPS', code: '20' },
      { jamKe: 2, time: '07.50 - 08.30', subject: 'IPS', code: '20' },
      { jamKe: 3, time: '08.30 - 09.10', subject: 'Al-Qur\'an Hadis', code: '17a' },
      { jamKe: 4, time: '09.10 - 09.50', subject: 'Al-Qur\'an Hadis', code: '17a' },
      { time: '09.50 - 10.20', subject: 'Istirahat (Shalat Dhuha)', isActivity: true },
      { jamKe: 5, time: '10.20 - 11.00', subject: 'Baca Tulis Al-Qur\'an (BTQ)', code: 'BTQ' },
      { jamKe: 6, time: '11.00 - 11.40', subject: 'Baca Tulis Al-Qur\'an (BTQ)', code: 'BTQ' },
      { jamKe: 7, time: '11.40 - 12.20', subject: 'Seni Budaya', code: '4b' },
      { jamKe: 8, time: '12.20 - 13.00', subject: 'Seni Budaya', code: '4b' },
      { time: '13.00 - 13.40', subject: 'Shalat Berjama\'ah', isActivity: true },
      { jamKe: 9, time: '13.40 - 14.20', subject: 'Fiqh', code: '13a' },
      { jamKe: 10, time: '14.20 - 15.00', subject: 'Fiqh', code: '13a' },
      { time: '15.00 - 16.20', subject: 'Ekskul Futsal', isActivity: true },
    ],
  },
  {
    day: 'Rabu',
    dayShort: 'Rab',
    piketGuru: 'Firda Lumatul Firdaus, S.Pd',
    piketHp: '0822-1149-6456',
    items: [
      { time: '06.50 - 07.00', subject: 'Membaca Do\'a Belajar', isActivity: true },
      { jamKe: 1, time: '07.00 - 07.40', subject: 'Baca Tulis Al-Qur\'an (BTQ)', code: 'BTQ' },
      { jamKe: 2, time: '07.40 - 08.20', subject: 'Baca Tulis Al-Qur\'an (BTQ)', code: 'BTQ' },
      { jamKe: 3, time: '08.20 - 09.00', subject: 'Informatika', code: '17b' },
      { jamKe: 4, time: '09.00 - 09.40', subject: 'Informatika', code: '17b' },
      { time: '09.40 - 10.20', subject: 'Istirahat (Shalat Dhuha)', isActivity: true },
      { jamKe: 5, time: '10.20 - 11.00', subject: 'Sejarah Kebudayaan Islam (SKI)', code: '12a' },
      { jamKe: 6, time: '11.00 - 11.40', subject: 'Sejarah Kebudayaan Islam (SKI)', code: '12a' },
      { jamKe: 7, time: '11.40 - 12.20', subject: 'IPA', code: '8' },
      { jamKe: 8, time: '12.20 - 13.00', subject: 'IPA', code: '8' },
      { time: '13.00 - 13.40', subject: 'Shalat Berjama\'ah', isActivity: true },
      { jamKe: 9, time: '13.40 - 14.20', subject: 'Matematika', code: '16' },
      { jamKe: 10, time: '14.20 - 15.00', subject: 'Matematika', code: '16' },
    ],
  },
  {
    day: 'Kamis',
    dayShort: 'Kam',
    piketGuru: 'Monang Simangunsong, M.Pd',
    piketHp: '0813-8000-5554',
    items: [
      { time: '06.50 - 07.00', subject: 'Membaca Do\'a Belajar', isActivity: true },
      { jamKe: 1, time: '07.00 - 07.40', subject: 'Penjaskes / Olahraga', code: '11' },
      { jamKe: 2, time: '07.40 - 08.20', subject: 'Penjaskes / Olahraga', code: '11' },
      { jamKe: 3, time: '08.20 - 09.00', subject: 'IPS', code: '20' },
      { jamKe: 4, time: '09.00 - 09.40', subject: 'IPS', code: '20' },
      { time: '09.40 - 10.50', subject: 'Kegiatan PRAMUKA', isActivity: true },
      { time: '10.50 - 11.30', subject: 'Istirahat', isActivity: true },
      { jamKe: 5, time: '11.30 - 12.10', subject: 'Bahasa Indonesia', code: '15' },
      { jamKe: 6, time: '12.10 - 12.50', subject: 'Bahasa Indonesia', code: '15' },
      { time: '12.50 - 13.30', subject: 'Shalat Berjama\'ah', isActivity: true },
      { jamKe: 7, time: '13.30 - 14.10', subject: 'Bahasa Inggris', code: '18' },
      { jamKe: 8, time: '14.10 - 14.50', subject: 'Bahasa Inggris', code: '18' },
      { time: '14.50 - 16.10', subject: 'Ekskul Badminton', isActivity: true },
    ],
  },
  {
    day: 'Jum\'at',
    dayShort: 'Jum',
    piketGuru: 'Siti Hamdah, S.Pd',
    piketHp: '0895-1651-8441',
    items: [
      { time: '06.50 - 07.00', subject: 'Membaca Do\'a Belajar', isActivity: true },
      { jamKe: 1, time: '07.00 - 07.40', subject: 'Akidah Akhlak', code: '12b' },
      { jamKe: 2, time: '07.40 - 08.20', subject: 'Akidah Akhlak', code: '12b' },
      { jamKe: 3, time: '08.20 - 09.00', subject: 'Matematika', code: '16' },
      { jamKe: 4, time: '09.00 - 09.40', subject: 'Matematika', code: '16' },
      { time: '09.40 - 10.10', subject: 'Istirahat (Shalat Dhuha)', isActivity: true },
      { jamKe: 5, time: '10.10 - 10.50', subject: 'Bahasa Inggris', code: '18' },
      { jamKe: 6, time: '10.50 - 11.30', subject: 'Bahasa Inggris', code: '18' },
      { time: '11.30 - 12.50', subject: 'Shalat Jum\'at dan Muhadharah', isActivity: true },
      { time: '12.50 - 13.10', subject: 'Istirahat', isActivity: true },
      { jamKe: 7, time: '13.10 - 14.00', subject: 'PKn', code: '19' },
      { jamKe: 8, time: '14.00 - 14.40', subject: 'PKn', code: '19' },
      { time: '14.40 - 15.50', subject: 'Ekskul Pasus', isActivity: true },
    ],
  },
  {
    day: 'Sabtu',
    dayShort: 'Sab',
    piketGuru: 'Haidar Pratama & Tim',
    piketHp: '0896-2332-5434',
    items: [
      { time: '06.50 - 07.00', subject: 'Membaca Do\'a Belajar', isActivity: true },
      {
        time: '07.00 - 08.20',
        subject: 'Ekskul / Pengembangan Diri (Tari Saman)',
        code: '24',
        isActivity: true,
      },
      {
        time: '08.20 - Selesai',
        subject: 'Pengembangan Diri / Ekstrakurikuler Pilihan',
        isActivity: true,
      },
    ],
  },
];

export function ClassSchedule() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const filteredSchedules =
    selectedDay === 'all'
      ? scheduleData71
      : scheduleData71.filter((d) => d.day.toLowerCase() === selectedDay.toLowerCase());

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      {/* Header Jadwal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-black text-white rounded-lg">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-black tracking-wide">
                JADWAL PELAJARAN KELAS 7.1
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Madrasah Tsanawiyah Al Mursyidiyyah • Tahun Pelajaran 2026/2027
              </p>
            </div>
          </div>
        </div>

        {/* Info Wali Kelas */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-black">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-black">Wali Kelas 7.1: Ricka Dwi Aryani, S.Si</div>
            <div className="text-gray-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>0812-9872-5403</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Navigasi Hari & Tombol Geser */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-3">
        {/* Filter Hari */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setSelectedDay('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap ${
              selectedDay === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua Hari (Senin - Sabtu)
          </button>
          {scheduleData71.map((d) => (
            <button
              key={d.day}
              type="button"
              onClick={() => setSelectedDay(d.day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap ${
                selectedDay === d.day
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d.day}
            </button>
          ))}
        </div>

        {/* Tombol Geser Kiri-Kanan */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-xs text-gray-500 mr-1">Geser jadwal:</span>
          <button
            type="button"
            onClick={scrollLeft}
            className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-black cursor-pointer transition"
            aria-label="Geser Kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-black cursor-pointer transition"
            aria-label="Geser Kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3 sm:hidden">
        Geser ke kanan untuk melihat jadwal hari berikutnya →
      </p>

      {/* Kotak Besar Jadwal Pelajaran (Panjang ke Kanan, Horizontal Scroll) */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 select-none scrollbar-thin"
      >
        {filteredSchedules.map((schedule) => (
          <div
            key={schedule.day}
            className="flex-shrink-0 w-80 sm:w-88 bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col"
          >
            {/* Header Kolom Hari */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
              <div>
                <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                  Hari
                </span>
                <h3 className="text-lg font-bold text-black uppercase">
                  {schedule.day}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-white border border-gray-200 text-black text-xs font-semibold rounded-lg shadow-2xs">
                {schedule.items.length} Kegiatan/Mapel
              </span>
            </div>

            {/* Daftar Jam, Waktu, & Nama Pelajaran/Kegiatan */}
            <div className="space-y-2 flex-1">
              {schedule.items.map((item, idx) => {
                const isActivity = item.isActivity;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border transition ${
                      isActivity
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-white border-gray-200 text-black hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1 font-mono text-gray-600 font-medium">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{item.time}</span>
                      </span>
                      {item.jamKe ? (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-black text-[10px] font-bold rounded">
                          Jam Ke-{item.jamKe}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                          Kegiatan
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm leading-snug">
                        {item.subject}
                      </span>
                      {item.code && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-black text-white text-[11px] font-mono font-bold rounded">
                          {item.code}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Guru Piket */}
            {schedule.piketGuru && (
              <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
                <span className="font-semibold text-black">Guru Piket:</span>{' '}
                <span>{schedule.piketGuru}</span>{' '}
                <span className="text-gray-400">({schedule.piketHp})</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
