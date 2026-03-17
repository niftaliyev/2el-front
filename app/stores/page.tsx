'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Mock store data
const mockStores = [
  {
    id: '1',
    name: 'Prestige Homes',
    description: 'Premium daşınmaz əmlak agentliyi. Arzuladığınız evi bizimlə tapın.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBALyIDea0fsnHv4JFqFXAxbRxqXKUjCe-nJ-fJ6Yb9aoZqPBY52wZra33-aR8Pmqzh547WLQeA_OdhuYmBfZQ_SmqCDxh62WkU3T53fn8Jcbj4hzRknEUEEo7MiT69qNfzr05-UxGQcNJADkRYnjegCjsfW3NrmtxTeJc3HYzzBrgYCZGvkhIeDsTX1byGf40vu6ahL6lsNyqfV5Yp3REh45veCC4Jjp5lGJbRqyc6hQuqzLrKwFGDk204uUhZk0NeXLmZvdEYHtw',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0b5N6_5PFv-BrjF00tYppCcUQuFhzgQTL409tVdJra69Cx2dJQxSeDosG0pWczIEgo27RaDgIj3ybIUZq5yAJ4iz3I1lIFJclI9TZd3FKkIJi5We-aFwJQNxgVFWyBeVzq8d2ZY23YLChho-LTiwpk_cxl7CwOYsQhCGgcr6mw0HX-51ytABwvzmSN_vHjJQGTEXiWP5GJwniblpEm-EAwFF6W_j6bC9nlCrBrAsP-_NEOnFkAsSFz5qLIm4bTgyZ7AICExf3KXo',
    categories: [
      { name: 'Mənzillər', color: 'blue' },
      { name: 'Villalar', color: 'green' },
      { name: 'Ofislər', color: 'yellow' },
    ],
  },
  {
    id: '2',
    name: 'TechShop',
    description: 'Ən son model notbuklar, telefonlar və digər elektronika məhsulları.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8JX-Wao7OLKuvCZFXsIapctamRohJ8FZGiDhj2BswcGcgsxVptoQbi52UmNGJbmayFjQZmLHGpskz-xfPDyB_oVwuMPAnWyaKHa0RW7QgNE1r5rKPa0i0XrX-fy2oEjjyJE2eR3aU50SICmSxnY_klImOXT2cA4FuClK4-5pKCaYcB3LLLsRSXKUfc1-d4Q6TAgmvXbDsYve0m8B1IOvulhxa_AD9SUFpZ5o-KVkh8pQYnHCQAttW-zhVHp5ChttAZq3oidhL5JI',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp9r_idhj6r70avNTR6DarlP3QsExcN2kuLW5w2J0Z1X1KqIV81vJTZunFZMBp9zXTilq_Y3S0R_H37qFwpHLFE99QjpoFQwzcifMNSQ_0q6iggDIZ26N6I_6Y9gvGUZnsXucTbJ9jDaPhgqfGnEYLS5TDhWSW-oXkFENlFYODYpLhjaAHRbUubi5layWMGVUd-0FG2yOBaStWFvg6jDeNWtm82-1N13maDfpTKSRbvxJQ-_3tQQnWuYr9I1_pakYYB-63M0-OPuU',
    categories: [
      { name: 'Notbuklar', color: 'indigo' },
      { name: 'Smartfonlar', color: 'purple' },
      { name: 'Aksesuarlar', color: 'pink' },
    ],
  },
  {
    id: '3',
    name: 'AvtoHəll',
    description: 'Yeni və işlənmiş avtomobillərin satışı. Sərfəli kredit və lizinq şərtləri.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCB-tOrVSYrosblx83moP3JuomgOiJ5CPr3mAJATFLa-Ca9DgdmwrukBjlJRL4_Mc8yyh2-uhSt_zS7jQu-uqEyS0cNEFsMxD6bYfQHw5kzj5pq21wu7pXBU2FqxkhAPhqmbcUc5I9-AWpup0_ONbOAVfIhnf-v0lO3yFfriv1zYndZBXl6XA5xjFtV0m0S4IgSS2SJS1Z5CCTyyC6PCUPxsicf4PQiiF6cmGiZs7hTMEZwD1Cw0EKt4gYWz4D1T9Fy9nf_-oT0LIQ',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCo33o-JYGcX4OJsx18QkaGVPvje6a_cgf7qkU7bLqUQQP5nGLEY-z26ItxZFikMiF5sxKv7p-_w9EhmDPf0TIkFgNLcLWj_mGS5V5U6RygNbU4HXUgj8VAawVvkHTGYsXEfOVYJIc86ilSt13jHzW3I8K1gnMm8e_dukEZm1DbirVRYNqrxKUlxNHr3YLYUSZx1WgcCLlFRgoLh0SeSVrC8c3pciKX78zR0Il3QatUd-N8ZUuf9ZZTF8cgbrBr93jZG8_BgpR1Bvs',
    categories: [
      { name: 'Sedan', color: 'gray' },
      { name: 'SUV', color: 'red' },
      { name: 'Ehtiyat hissələri', color: 'orange' },
    ],
  },
  {
    id: '4',
    name: 'Mebel Evi',
    description: 'Hər zövqə uyğun klassik və modern mebellərin satışı və sifarişi.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8JX-Wao7OLKuvCZFXsIapctamRohJ8FZGiDhj2BswcGcgsxVptoQbi52UmNGJbmayFjQZmLHGpskz-xfPDyB_oVwuMPAnWyaKHa0RW7QgNE1r5rKPa0i0XrX-fy2oEjjyJE2eR3aU50SICmSxnY_klImOXT2cA4FuClK4-5pKCaYcB3LLLsRSXKUfc1-d4Q6TAgmvXbDsYve0m8B1IOvulhxa_AD9SUFpZ5o-KVkh8pQYnHCQAttW-zhVHp5ChttAZq3oidhL5JI',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8JX-Wao7OLKuvCZFXsIapctamRohJ8FZGiDhj2BswcGcgsxVptoQbi52UmNGJbmayFjQZmLHGpskz-xfPDyB_oVwuMPAnWyaKHa0RW7QgNE1r5rKPa0i0XrX-fy2oEjjyJE2eR3aU50SICmSxnY_klImOXT2cA4FuClK4-5pKCaYcB3LLLsRSXKUfc1-d4Q6TAgmvXbDsYve0m8B1IOvulhxa_AD9SUFpZ5o-KVkh8pQYnHCQAttW-zhVHp5ChttAZq3oidhL5JI',
    categories: [
      { name: 'Yataq dəstləri', color: 'teal' },
      { name: 'Qonaq otağı', color: 'cyan' },
      { name: 'Mətbəx mebeli', color: 'lime' },
    ],
  },
  {
    id: '5',
    name: 'Kitab Dünyası',
    description: 'Bədii, elmi və uşaq ədəbiyyatının geniş çeşidi. Onlayn sifariş imkanı.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpNALD7ss1o2G_YcVp1G3jzMNWDlVJdPGSIgRsasgNRaTHCh4ZkovaEZ1x1dkFPMnbA7UHesbHqdX0Q2tIHuiR5JGBEcp22Dg9IFBIyj3Qyk-hOARpBjuuSxtbPMEeyhiqt66wSSk1uoWYd7L_EsuiyctDuyGle7E3a3Ch5GF0kz-H9fOSfK9cd0gvLNTP9kCqI92do_ZKMdO3Gi8C4pX8Gm-m6qeYHOeAxRi_T-hIw7Ifm1r-CWfk2RsNC-S7O1HRZQa6lG5FY3k',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8JX-Wao7OLKuvCZFXsIapctamRohJ8FZGiDhj2BswcGcgsxVptoQbi52UmNGJbmayFjQZmLHGpskz-xfPDyB_oVwuMPAnWyaKHa0RW7QgNE1r5rKPa0i0XrX-fy2oEjjyJE2eR3aU50SICmSxnY_klImOXT2cA4FuClK4-5pKCaYcB3LLLsRSXKUfc1-d4Q6TAgmvXbDsYve0m8B1IOvulhxa_AD9SUFpZ5o-KVkh8pQYnHCQAttW-zhVHp5ChttAZq3oidhL5JI',
    categories: [
      { name: 'Bestsellerlər', color: 'yellow' },
      { name: 'Uşaq ədəbiyyatı', color: 'green' },
    ],
  },
  {
    id: '6',
    name: 'SportStyle',
    description: 'Dünya brendlərindən orijinal idman geyimləri və ayaqqabıları.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8JX-Wao7OLKuvCZFXsIapctamRohJ8FZGiDhj2BswcGcgsxVptoQbi52UmNGJbmayFjQZmLHGpskz-xfPDyB_oVwuMPAnWyaKHa0RW7QgNE1r5rKPa0i0XrX-fy2oEjjyJE2eR3aU50SICmSxnY_klImOXT2cA4FuClK4-5pKCaYcB3LLLsRSXKUfc1-d4Q6TAgmvXbDsYve0m8B1IOvulhxa_AD9SUFpZ5o-KVkh8pQYnHCQAttW-zhVHp5ChttAZq3oidhL5JI',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8JX-Wao7OLKuvCZFXsIapctamRohJ8FZGiDhj2BswcGcgsxVptoQbi52UmNGJbmayFjQZmLHGpskz-xfPDyB_oVwuMPAnWyaKHa0RW7QgNE1r5rKPa0i0XrX-fy2oEjjyJE2eR3aU50SICmSxnY_klImOXT2cA4FuClK4-5pKCaYcB3LLLsRSXKUfc1-d4Q6TAgmvXbDsYve0m8B1IOvulhxa_AD9SUFpZ5o-KVkh8pQYnHCQAttW-zhVHp5ChttAZq3oidhL5JI',
    categories: [
      { name: 'Ayaqqabılar', color: 'blue' },
      { name: 'Geyimlər', color: 'purple' },
      { name: 'İdman ləvazimatları', color: 'gray' },
    ],
  },
  {
    id: '7',
    name: 'PetPlanet',
    description: 'Ev heyvanlarınız üçün hər şey: yemlər, aksesuarlar, oyuncaqlar və s.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8JX-Wao7OLKuvCZFXsIapctamRohJ8FZGiDhj2BswcGcgsxVptoQbi52UmNGJbmayFjQZmLHGpskz-xfPDyB_oVwuMPAnWyaKHa0RW7QgNE1r5rKPa0i0XrX-fy2oEjjyJE2eR3aU50SICmSxnY_klImOXT2cA4FuClK4-5pKCaYcB3LLLsRSXKUfc1-d4Q6TAgmvXbDsYve0m8B1IOvulhxa_AD9SUFpZ5o-KVkh8pQYnHCQAttW-zhVHp5ChttAZq3oidhL5JI',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8JX-Wao7OLKuvCZFXsIapctamRohJ8FZGiDhj2BswcGcgsxVptoQbi52UmNGJbmayFjQZmLHGpskz-xfPDyB_oVwuMPAnWyaKHa0RW7QgNE1r5rKPa0i0XrX-fy2oEjjyJE2eR3aU50SICmSxnY_klImOXT2cA4FuClK4-5pKCaYcB3LLLsRSXKUfc1-d4Q6TAgmvXbDsYve0m8B1IOvulhxa_AD9SUFpZ5o-KVkh8pQYnHCQAttW-zhVHp5ChttAZq3oidhL5JI',
    categories: [
      { name: 'Heyvan yemləri', color: 'green' },
      { name: 'Aksesuarlar', color: 'indigo' },
    ],
  },
  {
    id: '8',
    name: 'Tikinti Market',
    description: 'Təmir və tikinti üçün lazım olan hər növ material və alətlər.',
    coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8JX-Wao7OLKuvCZFXsIapctamRohJ8FZGiDhj2BswcGcgsxVptoQbi52UmNGJbmayFjQZmLHGpskz-xfPDyB_oVwuMPAnWyaKHa0RW7QgNE1r5rKPa0i0XrX-fy2oEjjyJE2eR3aU50SICmSxnY_klImOXT2cA4FuClK4-5pKCaYcB3LLLsRSXKUfc1-d4Q6TAgmvXbDsYve0m8B1IOvulhxa_AD9SUFpZ5o-KVkh8pQYnHCQAttW-zhVHp5ChttAZq3oidhL5JI',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpNALD7ss1o2G_YcVp1G3jzMNWDlVJdPGSIgRsasgNRaTHCh4ZkovaEZ1x1dkFPMnbA7UHesbHqdX0Q2tIHuiR5JGBEcp22Dg9IFBIyj3Qyk-hOARpBjuuSxtbPMEeyhiqt66wSSk1uoWYd7L_EsuiyctDuyGle7E3a3Ch5GF0kz-H9fOSfK9cd0gvLNTP9kCqI92do_ZKMdO3Gi8C4pX8Gm-m6qeYHOeAxRi_T-hIw7Ifm1r-CWfk2RsNC-S7O1HRZQa6lG5FY3k',
    categories: [
      { name: 'Alətlər', color: 'red' },
      { name: 'Boya', color: 'yellow' },
      { name: 'Santexnika', color: 'blue' },
    ],
  },
];

const getCategoryColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    teal: 'bg-teal-100 text-teal-800',
    cyan: 'bg-cyan-100 text-cyan-800',
    lime: 'bg-lime-100 text-lime-800',
  };
  return colors[color] || colors.gray;
};

const ITEMS_PER_PAGE = 8;

export default function StoresPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredStores = mockStores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentStores = filteredStores.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <main className="container mx-auto px-4 sm:px-10 py-5 sm:py-10">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mağazalar</h1>
            <p className="text-gray-600 mt-2">Etibarlı satıcılardan keyfiyyətli məhsullar</p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
            {/* Search Bar */}
            <label className="w-full sm:w-72">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-11">
                <div className="text-gray-500 flex border border-r-0 border-gray-300 bg-white items-center justify-center pl-3.5 rounded-l-lg">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-primary border border-l-0 border-gray-300 bg-white h-full placeholder:text-gray-500 px-4 pl-2 text-base font-normal leading-normal"
                  placeholder="Mağaza adı ilə axtarış"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </label>

            {/* View Mode Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center size-11 cursor-pointer rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <span className="material-symbols-outlined !text-2xl">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center size-11 cursor-pointer rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <span className="material-symbols-outlined !text-2xl">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentStores.map((store) => (
            <Link key={store.id} href={`/stores/${store.id}`} className="h-full">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full group cursor-pointer hover:shadow-md transition-shadow">
                {/* Cover Image */}
                <div className="h-32 relative">
                  <Image
                    src={store.coverImage}
                    alt={`${store.name} cover`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Store Info */}
                <div className="p-5 flex flex-col items-center text-center -mt-14">
                  {/* Logo */}
                  <div className="size-24 rounded-full border-4 border-white bg-white shadow-md relative overflow-hidden">
                    <Image
                      src={store.logo}
                      alt={`${store.name} logo`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Name & Description */}
                  <h3 className="text-lg font-bold mt-3 text-gray-900 group-hover:text-primary transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 h-10 line-clamp-2">
                    {store.description}
                  </p>
                </div>

                {/* Categories */}
                <div className="px-5 pb-5 mt-auto">
                  <div className="flex flex-wrap justify-center gap-2">
                    {store.categories.map((category, idx) => (
                      <span
                        key={idx}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCategoryColor(
                          category.color
                        )}`}
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {filteredStores.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center size-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex items-center justify-center size-10 rounded-lg border transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center size-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}

        {/* No Results */}
        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-gray-400 !text-5xl">store</span>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Mağaza tapılmadı</h3>
            <p className="mt-1 text-sm text-gray-500">Axtarış kriteriyalarınızı dəyişdirin.</p>
          </div>
        )}
      </div>
    </main>
  );
}
