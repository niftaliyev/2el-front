'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { helpService } from '@/services/help.service';
import { HelpCategory, HelpItem, StaticPage, LegalPolicy, PrivacyPolicy } from '@/types/help';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type TabType = 'categories' | 'static' | 'legal' | 'privacy';

export default function AdminHelpPage() {
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [loading, setLoading] = useState(true);

  // Data states
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [staticPages, setStaticPages] = useState<StaticPage[]>([]);
  const [legalPolicies, setLegalPolicies] = useState<LegalPolicy[]>([]);
  const [privacyPolicy, setPrivacyPolicy] = useState<PrivacyPolicy | null>(null);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isStaticModalOpen, setIsStaticModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Editing states
  const [editingCategory, setEditingCategory] = useState<Partial<HelpCategory> | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<HelpItem> & { categoryId?: string } | null>(null);
  const [editingStatic, setEditingStatic] = useState<Partial<StaticPage> | null>(null);
  const [editingLegal, setEditingLegal] = useState<Partial<LegalPolicy> | null>(null);
  const [editingPrivacy, setEditingPrivacy] = useState<Partial<PrivacyPolicy> | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catData, staticData, legalData] = await Promise.all([
        helpService.getContent(),
        helpService.getStaticPages(),
        helpService.getLegalPolicies()
      ]);

      setCategories(catData);
      setStaticPages(staticData);
      setLegalPolicies(legalData);

      try {
        const priv = await helpService.getPrivacyPolicy('privacy');
        setPrivacyPolicy(priv);
      } catch {
        setPrivacyPolicy(null);
      }

    } catch (error) {
      console.error('Error fetching help content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    try {
      await adminService.upsertHelpCategory(editingCategory);
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Xəta baş verdi');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bu kateqoriyanı və bütün suallarını silmək istədiyinizə əminsiniz?')) return;
    try {
      await adminService.deleteHelpCategory(id);
      fetchData();
    } catch (error) {
      alert('Xəta baş verdi');
    }
  };

  // Item Actions
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.question || !editingItem?.categoryId) return;
    try {
      await adminService.upsertHelpItem(editingItem.categoryId, editingItem);
      setIsItemModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Xəta baş verdi');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Bu sualı silmək istədiyinizə əminsiniz?')) return;
    try {
      await adminService.deleteHelpItem(id);
      fetchData();
    } catch (error) {
      alert('Xəta baş verdi');
    }
  };

  // Static Page Actions
  const handleSaveStatic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStatic?.title || !editingStatic?.content) return;
    try {
      await adminService.upsertStaticPage(editingStatic);
      setIsStaticModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Xəta baş verdi');
    }
  };

  const handleDeleteStatic = async (id: string) => {
    if (!confirm('Bu səhifəni silmək istədiyinizə əminsiniz?')) return;
    try {
      await adminService.deleteStaticPage(id);
      fetchData();
    } catch (error) {
      alert('Xəta baş verdi');
    }
  };

  // Legal Policy Actions
  const handleSaveLegal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLegal?.title || !editingLegal?.content) return;
    try {
      await adminService.upsertLegalPolicy(editingLegal);
      setIsLegalModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Xəta baş verdi');
    }
  };

  const handleDeleteLegal = async (id: string) => {
    if (!confirm('Bu hüquqi sənədi silmək istədiyinizə əminsiniz?')) return;
    try {
      await adminService.deleteLegalPolicy(id);
      fetchData();
    } catch (error) {
      alert('Xəta baş verdi');
    }
  };

  // Privacy Policy Actions
  const handleSavePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrivacy?.title || !editingPrivacy?.content) return;
    try {
      await adminService.upsertPrivacyPolicy(editingPrivacy);
      setIsPrivacyModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Xəta baş verdi');
    }
  };

  const handleDeletePrivacy = async (id: string) => {
    if (!confirm('Bu məxfilik siyasətini silmək istədiyinizə əminsiniz?')) return;
    try {
      await adminService.deletePrivacyPolicy(id);
      fetchData();
    } catch (error) {
      alert('Xəta baş verdi');
    }
  };

  const tabs = [
    { id: 'categories', label: 'Yardım Kateqoriyaları', icon: 'help_outline' },
    { id: 'static', label: 'Statik Səhifələr', icon: 'description' },
    { id: 'legal', label: 'Hüquqi Sənədlər', icon: 'gavel' },
    { id: 'privacy', label: 'Məxfilik', icon: 'security' },
  ];

  if (loading) return <div className="p-8 text-center text-gray-500">Yüklənir...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Yardım və Səhifələr</h1>
          <p className="text-gray-600">Bütün yardım menyularını və hüquqi sənədləri idarə edin</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'categories' && (
            <Button onClick={() => { setEditingCategory({}); setIsCategoryModalOpen(true); }}>Yeni Kateqoriya</Button>
          )}
          {activeTab === 'static' && (
            <Button onClick={() => { setEditingStatic({}); setIsStaticModalOpen(true); }}>Yeni Səhifə</Button>
          )}
          {activeTab === 'legal' && (
            <Button onClick={() => { setEditingLegal({}); setIsLegalModalOpen(true); }}>Yeni Hüquqi Sənəd</Button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-primary text-white shadow-md shadow-primary/20 scale-105 z-10"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <span className="material-symbols-outlined !text-[20px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
        {/* Render Content Based on Active Tab */}
        {activeTab === 'categories' && (
          <div className="flex flex-col gap-8">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">Sıra: {category.displayOrder}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="!py-1!px-3 text-sm h-8" onClick={() => { setEditingItem({ categoryId: category.id }); setIsItemModalOpen(true); }}>Sual əlavə et</Button>
                    <button onClick={() => { setEditingCategory(category); setIsCategoryModalOpen(true); }} className="material-symbols-outlined text-blue-500 hover:text-blue-600">edit</button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="material-symbols-outlined text-red-500 hover:text-red-600">delete</button>
                  </div>
                </div>
                <div className="p-6">
                  {category.helpItems.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 border-b last:border-0 flex justify-between items-start group">
                      <div>
                        <div className="font-semibold text-gray-800">{item.question}</div>
                        <div className="text-sm text-gray-500 line-clamp-1" dangerouslySetInnerHTML={{ __html: item.answer }} />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingItem({ ...item, categoryId: category.id }); setIsItemModalOpen(true); }} className="material-symbols-outlined text-gray-400 hover:text-blue-500">edit</button>
                        <button onClick={() => handleDeleteItem(item.id)} className="material-symbols-outlined text-gray-400 hover:text-red-500">delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'static' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {staticPages.map(page => (
              <div key={page.id} className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow group relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-gray-900 text-lg mb-1">{page.title}</h3>
                    <p className="text-xs text-primary font-bold">/{page.slug}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingStatic(page); setIsStaticModalOpen(true); }} className="material-symbols-outlined text-blue-500">edit</button>
                    <button onClick={() => handleDeleteStatic(page.id)} className="material-symbols-outlined text-red-500">delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="divide-y divide-gray-100">
            {legalPolicies.map(policy => (
              <div key={policy.id} className="py-6 flex justify-between items-center group">
                <div>
                  <h3 className="font-black text-gray-900 text-lg mb-1">{policy.title}</h3>
                  <div className="flex gap-3 text-xs text-gray-400 font-medium">
                    <span>Versiya: № {policy.version}</span>
                    <span>•</span>
                    <span>Effektiv Tarix: {format(new Date(policy.effectiveDate), 'dd.MM.yyyy')}</span>
                  </div>
                </div>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingLegal(policy); setIsLegalModalOpen(true); }} className="material-symbols-outlined text-blue-500">edit</button>
                  <button onClick={() => handleDeleteLegal(policy.id)} className="material-symbols-outlined text-red-500">delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="flex flex-col gap-6">
            {privacyPolicy ? (
              <div className="p-8 border border-gray-100 rounded-3xl bg-gray-50/50">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">{privacyPolicy.title}</h2>
                    <p className="text-sm text-gray-500">Son yenilənmə: {format(new Date(privacyPolicy.effectiveDate), 'dd.MM.yyyy')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setEditingPrivacy(privacyPolicy); setIsPrivacyModalOpen(true); }}>Düzəliş et</Button>
                    <Button variant="outline" className="text-red-500 border-red-100 hover:bg-red-50" onClick={() => handleDeletePrivacy(privacyPolicy.id)}>Sil</Button>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-gray-100 prose max-w-none line-clamp-[10]" dangerouslySetInnerHTML={{ __html: privacyPolicy.content }} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="material-symbols-outlined !text-[64px] text-gray-200 mb-4">security</span>
                <p className="text-gray-500 font-medium mb-6">Məxfilik siyasəti hələ yaradılmayıb</p>
                <Button onClick={() => { setEditingPrivacy({ title: 'Məxfilik siyasəti', slug: 'privacy' }); setIsPrivacyModalOpen(true); }}>Yaradın</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="Kateqoriya">
        <form onSubmit={handleSaveCategory} className="space-y-4 pt-4">
          <Input label="Ad" required value={editingCategory?.name || ''} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} />
          <Input label="Sıra" type="number" value={editingCategory?.displayOrder || 0} onChange={(e) => setEditingCategory({ ...editingCategory, displayOrder: parseInt(e.target.value) })} />
          <Button type="submit" className="w-full">Yadda Saxla</Button>
        </form>
      </Modal>

      <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="Sual-Cavab">
        <form onSubmit={handleSaveItem} className="space-y-4 pt-4">
          <Input label="Sual" required value={editingItem?.question || ''} onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })} />
          <Textarea label="Cavab (HTML)" required rows={8} value={editingItem?.answer || ''} onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })} />
          <Input label="Sıra" type="number" value={editingItem?.displayOrder || 0} onChange={(e) => setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value) })} />
          <Button type="submit" className="w-full">Yadda Saxla</Button>
        </form>
      </Modal>

      <Modal isOpen={isStaticModalOpen} onClose={() => setIsStaticModalOpen(false)} title="Statik Səhifə">
        <form onSubmit={handleSaveStatic} className="space-y-4 pt-4">
          <Input label="Başlıq" required value={editingStatic?.title || ''} onChange={(e) => setEditingStatic({ ...editingStatic, title: e.target.value })} />
          <Input label="Slug (Url yolu)" required value={editingStatic?.slug || ''} onChange={(e) => setEditingStatic({ ...editingStatic, slug: e.target.value })} />
          <Textarea label="Məzmun (HTML)" required rows={12} value={editingStatic?.content || ''} onChange={(e) => setEditingStatic({ ...editingStatic, content: e.target.value })} />
          <Input label="Sıra" type="number" value={editingStatic?.displayOrder || 0} onChange={(e) => setEditingStatic({ ...editingStatic, displayOrder: parseInt(e.target.value) })} />
          <Button type="submit" className="w-full">Yadda Saxla</Button>
        </form>
      </Modal>

      <Modal isOpen={isLegalModalOpen} onClose={() => setIsLegalModalOpen(false)} title="Hüquqi Sənəd">
        <form onSubmit={handleSaveLegal} className="space-y-6 pt-4 max-h-[80vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Başlıq" required value={editingLegal?.title || ''} onChange={(e) => setEditingLegal({ ...editingLegal, title: e.target.value })} />
            <Input label="Slug" required value={editingLegal?.slug || ''} onChange={(e) => setEditingLegal({ ...editingLegal, slug: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Redaksiya №" value={editingLegal?.version || ''} onChange={(e) => setEditingLegal({ ...editingLegal, version: e.target.value })} />
            <Input label="Dərc Tarixi" type="date" value={editingLegal?.publishedDate?.split('T')[0] || ''} onChange={(e) => setEditingLegal({ ...editingLegal, publishedDate: e.target.value })} />
            <Input label="Effektiv Tarix" type="date" value={editingLegal?.effectiveDate?.split('T')[0] || ''} onChange={(e) => setEditingLegal({ ...editingLegal, effectiveDate: e.target.value })} />
          </div>
          <Textarea label="Məzmun (HTML)" required rows={12} value={editingLegal?.content || ''} onChange={(e) => setEditingLegal({ ...editingLegal, content: e.target.value })} />
          <Input label="Sıra" type="number" value={editingLegal?.displayOrder || 0} onChange={(e) => setEditingLegal({ ...editingLegal, displayOrder: parseInt(e.target.value) })} />
          <Button type="submit" className="w-full">Yadda Saxla</Button>
        </form>
      </Modal>

      <Modal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} title="Məxfilik Siyasəti">
        <form onSubmit={handleSavePrivacy} className="space-y-6 pt-4 max-h-[80vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Başlıq" required value={editingPrivacy?.title || ''} onChange={(e) => setEditingPrivacy({ ...editingPrivacy, title: e.target.value })} />
            <Input label="Redaksiya №" value={editingPrivacy?.version || ''} onChange={(e) => setEditingPrivacy({ ...editingPrivacy, version: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Dərc Tarixi" type="date" value={editingPrivacy?.publishedDate?.split('T')[0] || ''} onChange={(e) => setEditingPrivacy({ ...editingPrivacy, publishedDate: e.target.value })} />
            <Input label="Effektiv Tarix" type="date" value={editingPrivacy?.effectiveDate?.split('T')[0] || ''} onChange={(e) => setEditingPrivacy({ ...editingPrivacy, effectiveDate: e.target.value })} />
          </div>
          <Textarea label="Məzmun (HTML)" required rows={13} value={editingPrivacy?.content || ''} onChange={(e) => setEditingPrivacy({ ...editingPrivacy, content: e.target.value })} />
          <Button type="submit" className="w-full">Yadda Saxla</Button>
        </form>
      </Modal>
    </div>
  );
}
