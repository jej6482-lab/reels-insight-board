'use client';

import { useState, useEffect } from 'react';
import { ReelReference, ReelFormData } from '@/types';
import { getReels, addReel, deleteReel } from '@/store/useReelStore';
import Header from '@/components/Header';
import AnalyzerView from '@/components/AnalyzerView';
import ReelCard from '@/components/ReelCard';
import ReelDetail from '@/components/ReelDetail';
import EmptyState from '@/components/EmptyState';
import SearchBar from '@/components/SearchBar';

export default function Home() {
  const [reels, setReels] = useState<ReelReference[]>([]);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [viewingReel, setViewingReel] = useState<ReelReference | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReels(getReels());
  }, []);

  const filteredReels = reels.filter((r) => {
    if (selectedCategory !== '전체' && r.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.accountName.toLowerCase().includes(q) ||
        r.memo.toLowerCase().includes(q) ||
        r.script.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSave = (data: ReelFormData) => {
    addReel(data);
    setReels(getReels());
    setShowAnalyzer(false);
  };

  const handleDelete = (id: string) => {
    deleteReel(id);
    setReels(getReels());
    setViewingReel(null);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header
        onAddClick={() => setShowAnalyzer(!showAnalyzer)}
        showForm={showAnalyzer}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {showAnalyzer && (
          <div className="mb-8">
            <AnalyzerView onSave={handleSave} onCancel={() => setShowAnalyzer(false)} />
          </div>
        )}

        {!showAnalyzer && reels.length > 0 && (
          <div className="mb-8">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              totalCount={reels.length}
              filteredCount={filteredReels.length}
            />
          </div>
        )}

        {!showAnalyzer && (
          reels.length === 0 ? (
            <EmptyState onAddClick={() => setShowAnalyzer(true)} />
          ) : filteredReels.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-gray-400">검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredReels.map((reel) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  onDelete={handleDelete}
                  onView={setViewingReel}
                />
              ))}
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-center gap-2">
          <span className="text-xs text-gray-400">Made by</span>
          <a
            href="https://www.instagram.com/eroon_design/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FD5" />
                  <stop offset="25%" stopColor="#FF543E" />
                  <stop offset="50%" stopColor="#C837AB" />
                  <stop offset="100%" stopColor="#5B51D8" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad)" strokeWidth="2" />
              <circle cx="12" cy="12" r="5" stroke="url(#ig-grad)" strokeWidth="2" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig-grad)" />
            </svg>
            <span className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              @eroon_design
            </span>
          </a>
        </div>
      </footer>

      {viewingReel && (
        <ReelDetail
          reel={viewingReel}
          onClose={() => setViewingReel(null)}
        />
      )}
    </div>
  );
}
