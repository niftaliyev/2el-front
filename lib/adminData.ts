import { AdminUser, AdminAd, DashboardStats, RecentActivity } from '@/types/admin';

export function generateDashboardStats(): DashboardStats {
  return {
    totalUsers: 2847,
    totalAds: 12453,
    pendingApprovals: 47,
    activeAds: 9234,
    totalRevenue: 45670,
    todayUsers: 23,
    todayAds: 67,
  };
}

export function generateRecentActivities(): RecentActivity[] {
  const activities: RecentActivity[] = [
    {
      id: '1',
      type: 'ad_created',
      title: 'Yeni elan yaradıldı',
      description: 'iPhone 15 Pro Max - 256GB',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      user: { id: 'u1', name: 'Elçin Məmmədov' }
    },
    {
      id: '2',
      type: 'ad_approved',
      title: 'Elan təsdiqləndi',
      description: 'Toyota Camry 2020',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      user: { id: 'u2', name: 'Nigar Əliyeva' }
    },
    {
      id: '3',
      type: 'user_registered',
      title: 'Yeni istifadəçi qeydiyyatdan keçdi',
      description: 'Rəşad Həsənov',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      user: { id: 'u3', name: 'Rəşad Həsənov' }
    },
    {
      id: '4',
      type: 'ad_rejected',
      title: 'Elan rədd edildi',
      description: 'Satış elanı - Uyğun olmayan məzmun',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      id: '5',
      type: 'ad_created',
      title: 'Yeni elan yaradıldı',
      description: '3 otaqlı mənzil - Yasamal',
      timestamp: new Date(Date.now() - 65 * 60 * 1000),
      user: { id: 'u4', name: 'Səməd Quliyev' }
    },
    {
      id: '6',
      type: 'user_suspended',
      title: 'İstifadəçi dayandırıldı',
      description: 'Spam fəaliyyəti',
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
    },
    {
      id: '7',
      type: 'ad_approved',
      title: 'Elan təsdiqləndi',
      description: 'Samsung Galaxy S24 Ultra',
      timestamp: new Date(Date.now() - 120 * 60 * 1000),
      user: { id: 'u5', name: 'Aynur İsmayılova' }
    },
    {
      id: '8',
      type: 'ad_deleted',
      title: 'Elan silindi',
      description: 'İstifadəçi tərəfindən silindi',
      timestamp: new Date(Date.now() - 150 * 60 * 1000),
    },
  ];

  return activities;
}

const azerbaijaniNames = [
  'Elçin Məmmədov', 'Nigar Əliyeva', 'Rəşad Həsənov', 'Səməd Quliyev',
  'Aynur İsmayılova', 'Fərid Abdullayev', 'Günel Hüseynova', 'Kamran Əliyev',
  'Leyla Mustafayeva', 'Murad Bayramov', 'Nərgiz Qasımova', 'Orxan Sadıqov',
  'Pərviz Rzayev', 'Səbinə Nəsibova', 'Tural Əhmədov', 'Ülviyyə Məmmədova',
  'Vüqar Hacıyev', 'Yusif Cəfərov', 'Zaur Əkbərov', 'Könül İbrahimova',
  'Aysel Rəhimova', 'Cavid Məhərrəmov', 'Dilbər Əzizova', 'Emil Babayev',
  'Fəxri Məhəmmədov', 'Gülay Həsənova', 'Həsən Nağıyev', 'İlham Qurbanov',
  'Jalə Sultanova', 'Kamil Əsgərov', 'Lalə Vəliyeva', 'Mahir Ramazanov',
];

