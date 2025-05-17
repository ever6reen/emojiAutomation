import * as dotenv from 'dotenv';
dotenv.config();

import './prompts/updatePrompt';
import { complimentPrompt } from './prompts/complimentPrompt';

console.log('📝 최신 complimentPrompt 내용:\n');
console.log(complimentPrompt); // ✅ 여기서 터미널로 확인 가능
console.log('🧾 최종 content 확인');
console.log('--------------------');
console.log(JSON.stringify(complimentPrompt, null, 2));
console.log('--------------------');
console.log(`문자 수: ${complimentPrompt.length}`);

export async function generateMessage(): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://twosolsemojigen.com",
      "X-Title": "twosolEmojiBot",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        {
          role: "user",
          content: complimentPrompt
        }
      ],
      temperature: 0.9,
      max_tokens: 50
    })
  });

    if (!response.ok) {
    throw new Error(`❌ API 오류: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

generateMessage()
  .then((message) => {
    console.log('출력 단어:', message);
  })
  .catch(console.error);