'use client';

import AdminSidebar from '@/components/features/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-5 sm:py-10 px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <AdminSidebar />
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