export function generateAdminUsers(count: number = 50): AdminUser[] {
  const users: AdminUser[] = [];

  for (let i = 0; i < count; i++) {
    const name = azerbaijaniNames[i % azerbaijaniNames.length];
    const registeredDaysAgo = Math.floor(Math.random() * 180);
    const lastLoginDaysAgo = Math.floor(Math.random() * 7);
    const statusRand = Math.random();

    let status: 'active' | 'suspended' | 'banned';
    if (statusRand > 0.85) status = 'suspended';
    else if (statusRand > 0.95) status = 'banned';
    else status = 'active';

    users.push({
      id: `user-${i + 1}`,
      name: name,
      email: `${name.toLowerCase().replace(/\s+/g, '').replace(/[çğıöşü]/g, (m) => ({
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'
      }[m] || m))}${i}@example.com`,
      phone: `+994${50 + Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 1000000).toString().padStart(7, '0')}`,
      avatar: `https://i.pravatar.cc/150?u=${i}`,
      createdAt: new Date(Date.now() - registeredDaysAgo * 24 * 60 * 60 * 1000),
      isVerified: Math.random() > 0.3,
      status: status,
      registeredAt: new Date(Date.now() - registeredDaysAgo * 24 * 60 * 60 * 1000),
      lastLogin: new Date(Date.now() - lastLoginDaysAgo * 24 * 60 * 60 * 1000),
      adsCount: Math.floor(Math.random() * 50),
      isAdmin: i < 2,
    });
  }

  return users;
}

const adTitles = [
  'iPhone 15 Pro Max - 256GB',
  'Toyota Camry 2020',
  'Yasamal rayonunda 3 otaqlı mənzil',
  'Samsung Galaxy S24 Ultra',
  'MacBook Pro 16" M3 Max',
  'Honda Civic 2021',
  'Nəsimi rayonunda ofis sahəsi',
  'PlayStation 5 + 2 Oyun',
  'Kişi kostyumu - İtaliya istehsalı',
  'Canon EOS R5 Kamera',
  'BMW X5 2022',
  'Xətai rayonunda 2 otaqlı mənzil',
  'Dell XPS 15 Laptop',
  'Mercedes-Benz E-Class 2023',
  'Nərimanov rayonunda villa',
  'iPad Pro 12.9" - 512GB',
  'Audi A6 2021',
  'Səbail rayonunda mağaza',
  'Sony PlayStation VR2',
  'Qadın geyimi topdan satış',
  'Nikon Z8 Kamera',
  'Tesla Model 3 2022',
  'Binəqədi rayonunda torpaq sahəsi',
  'MacBook Air M2',
  'Range Rover Sport 2023',
  'Suraxanı rayonunda ev',
  'Samsung QLED 75" TV',
  'Hyundai Tucson 2021',
  'Nizami rayonunda kommersiya sahəsi',
  'AirPods Pro 2',
];

const categories = [
  'Elektronika',
  'Nəqliyyat',
  'Daşınmaz əmlak',
  'Geyim və aksesuarlar',
  'Ev və bağ',
  'İdman və istirahət',
];

export function generateAdminAds(count: number = 100): AdminAd[] {
  const ads: AdminAd[] = [];

  for (let i = 0; i < count; i++) {
    const createdDaysAgo = Math.floor(Math.random() * 30);
    const statusRand = Math.random();

    let status: 'active' | 'pending' | 'rejected' | 'expired';
    if (statusRand > 0.7) status = 'active';
    else if (statusRand > 0.4) status = 'pending';
    else if (statusRand > 0.2) status = 'rejected';
    else status = 'expired';

    const sellerIndex = Math.floor(Math.random() * 32);
    const sellerName = azerbaijaniNames[sellerIndex];

    ads.push({
      id: `ad-${i + 1}`,
      title: adTitles[i % adTitles.length],
      description: 'Elanın ətraflı təsviri burada olacaq. Məhsul haqqında geniş məlumat.',
      price: Math.floor(Math.random() * 50000) + 100,
      currency: '₼',
      images: [
        `https://picsum.photos/400/300?random=${i}`,
        `https://picsum.photos/400/300?random=${i + 1000}`,
      ],
      category: categories[Math.floor(Math.random() * categories.length)],
      location: 'Bakı, Azərbaycan',
      seller: {
        id: `user-${sellerIndex + 1}`,
        name: sellerName,
        email: `${sellerName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      },
      status: status,
      isPremium: Math.random() > 0.8,
      isFeatured: Math.random() > 0.9,
      isBoosted: Math.random() > 0.85,
      createdAt: new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000),
      viewCount: Math.floor(Math.random() * 1000),
      rejectionReason: status === 'rejected' ? 'Uyğun olmayan məzmun və ya qaydalar pozuntusu' : undefined,
    });
  }

  return ads;
}
