export interface ReelAnalysis {
  hookingType: string;
  hookingScript: string;
  hookingAnalysis: string;
  structure: string;
  ctaType: string;
  emotionFlow: string;
  targetAudience: string;
  keyTechniques: string[];
  summary: string;
}

export interface GeneratedPlan {
  title: string;
  hookingScript: string;
  fullScript: string;
  visualPlan: string;
  subtitleStyle: string;
  bgmMood: string;
  ctaScript: string;
  hashtags: string[];
  productionTips: string;
}

export interface ReelReference {
  id: string;
  url: string;
  title: string;
  accountName: string;
  category: string;
  thumbnailUrl: string;
  memo: string;
  tags: string[];
  // AI 분석 결과
  script: string;
  timestampedScript: string;
  analysis: ReelAnalysis | null;
  // 내 콘텐츠 기획
  myTopic: string;
  myBusiness: string;
  generatedPlan: GeneratedPlan | null;
  createdAt: string;
  updatedAt: string;
}

export type ReelFormData = Omit<ReelReference, 'id' | 'createdAt' | 'updatedAt'>;

export const CATEGORIES = [
  '전체',
  '상세페이지형',
  '브랜딩형',
  '판매형',
  '후기형',
  '정보형',
  '트렌드형',
  '교육형',
  '일상형',
] as const;
