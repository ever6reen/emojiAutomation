export function parseWordList(text: string): string[] {
  return text
    .split('\n')                                // 줄 단위로 나누고
    .map(line => line.replace(/^\d+\.\s*/, '')) // "숫자. " 제거 (예: "1. ")
    .map(line => line.trim())                  // 앞뒤 공백 제거
    .filter(word => word.length > 0);          // 빈 줄 제거
}