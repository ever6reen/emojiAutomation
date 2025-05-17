import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

import { getSentWords, writeJsonFile } from './wordManager';
import { parseWordList } from './utils';
import { pendingPath } from './core/paths';

export async function generateMessage(): Promise<string[]> {
  try {
    console.log('🔐 API 키 앞 10자:', process.env.OPENROUTER_API_KEY?.slice(0, 10) || '없음');
    console.log('🔍 generateMessage 시작');

    // 1. 이모지 생성된 단어 목록 가져오기
    const sentData = getSentWords();
    const usedWords = new Set(sentData.words);
    console.log('📦 사용된 단어 수:', usedWords.size);

    // 2. 프롬프트 생성 및 요청 준비
    const prompt = `건우 칭찬 6글자 "OO건우" 형식 20개 결과만 출력, 다음과 중복없게: ${[...usedWords].join(', ')}`;
    console.log('📝 프롬프트 준비 완료:', prompt);

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 200
      })
    });

    console.log('📡 API 요청 보냄');

    if (!aiResponse.ok) {
      console.error(`❌ API 응답 실패: ${aiResponse.status} ${aiResponse.statusText}`);
      throw new Error(`❌ API 오류: ${aiResponse.status} ${aiResponse.statusText}`);
    }

    const data = await aiResponse.json();
    console.log('📬 API 응답 수신 완료');

    const aiMessage = data?.choices?.[0]?.message?.content?.trim() || '';
    console.log('💬 AI 응답 메시지:', aiMessage);

    // 3. 응답 파싱
    const newWords = parseWordList(aiMessage);
    console.log('🆕 파싱된 단어 목록:', newWords);

    // 4. 새로운 단어 저장
    const updatePending = {
      generatedAt: new Date().toISOString(),
      source: 'AI',
      words: newWords,
    };

    writeJsonFile(pendingPath, updatePending);
    console.log('💾 pending.json에 단어 저장 완료');

    return newWords;

  } catch (error) {
    console.error('🚨 generateMessage 중 오류 발생:', error);
    return [];
  }
}