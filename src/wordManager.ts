// src/wordManager.ts

import fs from 'fs';
import { PendingData, SentData } from './core/types';
import { pendingPath, sentPath } from './core/paths';
import { generateMessage } from './aiGenerator';

function readJsonFile<T>(filePath: string, defaultValue: T): T {
  if (!fs.existsSync(filePath)) return defaultValue;
  const raw = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function writeJsonFile(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// 1. 전송된 단어 불러오기
export function getSentWords(): SentData {
  return readJsonFile<SentData>(sentPath, {
    generatedAt: '',
    source: '',
    words: [],
  });
}

// 2. 전송 전 단어 불러오기
export function getPendingWords(): PendingData {
  return readJsonFile<PendingData>(pendingPath, {
    generatedAt: '',
    source: '',
    words: [],
  });
}

// 3. 전체 단어 리스트
export function getAllWords(): Set<string> {
  const sent = getSentWords();
  const pending = getPendingWords();
  return new Set([...sent.words, ...pending.words]);
}

// 4. 새 단어 추가하기
export function addWords(newWords: string[], source = 'AI') {
  const pending = getPendingWords();
  const combined = new Set([...pending.words, ...newWords]);
  const updated: PendingData = {
    generatedAt: new Date().toISOString(),
    source,
    words: [...combined],
  };

  writeJsonFile(pendingPath, updated);
  console.log('✅ 새 단어가 pending.json에 추가되었습니다!');
}

// 5. 단어 선택하기
export async function selectWord(): Promise<string | null> {
  const pending = getPendingWords();
  let pendingWordsList = pending.words;

  // ✅ 1. 비어 있다면 AI 단어 생성
  if (pendingWordsList.length === 0) {
    console.log('📭 pending.json이 비어 있어요. 새로운 단어를 생성합니다...');
    const newWords = await generateMessage(); // AI로 단어 생성
    console.log(`✅ ${newWords.length}개의 단어가 생성되었습니다.`);

    // ⏳ 새로 채운 단어를 다시 불러오기
    const pending = getPendingWords();
    pendingWordsList = pending.words;
  }

  // ✅ 2. 여전히 비어있다면 종료
  if (pendingWordsList.length === 0) {
    console.warn('❌ 단어 생성 후에도 비어 있습니다.');
    return null;
  }

  // ✅ 3. 첫 단어 선택
  const chosenWord = pendingWordsList[0];
  const remaining = pendingWordsList.slice(1);

 // ✅ 4. sent.json에 추가 (SentData 형식 유지)
  const sent = getSentWords();
  const sentWords = new Set(sent.words);
  sentWords.add(chosenWord);

  const updatedSent: SentData = {
    generatedAt: new Date().toISOString(),
    source: 'AI',
    words: [...sentWords],
  };
  writeJsonFile(sentPath, updatedSent);

  // ✅ 5. pending.json에서 제거 (PendingData 형식 유지)
  const refreshedPending = getPendingWords();
  const updatedPending: PendingData = {
    generatedAt: refreshedPending.generatedAt || new Date().toISOString(),
    source: refreshedPending.source || 'AI',
    words: remaining,
  };
  writeJsonFile(pendingPath, updatedPending);

  console.log(`📤 선택된 단어: ${chosenWord}`);
  return chosenWord;
}