import { useState, useEffect, useRef, FormEvent } from 'react';
import {
  ShieldAlert,
  ArrowLeft,
  ArrowUp,
  Lock,
  LogOut,
  LayoutDashboard,
  Users,
  User,
  Activity,
  UserCheck,
  Ban,
  RotateCcw,
  Trash2,
  Save,
  CheckCircle,
  AlertTriangle,
  KeyRound,
  FileText,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Plus,
  Layers,
  Code,
  Sliders,
  Check,
  X,
  ExternalLink,
  Calendar,
  Upload,
  Image as ImageIcon,
  Camera,
} from 'lucide-react';
import {
  CustomFeatureRenderer,
  CustomFeature,
  FeaturePosition,
  FeatureType,
} from './CustomFeatureRenderer';
import { ClassSchedule } from './ClassSchedule';
import { ClassStructureView, ClassStructure } from './ClassStructureView';

interface BroadcastBanner {
  id: string;
  imageUrl: string;
  overlayText: string;
}

interface Student {
  id: number;
  image: string;
  name: string;
  birthDate: string;
  hobby: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  description: string;
  title?: string;
  createdAt?: string;
}

interface Visitor {
  ip: string;
  firstSeen: string;
  lastSeen: string;
  visitCount: number;
  isBanned: boolean;
  bannedUntil: number | null;
  banReason?: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  ip: string;
  details?: string;
}

// Safe fetch utility that never throws on non-JSON or HTML responses
async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = (await res.json()) as T;
      return { ok: res.ok, status: res.status, data };
    }
    const text = await res.text();
    try {
      const data = JSON.parse(text) as T;
      return { ok: res.ok, status: res.status, data };
    } catch {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: res.ok ? 'Format data respons tidak valid.' : `Server error (Status ${res.status})`,
      };
    }
  } catch (err: any) {
    return { ok: false, status: 0, data: null, error: err?.message || 'Gagal terhubung ke server.' };
  }
}

// Helper to normalize image URLs (converts Google Drive share links, Dropbox, etc. to direct image URLs)
function normalizeImageUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const url = rawUrl.trim();
  if (url.startsWith('data:image/')) return url;

  // Google Drive format 1: https://drive.google.com/file/d/FILE_ID/view...
  const gDriveMatch1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (gDriveMatch1) {
    return `https://lh3.googleusercontent.com/d/${gDriveMatch1[1]}`;
  }
  // Google Drive format 2: https://drive.google.com/open?id=FILE_ID or ?id=FILE_ID
  const gDriveMatch2 = url.match(/drive\.google\.com\/(?:open|uc)\?.*id=([a-zA-Z0-9_-]+)/);
  if (gDriveMatch2) {
    return `https://lh3.googleusercontent.com/d/${gDriveMatch2[1]}`;
  }
  // Dropbox: dl=0 -> raw=1
  if (url.includes('dropbox.com') && url.includes('dl=0')) {
    return url.replace('dl=0', 'raw=1');
  }
  return url;
}

