'use client';

import { ReelReference } from '@/types';

interface ReelDetailProps {
  reel: ReelReference;
  onClose: () => void;
}

function Section({ title, children, color = 'gray' }: { title: string; children: React.ReactNode; color?: string }) {
  const c: Record<string, string> = {
    gray: 'border-gray-100 bg-gray-50',
    purple: 'border-purple-100 bg-purple-50/50',
    blue: 'border-blue-100 bg-blue-50/50',
    orange: 'border-orange-100 bg-orange-50/50',
    green: 'border-green-100 bg-green-50/50',
    indigo: 'border-indigo-100 bg-indigo-50/50',
    pink: 'border-pink-100 bg-pink-50/50',
  };
  return (
    <div className={`rounded-2xl border p-4 ${c[color] || c.gray}`}>
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{title}</h4>
      {children}
    </div>
  );
}

export default function ReelDetail({ reel, onClose }: ReelDetailProps) {
  const { analysis, generatedPlan: plan } = reel;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{reel.title || '릴스 분석'}</h2>
            <div className="flex items-center gap-3 mt-1.5">
              {reel.accountName && <span className="text-sm text-gray-400">{reel.accountName}</span>}
              {reel.category && <span className="px-2.5 py-0.5 rounded-lg bg-white/80 text-[10px] font-semibold text-gray-500">{reel.category}</span>}
            </div>
            <div className="flex gap-2 mt-3">
              <a href={reel.url} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold hover:from-purple-600 hover:to-pink-600">릴스 보기</a>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-gray-600 hover:bg-black/20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Memo */}
          {reel.memo && (
            <Section title="메모"><p className="text-sm text-gray-700 whitespace-pre-wrap">{reel.memo}</p></Section>
          )}

          {/* Script */}
          {reel.script && (
            <Section title="추출된 스크립트" color="indigo">
              <pre className="text-[13px] text-indigo-800 whitespace-pre-wrap leading-relaxed font-mono max-h-48 overflow-y-auto">{reel.timestampedScript || reel.script}</pre>
            </Section>
          )}

          {/* Analysis */}
          {analysis && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="3"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                </span>
                후킹 &amp; 구조 분석
              </h3>

              <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 p-4">
                <span className="px-2 py-0.5 rounded-md bg-purple-500 text-white text-[10px] font-bold">{analysis.hookingType}</span>
                <p className="text-base font-bold text-purple-900 mt-2">&ldquo;{analysis.hookingScript}&rdquo;</p>
                <p className="text-sm text-purple-700 mt-1">{analysis.hookingAnalysis}</p>
              </div>

              <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                <div className="flex items-start gap-3 px-4 py-3 bg-white">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">전개 구조</span>
                    <p className="text-sm text-gray-800 mt-0.5">{analysis.structure}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3 bg-white">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-pink-50 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">감정 흐름</span>
                    <p className="text-sm text-gray-800 mt-0.5">{analysis.emotionFlow}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3 bg-white">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CTA 방식</span>
                    <p className="text-sm text-gray-800 mt-0.5">{analysis.ctaType}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3 bg-white">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">타겟 시청자</span>
                    <p className="text-sm text-gray-800 mt-0.5">{analysis.targetAudience}</p>
                  </div>
                </div>
              </div>

              {analysis.keyTechniques?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {analysis.keyTechniques.map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">{t}</span>
                  ))}
                </div>
              )}

              <Section title="핵심 요약" color="gray"><p className="text-sm text-gray-700 font-medium">{analysis.summary}</p></Section>
            </div>
          )}

          {/* Generated Plan */}
          {plan && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-orange-100 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="3"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" /></svg>
                </span>
                내 릴스 기획 — {reel.myTopic}
              </h3>

              {/* Title + Hooking */}
              <div className="rounded-2xl bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 border border-orange-100/60 p-5">
                <p className="text-lg font-bold text-gray-900 leading-snug">{plan.title}</p>
                <div className="mt-3 pt-3 border-t border-orange-200/40">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">후킹 문구</span>
                  <p className="text-base font-bold text-purple-800 mt-1">&ldquo;{plan.hookingScript}&rdquo;</p>
                </div>
              </div>

              {/* Full Script */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-500 mb-2 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  전체 스크립트
                </h4>
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                  <pre className="text-[13px] text-gray-800 whitespace-pre-wrap leading-[1.8] font-mono">{plan.fullScript}</pre>
                </div>
              </div>

              {/* Visual Plan */}
              <div>
                <h4 className="text-[11px] font-bold text-gray-500 mb-2 flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
                  영상 구성 계획
                </h4>
                <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-4">
                  <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">{plan.visualPlan}</p>
                </div>
              </div>

              {/* Production Details - clean list */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                <div className="flex items-start gap-3 px-4 py-3 bg-white">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">자막 스타일</span>
                    <p className="text-sm text-gray-800 mt-0.5">{plan.subtitleStyle}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3 bg-white">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-pink-50 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BGM 분위기</span>
                    <p className="text-sm text-gray-800 mt-0.5">{plan.bgmMood}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3 bg-white">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CTA 문구</span>
                    <p className="text-sm text-gray-800 font-medium mt-0.5">{plan.ctaScript}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3 bg-white">
                  <span className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">촬영/편집 팁</span>
                    <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">{plan.productionTips}</p>
                  </div>
                </div>
              </div>

              {/* Hashtags */}
              {plan.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {plan.hashtags.map((h, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-medium">#{h.replace(/^#/, '')}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="text-[10px] text-gray-300 text-right">{new Date(reel.createdAt).toLocaleDateString('ko-KR')}</p>
        </div>
      </div>
    </div>
  );
}
