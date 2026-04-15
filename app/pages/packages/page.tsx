export const metadata = {
  title: 'Pullu xidmətlər və Qaydalar - ElanAz',
  description: 'Saytın təqdim etdiyi ödənişli xidmətlər (VIP, Premium, Boost) və yerləşdirmə qaydaları haqqında ətraflı məlumat.',
};

export default function ServicesAndPackagesPage() {
  return (
    <main className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-6">
            Ödənişli xidmətlər
          </h1>

          <div className="space-y-12">
            
            {/* VIP Ads */}
            <section className="flex flex-col md:flex-row gap-6">
               <div className="size-16 sm:size-20 bg-[#fff5f5] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined !text-4xl text-red-500">diamond</span>
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    VIP elanlar
                    <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">VIP</span>
                  </h2>
                  <p className="text-gray-600 leading-relaxed font-medium mb-4">
                    VIP elanlar saytın ana səhifəsində xüsusi VIP blokunda təsadüfi şəkildə göstərilir. Onlayn olan alıcıların birbaşa diqqətini cəlb etdiyi üçün, adi elanlara nisbətən 20 dəfə daha çox baxış və müraciət qazanır.
                  </p>
                  <ul className="list-disc list-inside text-gray-500 space-y-1 font-medium text-sm">
                     <li>Ana səhifədə prioritet nümayiş</li>
                     <li>Tez və asan müştəri tapmaq imkanı</li>
                     <li>Axtarış nəticələrində fərqləndirilmə</li>
                  </ul>
               </div>
            </section>

            <hr className="border-gray-100" />

            {/* Premium Ads */}
            <section className="flex flex-col md:flex-row gap-6">
               <div className="size-16 sm:size-20 bg-yellow-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined !text-4xl text-yellow-600">stars</span>
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    Premium elanlar
                    <span className="bg-yellow-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">Premıum</span>
                  </h2>
                  <p className="text-gray-600 leading-relaxed font-medium mb-4">
                    Premium elanlar xüsusi rənglə axtarış nəticələrinin ən üstündə bərkidilir və yeni pulsuz elanlar onları aşağı sala bilmir. Bu sizin elanınızın uzun müddət eyni reytinqdə qalmasını təmin edir.
                  </p>
                  <ul className="list-disc list-inside text-gray-500 space-y-1 font-medium text-sm">
                     <li>Axtarışın ilk səhifəsində premium seqmentdə göstərilir</li>
                     <li>Standart rəngdən fərqli, parlaq fonda çıxır</li>
                     <li>Adətən 3, 7, 15 günlük təklif olunur</li>
                  </ul>
               </div>
            </section>

            <hr className="border-gray-100" />

            {/* Boost Ads */}
            <section className="flex flex-col md:flex-row gap-6">
               <div className="size-16 sm:size-20 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined !text-4xl text-blue-500">arrow_upward</span>
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    İrəli çək (Boost)
                  </h2>
                  <p className="text-gray-600 leading-relaxed font-medium mb-4">
                    Elanınız siyahıda aşağıya düşübsə, onu təkrar pulsuz və axtarış siyahısının ən üstünə qaytarmaq üçün istifadə edilir.
                  </p>
                  <ul className="list-disc list-inside text-gray-500 space-y-1 font-medium text-sm">
                     <li>Elanın tarixi yenilənir</li>
                     <li>Axtarışda dərhal ən üst sıralara çıxarılır</li>
                     <li>Gündə avtomatik irəli çəkilmə paketi ilə də birləşdirilə bilər</li>
                  </ul>
               </div>
            </section>

             <hr className="border-gray-100" />

            {/* Business Packages */}
            <section className="flex flex-col md:flex-row gap-6">
               <div className="size-16 sm:size-20 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined !text-4xl text-white">storefront</span>
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Biznes Paketləri (Mağaza)
                  </h2>
                  <p className="text-gray-600 leading-relaxed font-medium mb-4">
                    Mağazalar üçün təqdim edilən xüsusi abunə paketləridir. Eyni anda çox sayda məhsul satanlar üçün daha uyğun və sərfəlidir. Hər paketdə əlavə xidmət balansı mövcuddur.
                  </p>
                  <div className="mb-4">
                      <a href="/cabinet/business/packages" className="text-primary font-bold hover:underline text-sm flex items-center gap-1">
                          Paketlərlə tanış olun <span className="material-symbols-outlined !text-sm">arrow_forward</span>
                      </a>
                  </div>
               </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
