import { helpService } from '@/services/help.service';
import Container from '@/components/layout/Container';
import PagesSidebar from './PagesSidebar';

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const legalPolicies = await helpService.getLegalPolicies();
  const staticPages = await helpService.getStaticPages();
  const helpCategories = await helpService.getContent();
  let privacyPolicy = null;
  try {
    privacyPolicy = await helpService.getPrivacyPolicy('privacy');
  } catch {}

  return (
    <div className="bg-white min-h-screen py-10">
      <Container>
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full md:w-[260px] flex-shrink-0">
            <PagesSidebar 
              helpCategories={helpCategories}
              legalPolicies={legalPolicies} 
              staticPages={staticPages} 
              privacyPolicy={privacyPolicy}
            />
          </div>

          {/* Content */}
          <div className="w-full flex-grow max-w-4xl">
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
