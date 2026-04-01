'use client';

import { useState } from 'react';
import { ReelFormData, ReelAnalysis, GeneratedPlan, CATEGORIES } from '@/types';

interface AnalyzerViewProps {
  onSave: (data: ReelFormData) => void;
  onCancel: () => void;
}

type Step = 'input' | 'analyzing' | 'result' | 'generating' | 'plan';

export default function AnalyzerView({ onSave, onCancel }: AnalyzerViewProps) {
  const [step, setStep] = useState<Step>('input');
  const [url, setUrl] = useState('');
  const [script, setScript] = useState('');
  const [timestampedScript, setTimestampedScript] = useState('');
  const [analysis, setAnalysis] = useState<ReelAnalysis | null>(null);
  const [error, setError] = useState('');

  // 기획 생성
  const [myTopic, setMyTopic] = useState('');
  const [myBusiness, setMyBusiness] = useState('');
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);

  // 저장용 메타
  const [title, setTitle] = useState('');
  const [accountName, setAccountName] = useState('');
  const [category, setCategory] = useState('');
  const [memo, setMemo] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setError('');
    setStep('analyzing');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setScript(data.script);
      setTimestampedScript(data.timestampedScript);
      setAnalysis(data.analysis);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석에 실패했습니다');
      setStep('input');
    }
  };

  const handleGenerate = async () => {
    if (!myTopic.trim()) return;
    setError('');
    setStep('generating');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalScript: script,
          analysis,
          myTopic,
          myBusiness,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPlan(data);
      setStep('plan');
    } catch (err) {
      setError(err instanceof Error ? err.message : '기획 생성에 실패했습니다');
      setStep('result');
    }
  };

  const handleSave = () => {
    onSave({
      url,
      title: title || plan?.title || analysis?.summary?.slice(0, 50) || '릴스 분석',
      accountName,
      category,
      thumbnailUrl: '',
      memo,
      tags: [],
      script,
      timestampedScript,
      analysis,
      myTopic,
      myBusiness,
      generatedPlan: plan,
    });
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { key: 'input', label: 'URL 입력' },
          { key: 'result', label: 'AI 분석' },
          { key: 'plan', label: '기획 생성' },
        ].map((s, i) => {
          const isActive = s.key === step || s.key === 'result' && step === 'analyzing' || s.key === 'plan' && step === 'generating';
          const isDone =
            (s.key === 'input' && step !== 'input') ||
            (s.key === 'result' && (step === 'plan' || step === 'generating'));
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <div className={`w-8 h-px ${isDone ? 'bg-purple-400' : 'bg-gray-200'}`} />}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all ${
                isActive ? 'bg-purple-100 text-purple-700' :
                isDone ? 'bg-purple-500 text-white' :
                'bg-gray-100 text-gray-400'
              }`}>
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <span className="text-[10px] font-bold">{String(i + 1).padStart(2, '0')}</span>
                )}
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* STEP 1: URL Input */}
      {step === 'input' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">릴스 URL을 붙여넣으세요</h2>
            <p className="text-sm text-gray-400 mt-1">AI가 영상을 분석하고 스크립트를 추출합니다</p>
          </div>

          <div className="space-y-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.instagram.com/reel/..."
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 text-base text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 bg-gray-50/50 text-center"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                disabled={!url.trim()}
                className="flex-1 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-200 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                분석 시작
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-4 rounded-2xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP: Analyzing */}
      {step === 'analyzing' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 p-12 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-purple-100 border-t-purple-500 animate-spin mx-auto mb-6" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">릴스를 분석하고 있습니다</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p>1. 영상 다운로드 중...</p>
            <p>2. 오디오 추출 중...</p>
            <p>3. AI 음성 인식 중...</p>
            <p>4. 후킹 방식 분석 중...</p>
          </div>
          <p className="text-xs text-gray-300 mt-4">30초~1분 정도 소요됩니다</p>
        </div>
      )}

      {/* STEP 2: Analysis Result */}
      {(step === 'result' || step === 'generating' || step === 'plan') && analysis && (
        <div className="space-y-4">
          {/* Script */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </span>
              추출된 스크립트
            </h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-mono bg-gray-50 rounded-2xl p-4 max-h-60 overflow-y-auto">
              {timestampedScript || script}
            </pre>
          </div>

          {/* Analysis */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
              </span>
              후킹 &amp; 구조 분석
            </h3>

            <div className="space-y-3">
              {/* Hooking */}
              <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-500 text-white text-[10px] font-bold">{analysis.hookingType}</span>
                </div>
                <p className="text-base font-bold text-purple-900 mb-2">&ldquo;{analysis.hookingScript}&rdquo;</p>
                <p className="text-sm text-purple-700 leading-relaxed">{analysis.hookingAnalysis}</p>
              </div>

              {/* Analysis List */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                <ListItem icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} iconBg="bg-blue-50" label="전개 구조" value={analysis.structure} />
                <ListItem icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>} iconBg="bg-pink-50" label="감정 흐름" value={analysis.emotionFlow} />
                <ListItem icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} iconBg="bg-orange-50" label="CTA 방식" value={analysis.ctaType} />
                <ListItem icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} iconBg="bg-green-50" label="타겟 시청자" value={analysis.targetAudience} />
              </div>

              {/* Techniques */}
              {analysis.keyTechniques && analysis.keyTechniques.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {analysis.keyTechniques.map((t, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">{t}</span>
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-sm text-gray-700 font-medium leading-relaxed">{analysis.summary}</p>
              </div>
            </div>
          </div>

          {/* STEP 2.5: Generate Input */}
          {(step === 'result' || step === 'generating') && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" />
                    <line x1="9" y1="21" x2="15" y2="21" />
                  </svg>
                </span>
                내 주제로 릴스 기획하기
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">내 주제/키워드 *</label>
                  <input
                    type="text"
                    value={myTopic}
                    onChange={(e) => setMyTopic(e.target.value)}
                    placeholder="예: 초보 쇼핑몰 운영자를 위한 상세페이지 작성법"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 bg-gray-50/50"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">내 업종/브랜드 (선택)</label>
                  <input
                    type="text"
                    value={myBusiness}
                    onChange={(e) => setMyBusiness(e.target.value)}
                    placeholder="예: 1인 디자인 스튜디오, 온라인 강사, 카페 운영"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 bg-gray-50/50"
                  />
                </div>

                {error && step === 'result' && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!myTopic.trim() || step === 'generating'}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg shadow-orange-200 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {step === 'generating' ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-orange-300 border-t-white animate-spin" />
                      AI가 릴스를 기획하고 있습니다...
                    </span>
                  ) : '이 후킹 방식으로 내 릴스 기획하기'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Generated Plan */}
          {step === 'plan' && plan && (
            <div className="bg-white rounded-3xl border border-orange-100 shadow-lg shadow-orange-50 p-6">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </span>
                생성된 릴스 기획
              </h3>

              <div className="space-y-4">
                {/* Title */}
                <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 p-4">
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">제목</p>
                  <p className="text-lg font-bold text-gray-900">{plan.title}</p>
                </div>

                {/* Hooking */}
                <div className="rounded-2xl bg-purple-50 border border-purple-100 p-4">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">후킹 문구 (첫 1-3초)</p>
                  <p className="text-base font-bold text-purple-900">&ldquo;{plan.hookingScript}&rdquo;</p>
                </div>

                {/* Full Script */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">전체 스크립트</p>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-mono bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    {plan.fullScript}
                  </pre>
                </div>

                {/* Visual Plan */}
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">영상 구성 계획</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-blue-50/50 rounded-2xl p-4 border border-blue-100">{plan.visualPlan}</p>
                </div>

                {/* Production Details - list */}
                <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
                  <ListItem icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>} iconBg="bg-blue-50" label="자막 스타일" value={plan.subtitleStyle} />
                  <ListItem icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>} iconBg="bg-pink-50" label="BGM 분위기" value={plan.bgmMood} />
                  <ListItem icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} iconBg="bg-orange-50" label="CTA 문구" value={plan.ctaScript} />
                  <ListItem icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>} iconBg="bg-green-50" label="촬영/편집 팁" value={plan.productionTips} />
                </div>

                {/* Hashtags */}
                {plan.hashtags && plan.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {plan.hashtags.map((h, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-xs font-medium">
                        #{h.replace(/^#/, '')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Save Section */}
          {(step === 'result' || step === 'plan') && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">레퍼런스로 저장하기</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목 (선택)"
                    className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-gray-50/50" />
                  <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="@계정명 (선택)"
                    className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-gray-50/50" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter((c) => c !== '전체').map((cat) => (
                    <button key={cat} type="button" onClick={() => setCategory(category === cat ? '' : cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        category === cat ? 'bg-purple-50 text-purple-600 ring-1 ring-purple-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}>{cat}</button>
                  ))}
                </div>
                <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="메모 (선택)" rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-gray-50/50 resize-none" />
                <div className="flex gap-3">
                  <button onClick={handleSave}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-200 transition-all active:scale-[0.98]">
                    저장하기
                  </button>
                  <button onClick={onCancel}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ListItem({ icon, iconBg, label, value }: { icon: React.ReactNode; iconBg: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-white">
      <span className={`shrink-0 mt-0.5 w-6 h-6 rounded-lg ${iconBg} flex items-center justify-center`}>{icon}</span>
      <div className="min-w-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">{value}</p>
      </div>
    </div>
  );
}
