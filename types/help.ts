export interface HelpItem {
  id: string;
  question: string;
  questionRu?: string;
  QuestionRu?: string;
  answer: string;
  answerRu?: string;
  AnswerRu?: string;
  displayOrder: number;
}

export interface HelpCategory {
  id: string;
  name: string;
  nameRu?: string;
  NameRu?: string;
  slug: string;
  displayOrder: number;
  helpItems: HelpItem[];
}

export interface StaticPage {
  id: string;
  title: string;
  titleRu?: string;
  TitleRu?: string;
  slug: string;
  content: string;
  contentRu?: string;
  ContentRu?: string;
  displayOrder: number;
}

export interface LegalPolicy {
  id: string;
  title: string;
  titleRu?: string;
  TitleRu?: string;
  slug: string;
  content: string;
  contentRu?: string;
  ContentRu?: string;
  version: string;
  publishedDate: string;
  effectiveDate: string;
  displayOrder: number;
}

export interface PrivacyPolicy {
  id: string;
  title: string;
  titleRu?: string;
  TitleRu?: string;
  slug: string;
  content: string;
  contentRu?: string;
  ContentRu?: string;
  version: string;
  publishedDate: string;
  effectiveDate: string;
}
