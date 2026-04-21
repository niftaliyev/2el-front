import { helpService } from '@/services/help.service';
import HelpAccordion from '@/app/help/HelpAccordion';
import { notFound } from 'next/navigation';

export default async function HelpCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await helpService.getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">
        {category.name}
      </h2>
      
      <div className="flex flex-col gap-4">
        {category.helpItems.length > 0 ? (
          category.helpItems.map((item) => (
            <HelpAccordion key={item.id} item={item} />
          ))
        ) : (
          <p className="text-gray-500 italic">Bu kateqoriya üzrə hələ ki, sual yoxdur.</p>
        )}
      </div>
    </div>
  );
}