// Resilient student card image component with fallback and referrer bypass
function StudentCardImage({ image, name }: { image?: string; name?: string }) {
  const [hasError, setHasError] = useState<boolean>(false);
  const normalized = normalizeImageUrl(image || '');

  useEffect(() => {
    setHasError(false);
  }, [normalized]);

  if (!normalized || hasError) {
    return (
      <div className="w-full h-40 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 gap-1.5 select-none p-2 text-center">
        <User className="w-9 h-9 text-gray-300" />
        <span className="text-xs">
          {hasError ? 'Foto gagal dimuat' : 'Foto belum diisi'}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-40 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden relative">
      <img
        src={normalized}
        alt={name || 'Foto Siswa'}
        className="w-full h-full object-cover rounded-lg transition-transform duration-300 hover:scale-105"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function App() {
  // Screens: 'home' | 'login' | 'admin'
  const [currentScreen, setCurrentScreen] = useState<'home' | 'login' | 'admin'>('home');

  // Main data state (from server)
  const [broadcastBanners, setBroadcastBanners] = useState<BroadcastBanner[]>([
    {
      id: 'b-1',
      imageUrl: 'https://files.catbox.moe/twd2b4.png',
      overlayText: 'Broadcast Pengumuman Penting Kelas 7.1 MTS Al-Mursyidiyyah',
    },
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isSlidePaused, setIsSlidePaused] = useState<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);

  const [descriptionText, setDescriptionText] = useState<string>('text deks 1');
  const [students, setStudents] = useState<Student[]>([]);
  const [customFeatures, setCustomFeatures] = useState<CustomFeature[]>([]);
  const [clientIp, setClientIp] = useState<string>('');

  // Fitur Bar: Scroll otomatis ke bagian halaman & Tombol Kembali ke Atas
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 220);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -75;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  // Dropdown header
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Login & IP Ban state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [showFailModal, setShowFailModal] = useState<boolean>(false);
  const [banCountdown, setBanCountdown] = useState<number>(0);
  const [isCurrentlyBanned, setIsCurrentlyBanned] = useState<boolean>(false);

  // Admin Dashboard state
  const [adminTab, setAdminTab] = useState<'broadcast' | 'features' | 'structure' | 'content' | 'students' | 'ip' | 'logs' | 'security'>('broadcast');

  // Struktur Organisasi Kelas state (.f6 & .update f6)
  const defaultClassStructure: ClassStructure = {
    waliKelas: 'Ricka Dwi Aryani, S.Si',
    ketuaKelas: '',
    wakilKetua: '',
    sekretaris1: '',
    sekretaris2: '',
    bendahara1: '',
    bendahara2: '',
    seksiList: [
      { id: 'seksi-1', seksiName: 'Seksi Kebersihan', personName: '' },
      { id: 'seksi-2', seksiName: 'Seksi Keamanan', personName: '' },
      { id: 'seksi-3', seksiName: 'Seksi Keagamaan', personName: '' },
      { id: 'seksi-4', seksiName: 'Seksi Olahraga', personName: '' },
    ],
  };
  const [classStructure, setClassStructure] = useState<ClassStructure>(defaultClassStructure);
  const [structureForm, setStructureForm] = useState<ClassStructure>(defaultClassStructure);
  const [newSeksiTitle, setNewSeksiTitle] = useState<string>('');
  const [newSeksiPerson, setNewSeksiPerson] = useState<string>('');

  // Broadcast Admin states
  const [newSlideImageUrl, setNewSlideImageUrl] = useState<string>('');
  const [newSlideOverlayText, setNewSlideOverlayText] = useState<string>('');

  // Custom UI & Feature Builder state (Update f3)
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [featTitle, setFeatTitle] = useState<string>('');
  const [featType, setFeatType] = useState<FeatureType>('custom_code');
  const [featPosition, setFeatPosition] = useState<FeaturePosition>('between_banner_and_desc');
  const [featContent, setFeatContent] = useState<string>('');
  const [featButtonUrl, setFeatButtonUrl] = useState<string>('');
  const [featButtonText, setFeatButtonText] = useState<string>('Buka Link');
  const [featIsActive, setFeatIsActive] = useState<boolean>(true);

  // Description Admin state
  const [adminDescInput, setAdminDescInput] = useState<string>('');

  // Students Admin state
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [studentForm, setStudentForm] = useState<Student>({
    id: 1,
    image: '',
    name: '',
    birthDate: '',
    hobby: '',
  });

  // Security / Password change state
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string>('');
  const [passwordChangeError, setPasswordChangeError] = useState<string>('');

  // Visitors & Logs state
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [actionNotice, setActionNotice] = useState<string>('');

  // Fetch initial public data from server
  const fetchData = async () => {
    try {
      const { ok, data } = await safeFetchJson('/api/data');
      if (ok && data) {
        if (Array.isArray(data.broadcastBanners) && data.broadcastBanners.length > 0) {
          setBroadcastBanners(data.broadcastBanners);
        } else if (data.bannerImage) {
          setBroadcastBanners([
            { id: 'b-1', imageUrl: data.bannerImage, overlayText: '' },
          ]);
        }
        setDescriptionText(data.descriptionText ?? '');
        setStudents(data.students ?? []);
        if (Array.isArray(data.customFeatures)) {
          setCustomFeatures(data.customFeatures);
        }
        if (data.classStructure) {
          setClassStructure(data.classStructure);
          setStructureForm(data.classStructure);
        }
        setClientIp(data.clientIp ?? '');
        setAdminDescInput(data.descriptionText ?? '');

        if (data.banInfo && data.banInfo.isBanned) {
          setIsCurrentlyBanned(true);
          setBanCountdown(data.banInfo.remainingSeconds > 0 ? data.banInfo.remainingSeconds : 300);
        } else {
          setIsCurrentlyBanned(false);
          setBanCountdown(0);
        }
      }
    } catch (err) {
      console.error('Failed to load server data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Automatic Banner Slide Carousel (4.5 seconds per slide)
  useEffect(() => {
    if (broadcastBanners.length <= 1 || isSlidePaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % broadcastBanners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [broadcastBanners.length, isSlidePaused]);

  // Touch Swipe handlers for banner
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
  };

  const nextSlide = () => {
    if (broadcastBanners.length <= 1) return;
    setCurrentSlideIndex((prev) => (prev + 1) % broadcastBanners.length);
  };

  const prevSlide = () => {
    if (broadcastBanners.length <= 1) return;
    setCurrentSlideIndex((prev) =>
      prev === 0 ? broadcastBanners.length - 1 : prev - 1
    );
  };

  // Sync selected student into form
  useEffect(() => {
    const target = students.find((s) => s.id === selectedStudentId);
    if (target) {
      setStudentForm({ ...target });
    }
  }, [selectedStudentId, students]);

  // Countdown timer for IP ban
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (banCountdown > 0) {
      timer = setInterval(() => {
        setBanCountdown((prev) => {
          if (prev <= 1) {
            setIsCurrentlyBanned(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [banCountdown]);

  // Close profile menu when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAdminVisitors = async () => {
    try {
      const { ok, data } = await safeFetchJson('/api/admin/visitors');
      if (ok && data?.visitors) setVisitors(data.visitors);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAdminLogs = async () => {
    try {
      const { ok, data } = await safeFetchJson('/api/admin/logs');
      if (ok && data?.logs) setActivityLogs(data.logs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (currentScreen === 'admin') {
      loadAdminVisitors();
      loadAdminLogs();
    }
  }, [currentScreen]);

  // Handle Login submission
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!passwordInput) {
      setLoginError('Masukkan password angka terlebih dahulu.');
      return;
    }

    try {
      const { ok, data, error } = await safeFetchJson('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (ok && data?.success) {
        setIsAdminAuthenticated(true);
        setPasswordInput('');
        setCurrentScreen('admin');
        fetchData();
        loadAdminVisitors();
        loadAdminLogs();
      } else {
        // Login failed: IP is banned for 5 minutes
        setIsCurrentlyBanned(true);
        setBanCountdown(data?.remainingSeconds || 300);
        setShowFailModal(true);
        setPasswordInput('');
        if (error) setLoginError(error);
      }
    } catch (err) {
      setLoginError('Gagal menghubungi server.');
    }
  };

  // Broadcast banner handlers
  const handleAddBroadcastSlide = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSlideImageUrl.trim()) {
      notifyAction('URL foto banner wajib diisi!');
      return;
    }
    try {
      const { ok, data } = await safeFetchJson('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: newSlideImageUrl,
          overlayText: newSlideOverlayText,
        }),
      });
      if (ok && data?.success) {
        setBroadcastBanners(data.broadcastBanners);
        setNewSlideImageUrl('');
        setNewSlideOverlayText('');
        notifyAction('Slide banner broadcast baru berhasil ditambahkan!');
        loadAdminLogs();
      } else {
        notifyAction(data?.message || 'Gagal menambahkan slide');
      }
    } catch {
      notifyAction('Gagal menghubungi server.');
    }
  };

  const handleUpdateBroadcastSlide = async (id: string, imageUrl: string, overlayText: string) => {
    try {
      const { ok, data } = await safeFetchJson(`/api/admin/broadcast/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, overlayText }),
      });
      if (ok && data?.success) {
        setBroadcastBanners(data.broadcastBanners);
        notifyAction('Slide broadcast berhasil diperbarui!');
        loadAdminLogs();
      }
    } catch {
      notifyAction('Gagal menyimpan perubahan slide.');
    }
  };

  const handleDeleteBroadcastSlide = async (id: string) => {
    if (broadcastBanners.length <= 1) {
      notifyAction('Minimal harus ada 1 slide banner broadcast!');
      return;
    }
    try {
      const { ok, data } = await safeFetchJson(`/api/admin/broadcast/${id}`, {
        method: 'DELETE',
      });
      if (ok && data?.success) {
        setBroadcastBanners(data.broadcastBanners);
        setCurrentSlideIndex(0);
        notifyAction('Slide broadcast berhasil dihapus!');
        loadAdminLogs();
      } else {
        notifyAction(data?.message || 'Gagal menghapus slide');
      }
    } catch {
      notifyAction('Gagal menghubungi server.');
    }
  };

  // ==========================================
  // CUSTOM UI & FEATURE BUILDER HANDLERS (Update f3)
  // ==========================================
  const handleSaveFeature = async (e: FormEvent) => {
    e.preventDefault();
    if (!featTitle.trim()) {
      notifyAction('Judul fitur wajib diisi!');
      return;
    }

    try {
      const payload = {
        title: featTitle,
        type: featType,
        position: featPosition,
        content: featContent,
        buttonUrl: featButtonUrl,
        buttonText: featButtonText,
        isActive: featIsActive,
      };

      if (editingFeatureId) {
        // Update existing feature
        const { ok, data } = await safeFetchJson(`/api/admin/features/${editingFeatureId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (ok && data?.success) {
          setCustomFeatures(data.customFeatures);
          resetFeatureForm();
          notifyAction(`Fitur "${payload.title}" berhasil diperbarui!`);
          loadAdminLogs();
        } else {
          notifyAction(data?.message || 'Gagal memperbarui fitur');
        }
      } else {
        // Create new feature
        const { ok, data } = await safeFetchJson('/api/admin/features', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (ok && data?.success) {
          setCustomFeatures(data.customFeatures);
          resetFeatureForm();
          notifyAction(`Fitur baru "${payload.title}" berhasil dibuat dan dipasang!`);
          loadAdminLogs();
        } else {
          notifyAction(data?.message || 'Gagal membuat fitur');
        }
      }
    } catch {
      notifyAction('Gagal menghubungi server.');
    }
  };

  const handleEditFeature = (f: CustomFeature) => {
    setEditingFeatureId(f.id);
    setFeatTitle(f.title);
    setFeatType(f.type);
    setFeatPosition(f.position);
    setFeatContent(f.content);
    setFeatButtonUrl(f.buttonUrl || '');
    setFeatButtonText(f.buttonText || 'Buka Link');
    setFeatIsActive(f.isActive);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteFeature = async (id: string, title: string) => {
    try {
      const { ok, data } = await safeFetchJson(`/api/admin/features/${id}`, {
        method: 'DELETE',
      });
      if (ok && data?.success) {
        setCustomFeatures(data.customFeatures);
        if (editingFeatureId === id) {
          resetFeatureForm();
        }
        notifyAction(`Fitur "${title}" berhasil dihapus.`);
        loadAdminLogs();
      } else {
        notifyAction('Gagal menghapus fitur');
      }
    } catch {
      notifyAction('Gagal menghubungi server.');
    }
  };

  const handleToggleFeatureStatus = async (f: CustomFeature) => {
    try {
      const { ok, data } = await safeFetchJson(`/api/admin/features/${f.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !f.isActive }),
      });
      if (ok && data?.success) {
        setCustomFeatures(data.customFeatures);
        notifyAction(`Fitur "${f.title}" ${!f.isActive ? 'diaktifkan' : 'dinonaktifkan'}.`);
        loadAdminLogs();
      }
    } catch {
      notifyAction('Gagal mengubah status fitur.');
    }
  };

  const resetFeatureForm = () => {
    setEditingFeatureId(null);
    setFeatTitle('');
    setFeatType('custom_code');
    setFeatPosition('between_banner_and_desc');
    setFeatContent('');
    setFeatButtonUrl('');
    setFeatButtonText('Buka Link');
    setFeatIsActive(true);
  };

  // Helper templates for quick codingan
  const insertCodeTemplate = (templateType: 'clock' | 'welcome' | 'whatsapp') => {
    if (templateType === 'clock') {
      setFeatTitle('Jam Digital Kelas');
      setFeatType('custom_code');
      setFeatContent(`<div class="p-4 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
  <div class="text-xs uppercase font-bold text-gray-500 tracking-wider mb-1">Waktu Sekarang</div>
  <div id="live-clock" class="text-3xl font-mono font-bold text-black">--:--:--</div>
  <div id="live-date" class="text-xs text-gray-600 mt-1"></div>
</div>
<script>
  function updateTime() {
    const now = new Date();
    const clockEl = document.getElementById('live-clock');
    const dateEl = document.getElementById('live-date');
    if (clockEl) clockEl.innerText = now.toLocaleTimeString('id-ID');
    if (dateEl) dateEl.innerText = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  updateTime();
  setInterval(updateTime, 1000);
</script>`);
    } else if (templateType === 'welcome') {
      setFeatTitle('Pesan Sambutan Kelas 7.1');
      setFeatType('info_box');
      setFeatContent(`Selamat datang di portal resmi KELAS 7.1 MTS AL-MURSYIDIYYAH!
Jaga selalu kekompakan, semangat belajar, dan saling menghormati antar teman.`);
    } else if (templateType === 'whatsapp') {
      setFeatTitle('Grup Diskusi & Belajar Kelas');
      setFeatType('button_link');
      setFeatContent('Akses tautan resmi untuk koordinasi tugas dan info kelas bersama.');
      setFeatButtonText('Gabung Grup WhatsApp');
      setFeatButtonUrl('https://wa.me/6288245340881');
    }
  };

  // Admin save Class Structure (.f6)
  const handleSaveStructure = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { ok, data } = await safeFetchJson('/api/admin/structure', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classStructure: structureForm }),
      });
      if (ok && data?.success) {
        setClassStructure(data.classStructure);
        notifyAction('Struktur organisasi kelas berhasil diperbarui!');
        loadAdminLogs();
      } else {
        notifyAction(data?.message || 'Gagal menyimpan struktur kelas');
      }
    } catch {
      notifyAction('Gagal menghubungi server.');
    }
  };

  const handleAddSeksi = (e: FormEvent) => {
    e.preventDefault();
    if (!newSeksiTitle.trim()) {
      notifyAction('Nama seksi wajib diisi!');
      return;
    }
    const newId = `seksi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const updated = [
      ...(structureForm.seksiList || []),
      {
        id: newId,
        seksiName: newSeksiTitle.trim(),
        personName: newSeksiPerson.trim(),
      },
    ];
    setStructureForm({ ...structureForm, seksiList: updated });
    setNewSeksiTitle('');
    setNewSeksiPerson('');
    notifyAction(`Seksi "${newSeksiTitle.trim()}" ditambahkan! Tekan Simpan Perubahan untuk menyimpan.`);
  };

  const handleUpdateSeksi = (id: string, seksiName: string, personName: string) => {
    const updated = (structureForm.seksiList || []).map((s) =>
      s.id === id ? { ...s, seksiName, personName } : s
    );
    setStructureForm({ ...structureForm, seksiList: updated });
  };

  const handleDeleteSeksi = (id: string, seksiName: string) => {
    const updated = (structureForm.seksiList || []).filter((s) => s.id !== id);
    setStructureForm({ ...structureForm, seksiList: updated });
    notifyAction(`Seksi "${seksiName}" dihapus. Tekan Simpan Perubahan untuk menyimpan.`);
  };

  // Admin save Description
  const handleSaveDescription = async () => {
    try {
      const { ok } = await safeFetchJson('/api/admin/description', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptionText: adminDescInput }),
      });
      if (ok) {
        setDescriptionText(adminDescInput);
        notifyAction('Teks deskripsi berhasil diperbarui!');
        loadAdminLogs();
      }
    } catch {
      notifyAction('Gagal menyimpan deskripsi.');
    }
  };

  const handleDeleteDescription = async () => {
    try {
      const { ok } = await safeFetchJson('/api/admin/description', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptionText: '' }),
      });
      if (ok) {
        setDescriptionText('');
        setAdminDescInput('');
        notifyAction('Teks deskripsi berhasil dihapus/dikosongkan.');
        loadAdminLogs();
      }
    } catch {
      notifyAction('Gagal menghapus teks.');
    }
  };

  // Admin save Student
  const handleSaveStudent = async () => {
    try {
      const { ok, data } = await safeFetchJson(`/api/admin/student/${studentForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm),
      });
      if (ok && data?.student) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentForm.id ? data.student : s))
        );
        notifyAction(`Data murid #${studentForm.id} berhasil disimpan!`);
        loadAdminLogs();
      }
    } catch {
      notifyAction('Gagal menyimpan data murid.');
    }
  };

  // Admin delete/clear Student
  const handleDeleteStudent = async (id: number) => {
    try {
      const { ok, data } = await safeFetchJson(`/api/admin/student/${id}`, {
        method: 'DELETE',
      });
      if (ok && data?.student) {
        setStudents((prev) =>
          prev.map((s) => (s.id === id ? data.student : s))
        );
        setStudentForm({
          id,
          image: '',
          name: '',
          birthDate: '',
          hobby: '',
        });
        notifyAction(`Data murid #${id} berhasil dikosongkan/dihapus.`);
        loadAdminLogs();
      }
    } catch {
      notifyAction('Gagal mengosongkan data murid.');
    }
  };

  // Admin change Password
  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    if (!newPasswordInput || !/^\d+$/.test(newPasswordInput)) {
      setPasswordChangeError('Password harus berupa angka!');
      return;
    }

    try {
      const { ok, data } = await safeFetchJson('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPasswordInput }),
      });
      if (ok && data?.success) {
        setPasswordChangeSuccess('Password panel admin berhasil diubah!');
        setNewPasswordInput('');
        loadAdminLogs();
      } else {
        setPasswordChangeError(data?.message || 'Gagal mengubah password.');
      }
    } catch {
      setPasswordChangeError('Terjadi kesalahan koneksi.');
    }
  };

  // Admin Ban IP
  const handleBanIp = async (targetIp: string, minutes?: number) => {
    try {
      const { ok } = await safeFetchJson('/api/admin/visitors/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetIp,
          reason: minutes ? `Ban manual ${minutes} menit oleh admin` : 'Ban permanen oleh admin',
          minutes,
        }),
      });
      if (ok) {
        notifyAction(`IP ${targetIp} berhasil diban!`);
        loadAdminVisitors();
        loadAdminLogs();
      }
    } catch {
      notifyAction('Gagal mem-ban IP.');
    }
  };

  // Admin Unban IP
  const handleUnbanIp = async (targetIp: string) => {
    try {
      const { ok } = await safeFetchJson('/api/admin/visitors/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetIp }),
      });
      if (ok) {
        notifyAction(`IP ${targetIp} berhasil di-unban!`);
        loadAdminVisitors();
        loadAdminLogs();
        fetchData();
      }
    } catch {
      notifyAction('Gagal meng-unban IP.');
    }
  };

  const notifyAction = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const activeSlide = broadcastBanners[currentSlideIndex] || broadcastBanners[0];

  // ==========================================
  // 1. SCREEN: LOGIN
  // ==========================================
  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-white text-black font-sans antialiased flex flex-col justify-center items-center px-4 py-8">
        {/* Fail Modal (Popup Gagal & Ban IP 5 Menit) */}
        {showFailModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl text-center">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Login Gagal!</h3>
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                Password yang dimasukkan salah. Sesuai keamanan sistem, alamat IP Anda telah diban selama 5 menit.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider block">
                  Sisa Waktu Ban IP
                </span>
                <span className="text-2xl font-mono font-bold text-red-700">
                  {formatCountdown(banCountdown)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFailModal(false)}
                className="w-full py-2.5 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}

        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => {
              setPasswordInput('');
              setLoginError('');
              setCurrentScreen('home');
            }}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Website</span>
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-black">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-black">Login Panel Admin</h1>
            <p className="text-sm text-gray-500 mt-1">
              Masukkan password angka untuk masuk ke dashboard
            </p>
          </div>

          {/* Active Ban Alert & Countdown */}
          {isCurrentlyBanned && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2 text-red-600 font-semibold mb-1">
                <AlertTriangle className="w-5 h-5" />
                <span>IP Anda Sedang Diban</span>
              </div>
              <p className="text-xs text-red-600 mb-2">
                Anda tidak dapat mencoba login sampai hitung mundur selesai.
              </p>
              <div className="text-2xl font-mono font-bold text-red-700">
                {formatCountdown(banCountdown)}
              </div>
            </div>
          )}

          {loginError && !isCurrentlyBanned && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="numeric-password" className="block text-sm font-medium text-black">
                  Password (Hanya Angka)
                </label>
                <a
                  href="https://wa.me/6288245340881"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-gray-700 hover:text-black hover:underline inline-flex items-center gap-1"
                >
                  Lupa Sandi?
                </a>
              </div>
              <div className="relative">
                <input
                  id="numeric-password"
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={isCurrentlyBanned}
                  placeholder="Masukkan password angka"
                  value={passwordInput}
                  onChange={(e) => {
                    const sanitized = e.target.value.replace(/\D/g, '');
                    setPasswordInput(sanitized);
                  }}
                  className="w-full pl-4 pr-24 py-3 bg-white border border-gray-300 rounded-xl text-black font-mono tracking-widest text-center text-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg flex items-center gap-1 cursor-pointer transition"
                  title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Sembunyi</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tampilkan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCurrentlyBanned}
              className="w-full py-3 px-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
            >
              Masuk ke Panel Admin
            </button>

            <div className="text-center pt-1">
              <a
                href="https://wa.me/6288245340881"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-black hover:underline"
              >
                Lupa sandi? Hubungi via WhatsApp
              </a>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            IP Anda: <span className="font-mono text-gray-700">{clientIp || '127.0.0.1'}</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. SCREEN: ADMIN DASHBOARD
  // ==========================================
  if (currentScreen === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 text-black font-sans antialiased">
        {/* Admin Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-black text-white rounded-lg">
                <LayoutDashboard className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-black leading-none">Panel Admin Kelas</h1>
                <span className="text-xs text-gray-500">
                  IP Anda: <span className="font-mono font-medium text-gray-800">{clientIp}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  fetchData();
                  setCurrentScreen('home');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Lihat Web</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAdminAuthenticated(false);
                  setPasswordInput('');
                  setCurrentScreen('home');
                  notifyAction('Anda telah keluar dari Panel Admin.');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto gap-2 border-t border-gray-100 pt-2 pb-2">
            <button
              type="button"
              onClick={() => setAdminTab('broadcast')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap ${
                adminTab === 'broadcast' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Broadcast Banner ({broadcastBanners.length})</span>
            </button>

            {/* TAB BARU: BUAT FITUR & UI SENDIRI (.update f3) */}
            <button
              type="button"
              onClick={() => setAdminTab('features')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap ${
                adminTab === 'features' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Buat Fitur & UI Baru ({customFeatures.length})</span>
            </button>

            {/* TAB STRUKTUR KELAS (.f6) */}
            <button
              type="button"
              onClick={() => setAdminTab('structure')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap ${
                adminTab === 'structure' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Struktur Kelas</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('content')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap ${
                adminTab === 'content' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Teks Deskripsi</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('students')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap ${
                adminTab === 'students' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Daftar 20 Murid</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAdminTab('ip');
                loadAdminVisitors();
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap ${
                adminTab === 'ip' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Ban className="w-4 h-4" />
              <span>Manajemen IP Pengunjung</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAdminTab('logs');
                loadAdminLogs();
              }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap ${
                adminTab === 'logs' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Log Aktivitas</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('security')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap ${
                adminTab === 'security' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Ganti Password</span>
            </button>
          </div>
        </header>

        {/* Action notification toast */}
        {actionNotice && (
          <div className="fixed bottom-5 right-5 z-50 bg-black text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm border border-gray-700">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>{actionNotice}</span>
          </div>
        )}

        <main className="max-w-6xl mx-auto px-4 py-6">
          {/* TAB: BUAT FITUR & UI SENDIRI (.update f3) */}
          {adminTab === 'features' && (
            <div className="space-y-6">
              {/* Form Buat / Edit Fitur */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-black flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-gray-700" />
                    <span>{editingFeatureId ? 'Edit Fitur / UI' : 'Buat Fitur & UI Baru Sendiri'}</span>
                  </h2>
                  {editingFeatureId && (
                    <button
                      type="button"
                      onClick={resetFeatureForm}
                      className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer"
                    >
                      Batal Edit / Buat Baru
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-5">
                  Pilih tipe fitur, tentukan letak posisinya di halaman website, dan masukkan codingan (HTML/CSS/JS) atau kontennya agar langsung bekerja bagi semua user.
                </p>

                {/* Template Cepat */}
                <div className="mb-5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                    Gunakan Contoh Cepat (Klik untuk Mengisi Otomatis):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => insertCodeTemplate('clock')}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-medium text-black hover:bg-gray-100 cursor-pointer"
                    >
                      + Jam Digital Realtime (Codingan JS)
                    </button>
                    <button
                      type="button"
                      onClick={() => insertCodeTemplate('welcome')}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-medium text-black hover:bg-gray-100 cursor-pointer"
                    >
                      + Kotak Pesan Sambutan
                    </button>
                    <button
                      type="button"
                      onClick={() => insertCodeTemplate('whatsapp')}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-medium text-black hover:bg-gray-100 cursor-pointer"
                    >
                      + Tombol Link WhatsApp Kelas
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSaveFeature} className="space-y-4">
                  {/* Judul Fitur */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Judul / Nama Fitur:
                    </label>
                    <input
                      type="text"
                      value={featTitle}
                      onChange={(e) => setFeatTitle(e.target.value)}
                      placeholder="Contoh: Widget Jam Kelas, Link Grup WhatsApp, dll."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pilih Tipe Fitur */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Pilih Tipe UI / Fitur:
                      </label>
                      <select
                        value={featType}
                        onChange={(e) => setFeatType(e.target.value as FeatureType)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="custom_code">Codingan Custom (HTML / CSS / JavaScript / Widget)</option>
                        <option value="info_box">Kotak Informasi / Teks / Pengumuman</option>
                        <option value="button_link">Tombol Aksi / Link Eksternal</option>
                        <option value="schedule_table">Tabel Jadwal (Piket / Pelajaran)</option>
                      </select>
                    </div>

                    {/* Menyesuaikan Letak / Posisi di Web */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Sesuaikan Letak / Posisi di Web:
                      </label>
                      <select
                        value={featPosition}
                        onChange={(e) => setFeatPosition(e.target.value as FeaturePosition)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="top_banner">Di Atas Banner (Paling Atas)</option>
                        <option value="between_banner_and_desc">Di Antara Banner & Teks Deskripsi</option>
                        <option value="below_desc">Di Bawah Teks Deskripsi (Sebelum Daftar Murid)</option>
                        <option value="bottom_page">Di Bawah Daftar Murid (Bagian Bawah Halaman)</option>
                      </select>
                    </div>
                  </div>

                  {/* Input khusus sesuai Tipe */}
                  {featType === 'custom_code' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 flex items-center justify-between">
                        <span>Codingan Custom (HTML, CSS, JavaScript, Iframe):</span>
                        <span className="text-[11px] text-gray-400 font-normal">Mendukung script interaktif & tailwind</span>
                      </label>
                      <textarea
                        rows={7}
                        value={featContent}
                        onChange={(e) => setFeatContent(e.target.value)}
                        placeholder={`Contoh:\n<div class="p-4 bg-gray-100 rounded-xl text-center">\n  <h3 class="font-bold">Widget Keren</h3>\n  <button onclick="alert('Bekerja!')" class="mt-2 px-3 py-1 bg-black text-white rounded">Klik Saya</button>\n</div>`}
                        className="w-full px-3 py-2 bg-gray-900 text-green-400 font-mono text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  )}

                  {featType === 'info_box' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Isi Teks Informasi:
                      </label>
                      <textarea
                        rows={4}
                        value={featContent}
                        onChange={(e) => setFeatContent(e.target.value)}
                        placeholder="Tuliskan teks informasi, pengumuman, atau catatan kelas..."
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  )}

                  {featType === 'button_link' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                          Deskripsi Singkat (Opsional):
                        </label>
                        <input
                          type="text"
                          value={featContent}
                          onChange={(e) => setFeatContent(e.target.value)}
                          placeholder="Penjelasan singkat tombol..."
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                            Teks Tombol:
                          </label>
                          <input
                            type="text"
                            value={featButtonText}
                            onChange={(e) => setFeatButtonText(e.target.value)}
                            placeholder="Contoh: Gabung WhatsApp, Buka Jadwal, dll."
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                            URL Link Tujuan:
                          </label>
                          <input
                            type="text"
                            value={featButtonUrl}
                            onChange={(e) => setFeatButtonUrl(e.target.value)}
                            placeholder="https://wa.me/... atau link web"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {featType === 'schedule_table' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Format Baris Tabel (Pisahkan kolom dengan tanda |):
                      </label>
                      <textarea
                        rows={5}
                        value={featContent}
                        onChange={(e) => setFeatContent(e.target.value)}
                        placeholder={`Hari | Petugas Piket | Mata Pelajaran\nSenin | Given & Teman-teman | Matematika & IPA\nSelasa | Tim Kelompok 2 | B. Indonesia & PJOK`}
                        className="w-full px-3 py-2 bg-white border border-gray-300 font-mono rounded-lg text-xs text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  )}

                  {/* Status Aktif */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      id="feat-active-check"
                      type="checkbox"
                      checked={featIsActive}
                      onChange={(e) => setFeatIsActive(e.target.checked)}
                      className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black cursor-pointer"
                    />
                    <label htmlFor="feat-active-check" className="text-sm font-medium text-black cursor-pointer">
                      Aktifkan fitur ini sekarang (langsung tampil di website utama)
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-medium rounded-xl text-sm hover:bg-gray-800 transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingFeatureId ? 'Simpan Perubahan Fitur' : 'Simpan & Pasang Fitur'}</span>
                    </button>
                    {editingFeatureId && (
                      <button
                        type="button"
                        onClick={resetFeatureForm}
                        className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50 cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Daftar Fitur / UI Yang Telah Dibuat */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-black mb-4 flex items-center justify-between">
                  <span>Daftar Fitur / UI Yang Telah Dibuat ({customFeatures.length})</span>
                </h3>

                {customFeatures.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                    Belum ada fitur atau UI custom yang dibuat. Gunakan form di atas untuk membuat fitur baru!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customFeatures.map((feat) => {
                      const posLabels: Record<FeaturePosition, string> = {
                        top_banner: 'Di Atas Banner',
                        between_banner_and_desc: 'Antara Banner & Deskripsi',
                        below_desc: 'Di Bawah Deskripsi',
                        bottom_page: 'Bawah Halaman',
                      };

                      const typeLabels: Record<FeatureType, string> = {
                        custom_code: 'Codingan Custom',
                        info_box: 'Kotak Info',
                        button_link: 'Tombol Link',
                        schedule_table: 'Tabel Jadwal',
                      };

                      return (
                        <div
                          key={feat.id}
                          className="border border-gray-200 rounded-xl p-4 bg-gray-50/70 hover:bg-gray-50 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-black text-sm sm:text-base">
                                  {feat.title}
                                </h4>
                                <span className="px-2 py-0.5 bg-black text-white text-[11px] rounded font-medium">
                                  {typeLabels[feat.type]}
                                </span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] rounded font-medium">
                                  {posLabels[feat.position]}
                                </span>
                                {feat.isActive ? (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[11px] rounded font-medium flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>Aktif</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[11px] rounded font-medium flex items-center gap-1">
                                    <X className="w-3 h-3" />
                                    <span>Nonaktif</span>
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400 block mt-0.5">
                                Dibuat: {feat.createdAt}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleFeatureStatus(feat)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-lg border cursor-pointer ${
                                  feat.isActive
                                    ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                                    : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                                }`}
                              >
                                {feat.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditFeature(feat)}
                                className="px-3 py-1 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteFeature(feat.id, feat.title)}
                                className="px-3 py-1 border border-red-300 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 cursor-pointer"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>

                          {/* Preview mini */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className="text-[11px] font-semibold text-gray-500 uppercase block mb-1.5">
                              Pratinjau Hasil di Halaman:
                            </span>
                            <div className="bg-white rounded-lg p-2 border border-gray-200">
                              <CustomFeatureRenderer feature={feat} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: BROADCAST BANNER */}
          {adminTab === 'broadcast' && (
            <div className="space-y-6">
              {/* Tambah Slide Baru */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-black flex items-center gap-2 mb-2">
                  <Megaphone className="w-5 h-5 text-gray-700" />
                  <span>Tambah Slide Banner Broadcast Baru</span>
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Banner dapat digeser otomatis dan manual di halaman utama. Teks overlay akan diletakkan di bawah kiri menimpa foto.
                </p>

                <form onSubmit={handleAddBroadcastSlide} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      URL Foto Banner:
                    </label>
                    <input
                      type="text"
                      value={newSlideImageUrl}
                      onChange={(e) => setNewSlideImageUrl(e.target.value)}
                      placeholder="https://contoh-link-foto.png"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Teks Pengumuman di Bawah Kiri (Menimpa Foto - Opsional):
                    </label>
                    <textarea
                      rows={2}
                      value={newSlideOverlayText}
                      onChange={(e) => setNewSlideOverlayText(e.target.value)}
                      placeholder="Contoh: Pengumuman penting ujian akhir sekolah akan diadakan Senin..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Boleh dikosongkan jika slide hanya ingin menampilkan foto saja tanpa teks.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white font-medium rounded-lg text-sm hover:bg-gray-800 cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah ke Banner Broadcast</span>
                  </button>
                </form>
              </div>

              {/* Daftar Slide Broadcast Yang Ada */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-black mb-4 flex items-center justify-between">
                  <span>Daftar Slide Broadcast Saat Ini ({broadcastBanners.length})</span>
                </h3>

                <div className="space-y-4">
                  {broadcastBanners.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col md:flex-row gap-4 items-start"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-full md:w-48 h-28 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative border border-gray-300 flex items-center justify-center">
                        {slide.imageUrl && slide.imageUrl.trim() ? (
                          <img
                            src={slide.imageUrl.trim()}
                            alt={`Slide ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-xs text-gray-400">Tidak ada gambar</span>
                        )}
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/70 text-white rounded text-[10px] font-mono">
                          Slide #{idx + 1}
                        </span>
                      </div>

                      {/* Inputs for updating this slide */}
                      <div className="flex-1 w-full space-y-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase">
                            URL Foto Slide:
                          </label>
                          <input
                            type="text"
                            value={slide.imageUrl}
                            onChange={(e) => {
                              const updatedUrl = e.target.value;
                              setBroadcastBanners((prev) =>
                                prev.map((s) => (s.id === slide.id ? { ...s, imageUrl: updatedUrl } : s))
                              );
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase">
                            Teks Bawah Kiri (Menimpa Foto):
                          </label>
                          <input
                            type="text"
                            value={slide.overlayText}
                            onChange={(e) => {
                              const updatedText = e.target.value;
                              setBroadcastBanners((prev) =>
                                prev.map((s) => (s.id === slide.id ? { ...s, overlayText: updatedText } : s))
                              );
                            }}
                            placeholder="(Kosongkan jika tanpa teks)"
                            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateBroadcastSlide(slide.id, slide.imageUrl, slide.overlayText)
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Simpan Slide</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBroadcastSlide(slide.id)}
                            disabled={broadcastBanners.length <= 1}
                            className="inline-flex items-center gap-1.5 px-3 py-1 border border-red-300 text-red-600 text-xs font-medium rounded hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Slide</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB STRUKTUR ORGANISASI KELAS (.f6) */}
          {adminTab === 'structure' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-black flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-700" />
                    <span>Edit Struktur Organisasi Kelas 7.1</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setStructureForm({
                        waliKelas: 'Ricka Dwi Aryani, S.Si',
                        ketuaKelas: '',
                        wakilKetua: '',
                        sekretaris1: '',
                        sekretaris2: '',
                        bendahara1: '',
                        bendahara2: '',
                        seksiList: (structureForm.seksiList || []).map((s) => ({
                          ...s,
                          personName: '',
                        })),
                      });
                    }}
                    className="text-xs px-2.5 py-1 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg cursor-pointer"
                  >
                    Kosongkan Semua Nama
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-5">
                  Ubah nama pengurus kelas dari Wali Kelas, Ketua & Wakil, Sekretaris, Bendahara, hingga Seksi Bidang. Jika nama belum ditentukan, kosongkan saja.
                </p>

                <form onSubmit={handleSaveStructure} className="space-y-5">
                  {/* Bagian Wali Kelas */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-black block">
                      1. Wali Kelas
                    </span>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Nama Wali Kelas:
                      </label>
                      <input
                        type="text"
                        value={structureForm.waliKelas}
                        onChange={(e) =>
                          setStructureForm({ ...structureForm, waliKelas: e.target.value })
                        }
                        placeholder="Contoh: Ricka Dwi Aryani, S.Si"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  {/* Bagian Ketua & Wakil */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-black block">
                      2. Pimpinan Kelas (Ketua & Wakil Ketua)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                          Nama Ketua Kelas:
                        </label>
                        <input
                          type="text"
                          value={structureForm.ketuaKelas}
                          onChange={(e) =>
                            setStructureForm({ ...structureForm, ketuaKelas: e.target.value })
                          }
                          placeholder="(Kosongkan jika belum diisi)"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                          Nama Wakil Ketua Kelas:
                        </label>
                        <input
                          type="text"
                          value={structureForm.wakilKetua}
                          onChange={(e) =>
                            setStructureForm({ ...structureForm, wakilKetua: e.target.value })
                          }
                          placeholder="(Kosongkan jika belum diisi)"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian Sekretaris & Bendahara */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-black block">
                      3. Sekretaris & Bendahara
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                          Sekretaris 1:
                        </label>
                        <input
                          type="text"
                          value={structureForm.sekretaris1}
                          onChange={(e) =>
                            setStructureForm({ ...structureForm, sekretaris1: e.target.value })
                          }
                          placeholder="(Kosong)"
                          className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                          Sekretaris 2:
                        </label>
                        <input
                          type="text"
                          value={structureForm.sekretaris2}
                          onChange={(e) =>
                            setStructureForm({ ...structureForm, sekretaris2: e.target.value })
                          }
                          placeholder="(Kosong)"
                          className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                          Bendahara 1:
                        </label>
                        <input
                          type="text"
                          value={structureForm.bendahara1}
                          onChange={(e) =>
                            setStructureForm({ ...structureForm, bendahara1: e.target.value })
                          }
                          placeholder="(Kosong)"
                          className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                          Bendahara 2:
                        </label>
                        <input
                          type="text"
                          value={structureForm.bendahara2}
                          onChange={(e) =>
                            setStructureForm({ ...structureForm, bendahara2: e.target.value })
                          }
                          placeholder="(Kosong)"
                          className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian Seksi Bidang (.update f6) */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-black block">
                          4. Seksi-Seksi Bidang
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Anda dapat mengubah nama seksi, nama siswa, menghapus, atau menambahkan seksi bidang baru.
                        </p>
                      </div>
                    </div>

                    {/* Daftar Seksi yang Ada */}
                    {(structureForm.seksiList || []).length === 0 ? (
                      <div className="text-center py-4 bg-white border border-dashed border-gray-300 rounded-lg text-xs text-gray-500">
                        Belum ada seksi bidang. Tambahkan seksi baru di bawah ini.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {(structureForm.seksiList || []).map((seksi, index) => (
                          <div
                            key={seksi.id || index}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-white border border-gray-200 rounded-lg"
                          >
                            <div className="flex-1">
                              <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-0.5">
                                Nama Seksi:
                              </label>
                              <input
                                type="text"
                                value={seksi.seksiName}
                                onChange={(e) =>
                                  handleUpdateSeksi(seksi.id, e.target.value, seksi.personName)
                                }
                                placeholder="Contoh: Seksi Kebersihan"
                                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-black focus:outline-none focus:ring-1 focus:ring-black"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-0.5">
                                Nama Siswa / Penjabat:
                              </label>
                              <input
                                type="text"
                                value={seksi.personName}
                                onChange={(e) =>
                                  handleUpdateSeksi(seksi.id, seksi.seksiName, e.target.value)
                                }
                                placeholder="(Kosong jika belum ada)"
                                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-xs sm:text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
                              />
                            </div>
                            <div className="sm:self-end pt-2 sm:pt-0">
                              <button
                                type="button"
                                onClick={() => handleDeleteSeksi(seksi.id, seksi.seksiName)}
                                className="w-full sm:w-auto p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-md text-xs flex items-center justify-center gap-1 cursor-pointer transition"
                                title="Hapus Seksi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="sm:hidden">Hapus Seksi</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Form Tambah Seksi Baru */}
                    <div className="p-3 bg-white border border-gray-300 rounded-lg">
                      <div className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-black" />
                        <span>Tambah Seksi Bidang Baru</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
                        <div>
                          <input
                            type="text"
                            value={newSeksiTitle}
                            onChange={(e) => setNewSeksiTitle(e.target.value)}
                            placeholder="Nama Seksi (contoh: Seksi Keamanan)"
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={newSeksiPerson}
                            onChange={(e) => setNewSeksiPerson(e.target.value)}
                            placeholder="Nama Siswa (opsional)"
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSeksi}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambahkan ke Daftar Seksi</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-medium rounded-xl text-sm hover:bg-gray-800 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Struktur Organisasi</span>
                  </button>
                </form>
              </div>

              {/* Pratinjau Struktur */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-black text-base mb-3">
                  Pratinjau Hasil Bagan Struktur:
                </h3>
                <ClassStructureView structure={structureForm} />
              </div>
            </div>
          )}

          {/* TAB 2: TEKS DESKRIPSI KELAS */}
          {adminTab === 'content' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-700" />
                  <span>Edit / Hapus Teks Deskripsi Kelas</span>
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Teks Deskripsi:
                </label>
                <textarea
                  rows={4}
                  value={adminDescInput}
                  onChange={(e) => setAdminDescInput(e.target.value)}
                  placeholder="Masukkan teks deskripsi kelas..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDescription}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-medium rounded-lg text-sm hover:bg-gray-800 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Teks Deskripsi</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDescription}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg text-sm hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus / Kosongkan Teks</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DAFTAR 20 MURID */}
          {adminTab === 'students' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-700" />
                  <span>Edit & Hapus Data 20 Kotak Murid</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Pilih nomor kotak murid yang ingin diedit atau dihapus datanya.
                </p>
              </div>

              {/* Selector 1 to 20 */}
              <div>
                <span className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                  Pilih Kotak Murid (1 - 20):
                </span>
                <div className="flex flex-wrap gap-2">
                  {students.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStudentId(s.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer ${
                        selectedStudentId === s.id
                          ? 'bg-black text-white border-black'
                          : s.name
                          ? 'bg-gray-100 text-black border-gray-300 hover:bg-gray-200'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      #{s.id} {s.name ? `(${s.name})` : '(Kosong)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Form */}
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
                <h3 className="font-semibold text-black text-base">
                  Mengedit Kotak Murid #{studentForm.id}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                      Foto Murid (Link Gambar / Upload dari Perangkat):
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start bg-white p-3 rounded-xl border border-gray-200">
                      {/* Live Image Preview */}
                      <div className="w-24 h-24 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center relative shadow-2xs">
                        {studentForm.image ? (
                          <img
                            src={normalizeImageUrl(studentForm.image)}
                            alt="Preview Foto"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 text-[10px] text-center p-1">
                            <ImageIcon className="w-6 h-6 text-gray-300 mb-1" />
                            <span>Preview Foto</span>
                          </div>
                        )}
                      </div>

                      {/* Inputs: URL & File Upload */}
                      <div className="flex-1 w-full space-y-2">
                        <input
                          type="text"
                          value={studentForm.image}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, image: e.target.value })
                          }
                          placeholder="Masukkan link gambar (Catbox, Google Drive, Imgur, dsb.)"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black text-xs font-medium rounded-lg cursor-pointer transition">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Pilih Foto dari Perangkat</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 5 * 1024 * 1024) {
                                    notifyAction('Ukuran foto terlalu besar (maksimal 5MB)');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = (uploadEvt) => {
                                    const result = uploadEvt.target?.result as string;
                                    if (result) {
                                      setStudentForm((prev) => ({ ...prev, image: result }));
                                      notifyAction('Foto dari perangkat berhasil dipilih!');
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {studentForm.image && (
                            <button
                              type="button"
                              onClick={() => setStudentForm({ ...studentForm, image: '' })}
                              className="text-xs text-red-600 hover:underline cursor-pointer px-2 py-1"
                            >
                              Kosongkan Foto
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 leading-tight">
                          Tips: Bisa menggunakan link gambar langsung, link file Google Drive publik, atau langsung upload foto dari HP / komputer Anda.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Nama Murid:
                    </label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, name: e.target.value })
                      }
                      placeholder="Contoh: Given"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Tanggal Lahir:
                    </label>
                    <input
                      type="text"
                      value={studentForm.birthDate}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, birthDate: e.target.value })
                      }
                      placeholder="Contoh: 19 September 2013"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Hobi:
                    </label>
                    <input
                      type="text"
                      value={studentForm.hobby}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, hobby: e.target.value })
                      }
                      placeholder="Contoh: Coding"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleSaveStudent}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-medium rounded-lg text-sm hover:bg-gray-800 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Kotak #{studentForm.id}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStudent(studentForm.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg text-sm hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus / Kosongkan Kotak #{studentForm.id}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FITUR IP PENGUNJUNG */}
          {adminTab === 'ip' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-black flex items-center gap-2">
                    <Ban className="w-5 h-5 text-gray-700" />
                    <span>Fitur IP: Daftar Pengunjung & Blokir/Ban</span>
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Lihat semua IP user yang mengakses web, serta lakukan Ban atau Unban IP kapan saja.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadAdminVisitors}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Segarkan IP</span>
                </button>
              </div>

              {/* Visitors Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-sm text-black">
                  <thead className="bg-gray-100 text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Alamat IP</th>
                      <th className="px-4 py-3">Kunjungan Pertama</th>
                      <th className="px-4 py-3">Terakhir Aktif</th>
                      <th className="px-4 py-3 text-center">Jumlah Buka</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {visitors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500 text-sm">
                          Belum ada data pengunjung yang tercatat.
                        </td>
                      </tr>
                    ) : (
                      visitors.map((v) => {
                        const isBanActive = v.isBanned;
                        return (
                          <tr key={v.ip} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono font-medium text-black">
                              {v.ip}
                              {v.ip === clientIp && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  Anda
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600">{v.firstSeen}</td>
                            <td className="px-4 py-3 text-xs text-gray-600">{v.lastSeen}</td>
                            <td className="px-4 py-3 text-center text-sm font-semibold">{v.visitCount}</td>
                            <td className="px-4 py-3">
                              {isBanActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                  <Ban className="w-3 h-3" />
                                  <span>Diban</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  <UserCheck className="w-3 h-3" />
                                  <span>Aktif / Normal</span>
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              {isBanActive ? (
                                <button
                                  type="button"
                                  onClick={() => handleUnbanIp(v.ip)}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 cursor-pointer"
                                >
                                  Unban IP
                                </button>
                              ) : (
                                <div className="inline-flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleBanIp(v.ip, 5)}
                                    className="px-2.5 py-1 border border-orange-300 text-orange-700 hover:bg-orange-50 rounded-lg text-xs font-medium cursor-pointer"
                                    title="Ban selama 5 menit"
                                  >
                                    Ban 5 Mnt
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleBanIp(v.ip)}
                                    className="px-2.5 py-1 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-medium cursor-pointer"
                                    title="Ban permanen"
                                  >
                                    Ban Permanen
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LOG AKTIVITAS */}
          {adminTab === 'logs' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-black flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gray-700" />
                    <span>Log Aktivitas Seluruh Pengguna & Admin</span>
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Mencatat semua aksi masuk, login admin, pengeditan fitur/broadcast/teks/murid, dan ban/unban IP secara rinci.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadAdminLogs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Segarkan Log</span>
                </button>
              </div>

              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {activityLogs.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    Belum ada log aktivitas.
                  </div>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="p-3.5 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-black">{log.action}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                            {log.ip}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-xs text-gray-600">{log.details}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {log.timestamp}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: GANTI PASSWORD ADMIN */}
          {adminTab === 'security' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm max-w-xl mx-auto space-y-6">
              <div>
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-gray-700" />
                  <span>Ganti Password Panel Admin</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Ubah password panel admin. Password harus berupa angka saja.
                </p>
              </div>

              {passwordChangeSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>{passwordChangeSuccess}</span>
                </div>
              )}

              {passwordChangeError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>{passwordChangeError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Password Baru (Hanya Angka):
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={newPasswordInput}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '');
                      setNewPasswordInput(num);
                    }}
                    placeholder="Masukkan password angka baru"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black font-mono text-base focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tidak boleh huruf, minimal 3 digit angka. Perubahan langsung tersimpan di server.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition cursor-pointer"
                >
                  Simpan Password Baru
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ==========================================
  // 3. SCREEN: HOME (WEBSITE KELAS UTAMA)
  // ==========================================
  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased">
      {/* Top Header dengan Teks KELAS 7.1 MTS AL-MURSYIDIYYAH dan Ikon Profile di Kanan */}
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center relative">
          {/* Teks Sejajar dengan Foto Profile di Kanan Atas */}
          <div className="font-bold text-sm sm:text-base md:text-lg text-black tracking-wide">
            KELAS 7.1 MTS AL-MURSYIDIYYAH
          </div>

          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 cursor-pointer block relative bg-gray-100 flex items-center justify-center"
              aria-label="Profile Menu"
            >
              <User className="w-5 h-5 text-gray-500 absolute" />
              <img
                src="https://files.catbox.moe/twd2b4.png"
                alt="Profile"
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </button>

            {/* Menu Pop-up / Dropdown */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    if (isAdminAuthenticated) {
                      setCurrentScreen('admin');
                    } else {
                      setCurrentScreen('login');
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span>Panel Admin</span>
                  {isAdminAuthenticated && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                      Aktif
                    </span>
                  )}
                </button>
                {isAdminAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsAdminAuthenticated(false);
                      setPasswordInput('');
                      notifyAction('Anda telah keluar dari Panel Admin.');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2 border-t border-gray-100"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar dari Admin</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Fitur Bar: Navigasi Menu Cepat (Scroll Otomatis ke Bagian) */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-gray-200 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline mr-1">
            Menu:
          </span>
          <button
            type="button"
            onClick={() => scrollToSection('banner-section')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-black hover:text-white transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Banner</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('desc-section')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-black hover:text-white transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Deskripsi</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('murid-section')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-black hover:text-white transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Murid</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('jadwal-section')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-black hover:text-white transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal Pelajaran</span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('struktur-section')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-black hover:text-white transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Struktur Kelas</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-5xl mx-auto px-4 py-6">
        {/* 1. SLOT FITUR: Di Atas Banner (Paling Atas) */}
        {customFeatures
          .filter((f) => f.position === 'top_banner' && f.isActive)
          .map((f) => (
            <CustomFeatureRenderer key={f.id} feature={f} />
          ))}

        {/* Banner Section: Broadcast Banner Slider dengan Teks Bawah Kiri & Otomatis Geser */}
        <div
          id="banner-section"
          className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-gray-50 min-h-[16rem] group select-none"
          onMouseEnter={() => setIsSlidePaused(true)}
          onMouseLeave={() => setIsSlidePaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slide Image */}
          {activeSlide && activeSlide.imageUrl && activeSlide.imageUrl.trim() ? (
            <img
              key={activeSlide.id}
              src={activeSlide.imageUrl.trim()}
              alt="Banner Kelas"
              className="w-full h-64 sm:h-80 md:h-96 object-cover object-center transition-all duration-500 ease-in-out"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.dataset.hasFailed) {
                  target.dataset.hasFailed = 'true';
                  target.src = 'https://files.catbox.moe/twd2b4.png';
                } else {
                  target.style.display = 'none';
                }
              }}
            />
          ) : (
            <div className="w-full h-64 sm:h-80 md:h-96 flex items-center justify-center text-gray-400 text-sm">
              (Banner Foto Kosong)
            </div>
          )}

          {/* Teks Bawah Kiri Menimpa Foto (Broadcast) */}
          {activeSlide && activeSlide.overlayText && (
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-lg z-10 pointer-events-none">
              <div className="bg-black/75 backdrop-blur-xs text-white p-3 sm:p-4 rounded-xl border border-white/20 shadow-xl pointer-events-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-300 uppercase tracking-wider mb-1">
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Pengumuman</span>
                </div>
                <p className="text-sm sm:text-base font-medium leading-snug drop-shadow-sm whitespace-pre-wrap">
                  {activeSlide.overlayText}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Arrows (Bisa Digeser Kiri - Kanan Manual) */}
          {broadcastBanners.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-black shadow-md flex items-center justify-center cursor-pointer transition opacity-80 sm:opacity-0 group-hover:opacity-100 z-20"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-black shadow-md flex items-center justify-center cursor-pointer transition opacity-80 sm:opacity-0 group-hover:opacity-100 z-20"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Slide Indicator Dots */}
          {broadcastBanners.length > 1 && (
            <div className="absolute bottom-3 right-4 z-20 flex gap-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-xs">
              {broadcastBanners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    currentSlideIndex === idx ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 2. SLOT FITUR: Di Antara Banner dan Teks Deskripsi */}
        {customFeatures
          .filter((f) => f.position === 'between_banner_and_desc' && f.isActive)
          .map((f) => (
            <CustomFeatureRenderer key={f.id} feature={f} />
          ))}

        {/* Tempat Teks Deskripsi */}
        <div id="desc-section" className="mt-6 p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
          <p className="text-black text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
            {descriptionText || '(Teks deskripsi kosong)'}
          </p>
        </div>

        {/* 3. SLOT FITUR: Di Bawah Teks Deskripsi (Sebelum Daftar Murid) */}
        {customFeatures
          .filter((f) => f.position === 'below_desc' && f.isActive)
          .map((f) => (
            <CustomFeatureRenderer key={f.id} feature={f} />
          ))}

        {/* Daftar Murid / Siswa (Horizontal Scroll 20 Kotak) */}
        <div id="murid-section" className="mt-8">
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 select-none">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                {/* Tempat Gambar Murid / Siswa */}
                <StudentCardImage image={student.image} name={student.name} />

                {/* Info Murid */}
                <div className="space-y-2 text-sm text-black mt-4">
                  <div>
                    <span className="font-semibold text-gray-700">Nama:</span>{' '}
                    <span>{student.name || '-'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Tanggal Lahir:</span>{' '}
                    <span>{student.birthDate || '-'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Hobi:</span>{' '}
                    <span>{student.hobby || '-'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jadwal Pelajaran Kelas 7.1 (.f5) */}
        <div id="jadwal-section">
          <ClassSchedule />
        </div>

        {/* Struktur Organisasi Kelas 7.1 (.f6) */}
        <div id="struktur-section">
          <ClassStructureView structure={classStructure} />
        </div>

        {/* 4. SLOT FITUR: Di Bawah Daftar Murid (Bagian Paling Bawah Halaman) */}
        {customFeatures
          .filter((f) => f.position === 'bottom_page' && f.isActive)
          .map((f) => (
            <CustomFeatureRenderer key={f.id} feature={f} />
          ))}
      </main>

      {/* Footer Dipaling Bawah: copyright by Given */}
      <footer className="w-full border-t border-gray-200 bg-white py-6 mt-12 text-center">
        <p className="text-sm font-medium text-gray-600">
          copyright by Given
        </p>
      </footer>

      {/* Tombol Naik Kembali ke Atas (Back to Top) */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 p-3 bg-black text-white rounded-full shadow-2xl hover:bg-gray-800 transition flex items-center justify-center cursor-pointer group"
          aria-label="Naik kembali ke atas"
          title="Naik ke atas"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}
