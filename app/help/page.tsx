import { helpService } from '@/services/help.service';
import { redirect } from 'next/navigation';

export default async function HelpPage() {
  const categories = await helpService.getContent();
  
  if (categories.length > 0) {
    redirect(`/help/${categories[0].slug}`);
  }

  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      Yardım məzmunu tapılmadı.
    </div>
  );
}
