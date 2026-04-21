export interface HelpItem {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface HelpCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  helpItems: HelpItem[];
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  displayOrder: number;
}

export interface LegalPolicy {
  id: string;
  title: string;
  slug: string;
  content: string;
  version: string;
  publishedDate: string;
  effectiveDate: string;
  displayOrder: number;
}

export interface PrivacyPolicy {
  id: string;
  title: string;
  slug: string;
  content: string;
  version: string;
  publishedDate: string;
  effectiveDate: string;
}
