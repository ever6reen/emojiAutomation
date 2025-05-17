import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { generateMessage } from './genMsg';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const message = await generateMessage();
  console.log('✨ 생성된 감성 문장:', message);

  await page.goto('https://emoji-gen.ninja/ko/');
  await page.fill('div.parameter.text textarea', message);
  await page.click('div.execution');

  const files = fs.readdirSync(__dirname);
  const safeFileName = message
  .replace(/\s+/g, '_')        // 줄바꿈, 공백 → _
  .replace(/[\\/:*?"<>|]/g, '') // 금지 문자 제거
  .trim();

  const fileName = `${safeFileName}.png`;
  const filePath = path.resolve(__dirname, 'emoji', fileName);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }

  const [ download ] = await Promise.all([
    page.waitForEvent('download'),
    page.click('div.download'),
  ]);

  await download.saveAs(filePath);
  console.log('✅ 이모지가 저장된 경로:', filePath);

  await browser.close();
})();
