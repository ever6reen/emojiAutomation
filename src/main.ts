import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { selectWord } from './wordManager';

export async function run() {
  const text = await selectWord();
  if (!text) {
    console.warn('❌ 선택된 단어가 없습니다.');
    return;
  }

  console.log('✨ 선택된 단어:', text);

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://emoji-gen.ninja/ko/');
  await page.fill('div.parameter.text textarea', text);
  await page.click('div.execution');

  const safeFileName = text
    .replace(/\s+/g, '_')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim();

  const emojiDir = path.resolve(__dirname, '../data/emoji');
  if (!fs.existsSync(emojiDir)) {
    fs.mkdirSync(emojiDir);
  }

  const filePath = path.resolve(emojiDir, `${safeFileName}.png`);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('div.download'),
  ]);

  await download.saveAs(filePath);
  console.log('✅ 이모지가 저장된 경로:', filePath);

  await browser.close();
}

// 실행
run();