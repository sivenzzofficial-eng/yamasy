import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'app-data.json');

interface Student {
  id: number;
  image: string;
  name: string;
  birthDate: string;
  hobby: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  ip: string;
  details?: string;
}

interface Visitor {
  ip: string;
  firstSeen: string;
  lastSeen: string;
  visitCount: number;
  isBanned: boolean;
  bannedUntil: number | null; // timestamp in ms
  banReason?: string;
}

export interface BroadcastBanner {
  id: string;
  imageUrl: string;
  overlayText: string;
}

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

export interface GalleryItem {
  id: string;
  imageUrl: string;
  description: string;
  title?: string;
  createdAt?: string;
}

interface AppData {
  bannerImage: string;
  broadcastBanners: BroadcastBanner[];
  descriptionText: string;
  adminPassword: string;
  students: Student[];
  visitors: Record<string, Visitor>;
  activityLogs: ActivityLog[];
  customFeatures: CustomFeature[];
  classStructure: ClassStructure;
  galleryItems?: GalleryItem[];
}

const defaultData: AppData = {
  bannerImage: 'https://files.catbox.moe/twd2b4.png',
  broadcastBanners: [
    {
      id: 'b-1',
      imageUrl: 'https://files.catbox.moe/twd2b4.png',
      overlayText: 'Broadcast Pengumuman Penting Kelas 7.1 MTS Al-Mursyidiyyah',
    },
  ],
  descriptionText: 'text deks 1',
  adminPassword: '125533',
  customFeatures: [],
  galleryItems: [
    {
      id: 'gal-1',
      imageUrl: '',
      description: 'keterangan',
      title: 'Momen Bersama',
      createdAt: new Date().toLocaleDateString('id-ID'),
    },
  ],
  classStructure: {
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
  },
  students: Array.from({ length: 20 }, (_, index) => {
    if (index === 0) {
      return {
        id: 1,
        image: '',
        name: 'Given',
        birthDate: '19 September 2013',
        hobby: 'Coding',
      };
    }
    return {
      id: index + 1,
      image: '',
      name: '',
      birthDate: '',
      hobby: '',
    };
  }),
  visitors: {},
  activityLogs: [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleString('id-ID'),
      action: 'Sistem diinisialisasi',
      ip: '127.0.0.1',
      details: 'Website kelas berhasil dijalankan.',
    },
  ],
};

function loadData(): AppData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const banners = Array.isArray(parsed.broadcastBanners) && parsed.broadcastBanners.length > 0
      ? parsed.broadcastBanners
      : [
          {
            id: 'b-1',
            imageUrl: parsed.bannerImage || defaultData.bannerImage,
            overlayText: 'Broadcast Pengumuman Penting Kelas 7.1 MTS Al-Mursyidiyyah',
          },
        ];
    return {
      ...defaultData,
      ...parsed,
      broadcastBanners: banners,
      customFeatures: Array.isArray(parsed.customFeatures) ? parsed.customFeatures : [],
      classStructure: {
        ...defaultData.classStructure,
        ...(parsed.classStructure || {}),
        seksiList: Array.isArray(parsed.classStructure?.seksiList)
          ? parsed.classStructure.seksiList
          : [
              { id: 'seksi-1', seksiName: 'Seksi Kebersihan', personName: parsed.classStructure?.sieKebersihan || '' },
              { id: 'seksi-2', seksiName: 'Seksi Keamanan', personName: parsed.classStructure?.sieKeamanan || '' },
              { id: 'seksi-3', seksiName: 'Seksi Keagamaan', personName: parsed.classStructure?.sieKeagamaan || '' },
              { id: 'seksi-4', seksiName: 'Seksi Olahraga', personName: parsed.classStructure?.sieOlahraga || '' },
            ],
      },
      visitors: parsed.visitors || {},
      activityLogs: parsed.activityLogs || defaultData.activityLogs,
      galleryItems: Array.isArray(parsed.galleryItems) && parsed.galleryItems.length > 0
        ? parsed.galleryItems
        : defaultData.galleryItems,
    };
  } catch (err) {
    console.error('Error reading app data, falling back to default:', err);
    return defaultData;
  }
}

let appData = loadData();

function saveData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(appData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving app data:', err);
  }
}

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

function addLog(action: string, ip: string, details?: string) {
  const log: ActivityLog = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleString('id-ID'),
    action,
    ip,
    details: details || '',
  };
  appData.activityLogs.unshift(log);
  if (appData.activityLogs.length > 300) {
    appData.activityLogs = appData.activityLogs.slice(0, 300);
  }
  saveData();
}

