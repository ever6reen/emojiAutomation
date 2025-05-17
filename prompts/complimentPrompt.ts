export const originalPrompt = `건우를 칭찬하는 6자 내의 단어 1개 만들어
괄호 안 목록과 중복값은 제외
// AUTO-GENERATED START(갓건우, 건우짱짱, 짱건우)// AUTO-GENERATED END`;

// ✅ 마커 제거 함수
function cleanPrompt(raw: string): string {
  const lines = raw.split('\n');
  const cleanedLines: string[] = [];

  let skipping = false;

  for (const line of lines) {
    if (line.includes('AUTO-GENERATED START')) {
      skipping = true;
      continue; // 이 줄은 건너뜀
    }
    if (line.includes('AUTO-GENERATED END')) {
      skipping = false;
      continue; // 이 줄도 건너뜀
    }

    if (skipping) {
      cleanedLines.push(line); // 제외 목록은 유지
    } else {
      cleanedLines.push(line);
    }
  }

  return cleanedLines.join('\n').trim();
}

// ✅ 실제 프롬프트로 사용할 버전
export const complimentPrompt = cleanPrompt(originalPrompt);

if (require.main === module) {
  console.log(complimentPrompt); // ✅ 이 줄로 실행 확인 가능
}