'use client';

import { ReelReference, ReelFormData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'reels-insight-board';

export function getReels(): ReelReference[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveReels(reels: ReelReference[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reels));
}

export function addReel(data: ReelFormData): ReelReference {
  const reels = getReels();
  const now = new Date().toISOString();
  const newReel: ReelReference = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  reels.unshift(newReel);
  saveReels(reels);
  return newReel;
}

export function updateReel(id: string, data: Partial<ReelFormData>): ReelReference | null {
  const reels = getReels();
  const index = reels.findIndex((r) => r.id === id);
  if (index === -1) return null;
  reels[index] = {
    ...reels[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  saveReels(reels);
  return reels[index];
}

export function deleteReel(id: string): boolean {
  const reels = getReels();
  const filtered = reels.filter((r) => r.id !== id);
  if (filtered.length === reels.length) return false;
  saveReels(filtered);
  return true;
}

export function getReelById(id: string): ReelReference | undefined {
  return getReels().find((r) => r.id === id);
}