function checkIpBan(ip: string): { isBanned: boolean; remainingSeconds: number; bannedUntil: number | null; reason: string } {
  const visitor = appData.visitors[ip];
  if (!visitor) {
    return { isBanned: false, remainingSeconds: 0, bannedUntil: null, reason: '' };
  }

  // Check permanent ban
  if (visitor.isBanned && !visitor.bannedUntil) {
    return { isBanned: true, remainingSeconds: -1, bannedUntil: null, reason: visitor.banReason || 'IP diblokir oleh admin' };
  }

  // Check temporary ban (e.g. 5 minutes countdown)
  if (visitor.bannedUntil) {
    const diff = visitor.bannedUntil - Date.now();
    if (diff > 0) {
      return {
        isBanned: true,
        remainingSeconds: Math.ceil(diff / 1000),
        bannedUntil: visitor.bannedUntil,
        reason: visitor.banReason || 'IP diban 5 menit karena salah memasukkan password',
      };
    } else {
      // Ban has expired
      visitor.isBanned = false;
      visitor.bannedUntil = null;
      visitor.banReason = '';
      saveData();
    }
  }

  return { isBanned: false, remainingSeconds: 0, bannedUntil: null, reason: '' };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // Middleware to track visitor IP
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      const ip = getClientIp(req);
      const now = new Date().toLocaleString('id-ID');
      if (!appData.visitors[ip]) {
        appData.visitors[ip] = {
          ip,
          firstSeen: now,
          lastSeen: now,
          visitCount: 1,
          isBanned: false,
          bannedUntil: null,
        };
        addLog('Pengunjung Baru Masuk', ip, 'Kunjungan pertama kali ke website kelas.');
      } else {
        appData.visitors[ip].lastSeen = now;
        appData.visitors[ip].visitCount += 1;
        saveData();
      }
    }
    next();
  });

  // 1. Get initial public data
  app.get('/api/data', (req, res) => {
    const ip = getClientIp(req);
    const banInfo = checkIpBan(ip);
    res.json({
      bannerImage: appData.bannerImage,
      broadcastBanners: appData.broadcastBanners,
      descriptionText: appData.descriptionText,
      students: appData.students,
      customFeatures: appData.customFeatures,
      classStructure: appData.classStructure,
      galleryItems: appData.galleryItems || [],
      clientIp: ip,
      banInfo,
    });
  });

  // 2. Admin login endpoint
  app.post('/api/admin/login', (req, res) => {
    const ip = getClientIp(req);
    const banInfo = checkIpBan(ip);

    // If currently banned, reject
    if (banInfo.isBanned) {
      return res.status(403).json({
        success: false,
        isBanned: true,
        remainingSeconds: banInfo.remainingSeconds,
        bannedUntil: banInfo.bannedUntil,
        message: `IP Anda sedang diban. Sisa waktu: ${banInfo.remainingSeconds} detik.`,
      });
    }

    const { password } = req.body;

    // Validate only numbers
    if (typeof password !== 'string' || !/^\d+$/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password hanya boleh berupa angka!',
      });
    }

    if (password === appData.adminPassword) {
      addLog('Admin Berhasil Login', ip, 'Masuk ke panel admin.');
      return res.json({
        success: true,
        message: 'Login berhasil!',
      });
    } else {
      // Wrong password -> Ban IP for 5 minutes (300 seconds)
      const bannedUntil = Date.now() + 5 * 60 * 1000;
      if (!appData.visitors[ip]) {
        const now = new Date().toLocaleString('id-ID');
        appData.visitors[ip] = {
          ip,
          firstSeen: now,
          lastSeen: now,
          visitCount: 1,
          isBanned: true,
          bannedUntil,
          banReason: 'Salah memasukkan password panel admin (ban 5 menit)',
        };
      } else {
        appData.visitors[ip].isBanned = true;
        appData.visitors[ip].bannedUntil = bannedUntil;
        appData.visitors[ip].banReason = 'Salah memasukkan password panel admin (ban 5 menit)';
      }

      addLog('Gagal Login (Salah Password)', ip, 'IP diban otomatis selama 5 menit.');
      saveData();

      return res.status(401).json({
        success: false,
        isBanned: true,
        remainingSeconds: 300,
        bannedUntil,
        message: 'Password salah! Akses IP Anda telah diban selama 5 menit.',
      });
    }
  });

  // 3. Update Banner Image
  app.put('/api/admin/banner', (req, res) => {
    const ip = getClientIp(req);
    const { bannerImage } = req.body;
    appData.bannerImage = typeof bannerImage === 'string' ? bannerImage : '';
    addLog('Mengubah Foto Banner', ip, `URL banner diperbarui: ${appData.bannerImage ? 'Ada foto' : 'Dikosongkan'}`);
    saveData();
    res.json({ success: true, bannerImage: appData.bannerImage });
  });

  // 3b. Broadcast Banners Endpoints
  app.post('/api/admin/broadcast', (req, res) => {
    const ip = getClientIp(req);
    const { imageUrl, overlayText } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'URL gambar banner wajib diisi' });
    }
    const newSlide: BroadcastBanner = {
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      imageUrl: imageUrl.trim(),
      overlayText: typeof overlayText === 'string' ? overlayText.trim() : '',
    };
    appData.broadcastBanners.push(newSlide);
    addLog('Menambah Slide Broadcast', ip, `Slide broadcast baru ditambahkan: "${newSlide.overlayText || 'Tanpa teks overlay'}"`);
    saveData();
    res.json({ success: true, broadcastBanners: appData.broadcastBanners, slide: newSlide });
  });

  app.put('/api/admin/broadcast/:id', (req, res) => {
    const ip = getClientIp(req);
    const id = req.params.id;
    const { imageUrl, overlayText } = req.body;
    const index = appData.broadcastBanners.findIndex((b) => b.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Slide broadcast tidak ditemukan' });
    }
    appData.broadcastBanners[index] = {
      id,
      imageUrl: imageUrl !== undefined ? imageUrl.trim() : appData.broadcastBanners[index].imageUrl,
      overlayText: overlayText !== undefined ? overlayText.trim() : appData.broadcastBanners[index].overlayText,
    };
    addLog('Mengedit Slide Broadcast', ip, `Slide #${id} diperbarui: "${appData.broadcastBanners[index].overlayText || 'Tanpa teks'}"`);
    saveData();
    res.json({ success: true, broadcastBanners: appData.broadcastBanners });
  });

  app.delete('/api/admin/broadcast/:id', (req, res) => {
    const ip = getClientIp(req);
    const id = req.params.id;
    if (appData.broadcastBanners.length <= 1) {
      return res.status(400).json({ success: false, message: 'Minimal harus ada 1 slide banner broadcast!' });
    }
    const deleted = appData.broadcastBanners.find((b) => b.id === id);
    appData.broadcastBanners = appData.broadcastBanners.filter((b) => b.id !== id);
    addLog('Menghapus Slide Broadcast', ip, `Slide #${id} dihapus (${deleted?.overlayText || 'Tanpa teks'})`);
    saveData();
    res.json({ success: true, broadcastBanners: appData.broadcastBanners });
  });

  // 3c. Custom UI Features Endpoints (Tambah, Edit, Hapus Fitur UI Baru)
  app.post('/api/admin/features', (req, res) => {
    const ip = getClientIp(req);
    const { title, type, position, content, buttonUrl, buttonText, isActive } = req.body;
    if (!title || !type || !position) {
      return res.status(400).json({ success: false, message: 'Judul, tipe, dan posisi letak fitur wajib diisi!' });
    }

    const newFeature: CustomFeature = {
      id: `feat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      type,
      position,
      content: content ?? '',
      buttonUrl: buttonUrl ?? '',
      buttonText: buttonText ?? '',
      isActive: isActive !== false,
      createdAt: new Date().toLocaleString('id-ID'),
    };

    appData.customFeatures.push(newFeature);
    addLog('Membuat Fitur/UI Baru', ip, `Menambahkan fitur baru "${newFeature.title}" (Tipe: ${type}, Posisi: ${position})`);
    saveData();
    res.json({ success: true, feature: newFeature, customFeatures: appData.customFeatures });
  });

  app.put('/api/admin/features/:id', (req, res) => {
    const ip = getClientIp(req);
    const id = req.params.id;
    const { title, type, position, content, buttonUrl, buttonText, isActive } = req.body;

    const index = appData.customFeatures.findIndex((f) => f.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Fitur tidak ditemukan' });
    }

    appData.customFeatures[index] = {
      ...appData.customFeatures[index],
      title: title !== undefined ? title.trim() : appData.customFeatures[index].title,
      type: type !== undefined ? type : appData.customFeatures[index].type,
      position: position !== undefined ? position : appData.customFeatures[index].position,
      content: content !== undefined ? content : appData.customFeatures[index].content,
      buttonUrl: buttonUrl !== undefined ? buttonUrl : appData.customFeatures[index].buttonUrl,
      buttonText: buttonText !== undefined ? buttonText : appData.customFeatures[index].buttonText,
      isActive: isActive !== undefined ? isActive : appData.customFeatures[index].isActive,
    };

    addLog('Mengedit Fitur/UI', ip, `Memperbarui fitur "${appData.customFeatures[index].title}"`);
    saveData();
    res.json({ success: true, feature: appData.customFeatures[index], customFeatures: appData.customFeatures });
  });

  app.delete('/api/admin/features/:id', (req, res) => {
    const ip = getClientIp(req);
    const id = req.params.id;

    const target = appData.customFeatures.find((f) => f.id === id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Fitur tidak ditemukan' });
    }

    appData.customFeatures = appData.customFeatures.filter((f) => f.id !== id);
    addLog('Menghapus Fitur/UI', ip, `Menghapus fitur/UI "${target.title}"`);
    saveData();
    res.json({ success: true, customFeatures: appData.customFeatures });
  });

  // 3d. Update Class Structure (Struktur Kelas .f6)
  app.put('/api/admin/structure', (req, res) => {
    const ip = getClientIp(req);
    const { classStructure } = req.body;
    if (classStructure && typeof classStructure === 'object') {
      appData.classStructure = {
        ...appData.classStructure,
        ...classStructure,
      };
      addLog('Mengubah Struktur Organisasi Kelas', ip, 'Memperbarui nama kepengurusan kelas 7.1');
      saveData();
      return res.json({ success: true, classStructure: appData.classStructure });
    }
    return res.status(400).json({ success: false, message: 'Data struktur kelas tidak valid' });
  });

  // 3e. Galeri Momen Endpoints (.f2)
  app.post('/api/admin/gallery', (req, res) => {
    const ip = getClientIp(req);
    const { imageUrl, description, title } = req.body;
    if (!appData.galleryItems) appData.galleryItems = [];

    const newMoment: GalleryItem = {
      id: `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : '',
      description: typeof description === 'string' && description.trim() ? description.trim() : 'keterangan',
      title: typeof title === 'string' && title.trim() ? title.trim() : 'Momen Kelas',
      createdAt: new Date().toLocaleDateString('id-ID'),
    };

    appData.galleryItems.push(newMoment);
    addLog('Menambah Momen Galeri', ip, `Momen baru: "${newMoment.description.substring(0, 30)}"`);
    saveData();
    res.json({ success: true, moment: newMoment, galleryItems: appData.galleryItems });
  });

  app.put('/api/admin/gallery/:id', (req, res) => {
    const ip = getClientIp(req);
    const id = req.params.id;
    const { imageUrl, description, title } = req.body;
    if (!appData.galleryItems) appData.galleryItems = [];

    const index = appData.galleryItems.findIndex((g) => g.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Momen galeri tidak ditemukan' });
    }

    appData.galleryItems[index] = {
      ...appData.galleryItems[index],
      imageUrl: imageUrl !== undefined ? imageUrl.trim() : appData.galleryItems[index].imageUrl,
      description: description !== undefined ? description : appData.galleryItems[index].description,
      title: title !== undefined ? title : appData.galleryItems[index].title,
    };

    addLog('Mengedit Momen Galeri', ip, `Momen #${id} diperbarui`);
    saveData();
    res.json({ success: true, moment: appData.galleryItems[index], galleryItems: appData.galleryItems });
  });

  app.delete('/api/admin/gallery/:id', (req, res) => {
    const ip = getClientIp(req);
    const id = req.params.id;
    if (!appData.galleryItems) appData.galleryItems = [];

    const target = appData.galleryItems.find((g) => g.id === id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Momen galeri tidak ditemukan' });
    }

    appData.galleryItems = appData.galleryItems.filter((g) => g.id !== id);
    addLog('Menghapus Momen Galeri', ip, `Momen #${id} dihapus (${target.description.substring(0, 20)})`);
    saveData();
    res.json({ success: true, galleryItems: appData.galleryItems });
  });

  // 4. Update Description Text
  app.put('/api/admin/description', (req, res) => {
    const ip = getClientIp(req);
    const { descriptionText } = req.body;
    appData.descriptionText = typeof descriptionText === 'string' ? descriptionText : '';
    addLog('Mengubah Teks Deskripsi', ip, `Teks diperbarui: "${appData.descriptionText.substring(0, 30)}..."`);
    saveData();
    res.json({ success: true, descriptionText: appData.descriptionText });
  });

  // 5. Update Student Card
  app.put('/api/admin/student/:id', (req, res) => {
    const ip = getClientIp(req);
    const id = Number(req.params.id);
    const { name, birthDate, hobby, image } = req.body;

    const index = appData.students.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
    }

    appData.students[index] = {
      id,
      name: name ?? appData.students[index].name,
      birthDate: birthDate ?? appData.students[index].birthDate,
      hobby: hobby ?? appData.students[index].hobby,
      image: image ?? appData.students[index].image,
    };

    addLog('Mengedit Data Murid', ip, `Mengedit data kotak murid #${id} (${appData.students[index].name || 'Tanpa nama'})`);
    saveData();
    res.json({ success: true, student: appData.students[index] });
  });

  // 6. Delete / Clear Student Card
  app.delete('/api/admin/student/:id', (req, res) => {
    const ip = getClientIp(req);
    const id = Number(req.params.id);

    const index = appData.students.findIndex((s) => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
    }

    appData.students[index] = {
      id,
      name: '',
      birthDate: '',
      hobby: '',
      image: '',
    };

    addLog('Menghapus / Mengosongkan Data Murid', ip, `Mengosongkan kotak murid #${id}`);
    saveData();
    res.json({ success: true, student: appData.students[index] });
  });

  // 7. Change Admin Password (numeric only)
  app.put('/api/admin/password', (req, res) => {
    const ip = getClientIp(req);
    const { newPassword } = req.body;

    if (typeof newPassword !== 'string' || !/^\d+$/.test(newPassword) || newPassword.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Password baru harus berupa angka dan minimal 3 digit!',
      });
    }

    appData.adminPassword = newPassword;
    addLog('Mengubah Password Panel Admin', ip, 'Password panel admin berhasil diperbarui.');
    saveData();
    res.json({ success: true, message: 'Password admin berhasil diganti!' });
  });

  // 8. Get Visitors List (Fitur ke-2: IP Management)
  app.get('/api/admin/visitors', (req, res) => {
    res.json({
      visitors: Object.values(appData.visitors),
    });
  });

  // 9. Ban an IP
  app.post('/api/admin/visitors/ban', (req, res) => {
    const adminIp = getClientIp(req);
    const { targetIp, reason, minutes } = req.body;

    if (!targetIp) {
      return res.status(400).json({ success: false, message: 'IP target harus ditentukan' });
    }

    const now = new Date().toLocaleString('id-ID');
    const bannedUntil = minutes ? Date.now() + minutes * 60 * 1000 : null;

    if (!appData.visitors[targetIp]) {
      appData.visitors[targetIp] = {
        ip: targetIp,
        firstSeen: now,
        lastSeen: now,
        visitCount: 0,
        isBanned: true,
        bannedUntil,
        banReason: reason || 'Diblokir oleh admin',
      };
    } else {
      appData.visitors[targetIp].isBanned = true;
      appData.visitors[targetIp].bannedUntil = bannedUntil;
      appData.visitors[targetIp].banReason = reason || 'Diblokir oleh admin';
    }

    addLog(
      'Admin Mem-ban IP',
      adminIp,
      `Mem-ban IP ${targetIp} ${minutes ? `selama ${minutes} menit` : 'secara permanen'}. Alasan: ${reason || '-'}`
    );
    saveData();
    res.json({ success: true, visitor: appData.visitors[targetIp] });
  });

  // 10. Unban an IP
  app.post('/api/admin/visitors/unban', (req, res) => {
    const adminIp = getClientIp(req);
    const { targetIp } = req.body;

    if (!targetIp || !appData.visitors[targetIp]) {
      return res.status(400).json({ success: false, message: 'IP tidak ditemukan' });
    }

    appData.visitors[targetIp].isBanned = false;
    appData.visitors[targetIp].bannedUntil = null;
    appData.visitors[targetIp].banReason = '';

    addLog('Admin Meng-unban IP', adminIp, `Membuka blokir untuk IP ${targetIp}`);
    saveData();
    res.json({ success: true, visitor: appData.visitors[targetIp] });
  });

  // 11. Get Activity Logs
  app.get('/api/admin/logs', (req, res) => {
    res.json({ logs: appData.activityLogs });
  });

  // Ensure unmatched /api/* routes always return JSON 404, never Vite HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: `API route not found: ${req.method} ${req.path}` });
  });

  // API error handler to guarantee JSON on error
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api/')) {
      console.error('API Error:', err);
      return res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
    }
    next(err);
  });

  // Vite development mode or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
