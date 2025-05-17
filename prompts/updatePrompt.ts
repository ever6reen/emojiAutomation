import * as fs from 'fs';
import * as path from 'path';

// ✅ 상위 폴더의 emoji 디렉토리 경로
const emojiDir = path.resolve(__dirname, '../emoji');

// ✅ 파일 이름 정리 (확장자 제거 + - 붙이기)
const fileList = fs.readdirSync(emojiDir)
  .filter(file => file.endsWith('.png'))
  .sort();

// ✅ 프롬프트 경로 설정
const promptPath = path.resolve(__dirname, 'complimentPrompt.ts');
let promptText = fs.readFileSync(promptPath, 'utf-8');

// ✅ 마커로 기존 리스트 감지 & 교체
const startMarker = '// AUTO-GENERATED START';
const endMarker = '// AUTO-GENERATED END';

const startIdx = promptText.indexOf(startMarker);
const endIdx = promptText.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
  const before = promptText.slice(0, startIdx + startMarker.length);
  const after = promptText.slice(endIdx);
  const items = fileList.map(name => path.basename(name, '.png'));
  const newList = `(${items.join(', ')})`;

  const updated = before + newList + after;

  fs.writeFileSync(promptPath, updated, 'utf-8');
  console.log('✅ complimentPrompt.ts 업데이트 완료!');
} else {
  console.error('❌ 마커가 제대로 감지되지 않았습니다.');
}
