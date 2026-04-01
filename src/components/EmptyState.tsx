'use client';

interface EmptyStateProps {
  onAddClick: () => void;
}

export default function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.2" strokeLinecap="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">릴스 URL을 분석해보세요</h3>
      <p className="text-sm text-gray-400 text-center max-w-xs mb-6 leading-relaxed">
        릴스 URL을 넣으면 AI가 스크립트를 추출하고<br />
        후킹 방식을 분석해서 내 릴스로 기획해줍니다.
      </p>
      <button
        onClick={onAddClick}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-200 transition-all active:scale-95"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        첫 번째 릴스 분석하기
      </button>
    </div>
  );
}
