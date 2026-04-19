'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { accountService, Invoice } from '@/services/account.service';

export default function InvoicePrintPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoiceData, profileData, companyData] = await Promise.all([
          accountService.getInvoice(id as string),
          accountService.getProfile(),
          accountService.getCompanySettings()
        ]);
        setInvoice(invoiceData);
        setUser(profileData);
        setCompany(companyData);
        
        if (invoiceData) {
          document.title = `Invoice_${invoiceData.invoiceNumber}`;
        }
        
        // Auto-print after a short delay to ensure rendering
        setTimeout(() => {
          // window.print();
        }, 1000);
      } catch (err) {
        console.error('Error fetching invoice for print:', err);
        setError('İnvoys məlumatlarını yükləmək mümkün olmadı');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (isLoading) return <div className="p-20 text-center font-bold text-gray-400">Yüklənir...</div>;
  if (error || !invoice) return <div className="p-20 text-center text-red-500 font-bold">{error || 'İnvoys tapılmadı'}</div>;

  return (
    <div className="min-h-screen bg-transparent sm:bg-gray-50 flex items-center justify-center p-0 sm:p-8 print:p-0 print:bg-white invoice-print-container relative">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide everything in the body */
          body * {
            visibility: hidden !important;
          }
          /* Show only the invoice container and its descendants */
          .invoice-print-container, 
          .invoice-print-container * {
            visibility: visible !important;
          }
          /* Absolutely position the invoice container at the top */
          .invoice-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            min-height: auto !important;
          }
          /* Force color rendering */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide interactive elements explicitly */
          .print-hidden, .print\\:hidden, header, nav, footer, aside, button {
            display: none !important;
          }
          /* Prevent awkward page breaks */
          .bg-white {
            break-inside: avoid !important;
          }
        }
      `}} />
      <div className="w-full max-w-4xl bg-white shadow-none sm:shadow-2xl rounded-none sm:rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Header Section */}
        <div className="p-8 sm:p-12 border-b-8 border-[#607afb]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-[#607afb] tracking-tighter uppercase italic">{company?.companyName || 'ELAN.AZ'}</h1>
              <p className="text-gray-500 font-medium text-sm mt-1">Rəsmi Ödəniş Sənədi</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 leading-none">FACTURA / INVOICE</h2>
              <p className="text-[#607afb] font-bold mt-1 tracking-wider uppercase">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          {/* Billing Info Grid */}
          <div className="grid grid-cols-2 gap-12 mb-12 print:grid-cols-2">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">KİMDƏN / FROM</h3>
              <div className="space-y-1">
                <p className="text-xl font-bold text-gray-900">{company?.companyName || 'ElanAz MMC'}</p>
                <p className="text-gray-600 text-sm">{company?.address || 'Bakı şəhəri, Azərbaycan'}</p>
                <p className="text-gray-600 text-sm font-medium">VÖEN: <span className="text-gray-900">{company?.voen || '1234567890'}</span></p>
                <p className="text-gray-600 text-sm font-medium">Email: <span className="text-gray-900">{company?.email || 'support@elan.az'}</span></p>
              </div>
            </div>
            <div className="text-left">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">KİMƏ / BILL TO</h3>
              <div className="space-y-1">
                <p className="text-xl font-bold text-gray-900">{user?.fullName || user?.userName || 'Müştəri'}</p>
                <p className="text-gray-600 text-sm">{user?.phoneNumber || '-'}</p>
                <p className="text-gray-600 text-sm">{user?.email || '-'}</p>
                <p className="text-gray-600 text-sm font-medium">Müştəri ID: <span className="text-gray-900">{user?.id?.substring(0, 8) || '-'}</span></p>
              </div>
            </div>
          </div>

          {/* Status and Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 p-1 bg-gray-100 rounded-xl mb-12 overflow-hidden border border-gray-100">
             <div className="bg-white p-6 sm:p-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">TARİX / DATE</p>
                <p className="text-lg font-bold text-gray-900">{new Date(invoice.createdDate).toISOString().split('T')[0]}</p>
             </div>
             <div className="bg-white p-6 sm:p-8 flex flex-col justify-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">STATUS</p>
                <span className="inline-flex items-center text-xs font-black tracking-widest text-emerald-600 uppercase">
                  ÖDƏNİLİB / PAID
                </span>
             </div>
             <div className="bg-white p-6 sm:p-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ÖDƏMƏ TARİXİ</p>
                <p className="text-lg font-bold text-gray-900">{invoice.paidDate ? new Date(invoice.paidDate).toISOString().split('T')[0] : '-'}</p>
             </div>
          </div>

          {/* Items Table */}
          <div className="mb-12">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">TƏSVİR / DESCRIPTION</th>
                  <th className="py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">MƏBLƏĞ / AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 group">
                  <td className="py-8 align-top">
                    <p className="font-bold text-xl text-gray-900 mb-2 leading-tight">{invoice.serviceType}</p>
                    <p className="text-gray-400 text-sm font-medium">ElanAz platformasında göstərilən elektron xidmət haqqı</p>
                  </td>
                  <td className="py-8 text-right align-top">
                    <p className="text-2xl font-black text-gray-900">{invoice.amount.toFixed(2)} ₼</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end pt-8">
            <div className="w-full max-w-xs space-y-4">
              <div className="flex justify-between items-center text-gray-500 font-medium">
                <span>Subtotal</span>
                <span>{invoice.amount.toFixed(2)} ₼</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 font-medium">
                <span>ƏDV / VAT (0%)</span>
                <span>0.00 ₼</span>
              </div>
              <div className="pt-4 border-t-2 border-gray-100 flex justify-between items-end">
                <span className="text-2xl font-bold text-gray-900 leading-none">TOTAL</span>
                <span className="text-4xl font-black text-[#607afb] tracking-tighter leading-none">{invoice.amount.toFixed(2)} ₼</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-20 pt-8 border-t border-gray-100">
            <p className="text-gray-400 text-xs italic leading-relaxed max-w-sm">
              Bu sənəd elektron qaydada tərtib edilmişdir və ElanAz platformasında aparılmış ödənişi təsdiq edir. Sənəd rəsmi hüquqi qüvvəyə malikdir.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 p-8 sm:p-12 border-t border-gray-100 flex flex-col sm:flex-row justify-center gap-4 print:hidden">
          <button 
            onClick={() => window.print()} 
            className="px-10 py-5 bg-[#607afb] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#4d62c9] transition-all transform hover:-translate-y-1 shadow-lg shadow-[#607afb22] flex items-center justify-center gap-3"
          >
            Çap et / Print
          </button>
          <button 
            onClick={() => window.close()} 
            className="px-10 py-5 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-50 transition-all hover:border-gray-200"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
}
