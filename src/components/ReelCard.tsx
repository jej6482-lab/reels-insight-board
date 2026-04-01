'use client';

import { ReelReference } from '@/types';

interface ReelCardProps {
  reel: ReelReference;
  onDelete: (id: string) => void;
  onView: (reel: ReelReference) => void;
}

export default function ReelCard({ reel, onDelete, onView }: ReelCardProps) {
  const hasScript = !!reel.script;
  const hasAnalysis = !!reel.analysis;
  const hasPlan = !!reel.generatedPlan;

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/80 transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => onView(reel)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[9/10] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {reel.thumbnailUrl ? (
          <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </div>
            <span className="text-xs text-gray-300 font-medium">릴스 분석</span>
          </div>
        )}

        {reel.category && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white">{reel.category}</span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex gap-1.5">
          {hasScript && (
            <span className="w-7 h-7 rounded-lg bg-indigo-500/80 backdrop-blur-sm flex items-center justify-center" title="스크립트">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>
            </span>
          )}
          {hasAnalysis && (
            <span className="w-7 h-7 rounded-lg bg-purple-500/80 backdrop-blur-sm flex items-center justify-center" title="분석 완료">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
            </span>
          )}
          {hasPlan && (
            <span className="w-7 h-7 rounded-lg bg-orange-500/80 backdrop-blur-sm flex items-center justify-center" title="기획 생성됨">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" /><line x1="9" y1="21" x2="15" y2="21" /></svg>
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="flex gap-2 w-full" onClick={(e) => e.stopPropagation()}>
            <a href={reel.url} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-2 rounded-xl bg-white/90 backdrop-blur text-xs font-semibold text-gray-900 text-center hover:bg-white transition-colors">
              릴스 보기
            </a>
            <button onClick={() => { if (confirm('삭제하시겠습니까?')) onDelete(reel.id); }}
              className="w-10 h-10 rounded-xl bg-red-500/80 backdrop-blur flex items-center justify-center hover:bg-red-500 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{reel.title || '릴스 분석'}</h3>
        {reel.accountName && <p className="text-xs text-gray-400 mt-0.5 truncate">{reel.accountName}</p>}
        {reel.analysis?.hookingType && (
          <p className="text-[10px] text-purple-500 mt-2 font-bold">{reel.analysis.hookingType}</p>
        )}
        {reel.analysis?.hookingScript && (
          <p className="text-xs text-purple-500 mt-1 truncate">&ldquo;{reel.analysis.hookingScript}&rdquo;</p>
        )}
        <p className="text-[10px] text-gray-300 mt-2">{new Date(reel.createdAt).toLocaleDateString('ko-KR')}</p>
      </div>
    </div>
  );
}
