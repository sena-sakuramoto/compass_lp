import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1440, height: 1000 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`AI consultation at ${viewport.width}px`, () => {
    test(`keeps the inline consultation layout at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');

      const consult = page.locator('[data-ai-consult-section]');
      await expect(consult).toHaveCount(1);
      await expect(consult.getByRole('heading', { name: 'COMPASSについてAIに聞く' })).toBeVisible();
      await expect(page.locator('[data-ai-consult-topic]')).toHaveCount(5);
      await expect(page.locator('[data-ai-consult-selected-indicator]')).toHaveCount(1);
      await expect(page.locator('[data-ai-consult-selected-indicator]')).toBeVisible();
      await expect(page.locator('[data-ai-provider]')).toHaveCount(4);
      await expect(page.locator('[data-ai-provider-icon]')).toHaveCount(4);
      await expect(page.locator('[data-ai-provider-external-icon]')).toHaveCount(4);
      await expect(page.locator('[data-ai-provider-external-icon]').first()).toBeVisible();
      await expect(page.getByRole('button', { name: '14日間無料で試す' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'デモを試す' }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: /すべての現場に、\s*Compassを。/ })).toBeVisible();
      await expect(page.getByRole('heading', { name: /シンプルな\s*料金体系/ })).toBeVisible();
      await expect(page.getByRole('heading', { name: /迷わない現場へ。\s*Compassを始めよう/ })).toBeVisible();
      await expect(consult.getByText('14日間無料で試す')).toHaveCount(0);
      await expect(consult.getByText('デモを試す', { exact: true })).toHaveCount(0);
      expect(await page.evaluate(() => (
        document.documentElement.scrollWidth <= window.innerWidth
      ))).toBe(true);

      const order = await page.evaluate(() => {
        const screenHeading = Array.from(document.querySelectorAll('h2')).find(
          (heading) => heading.textContent?.includes('実際の画面'),
        );
        const screenSection = screenHeading?.closest('section');
        const consult = document.querySelector('[data-ai-consult-section]');
        const pricing = document.querySelector('#pricing');
        return Boolean(
          screenSection
          && consult
          && pricing
          && (screenSection.compareDocumentPosition(consult) & Node.DOCUMENT_POSITION_FOLLOWING)
          && (consult.compareDocumentPosition(pricing) & Node.DOCUMENT_POSITION_FOLLOWING),
        );
      });

      expect(order).toBe(true);
    });
  });
}

test('opens ChatGPT in a new tab, copies only the approved prompt, and records categorical analytics', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await context.route('https://www.googletagmanager.com/**', (route) => route.abort());
  let chatGptTargetUrl = '';
  await context.route('https://chatgpt.com/**', (route) => {
    chatGptTargetUrl = route.request().url();
    return route.abort();
  });
  await page.goto('/');

  await page.locator('[data-ai-consult-topic="excel"]').click();
  const popupPromise = page.waitForEvent('popup');
  await page.locator('[data-ai-provider="chatgpt"]').click();
  const popup = await popupPromise;

  await expect.poll(() => chatGptTargetUrl).not.toBe('');
  expect(new URL(chatGptTargetUrl).hostname).toBe('chatgpt.com');
  await expect(page.locator('[data-ai-consult-section]')).toBeVisible();
  await expect(page).toHaveURL(/127\.0\.0\.1:4174/);

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain('Excel工程表からの移行');
  expect(clipboard).toContain('https://compass.archi-prisma.co.jp/');

  const analyticsEvents = await page.evaluate(() => window.dataLayer
    .map((entry: unknown) => Array.from(entry as ArrayLike<unknown>))
    .filter((entry) => entry[0] === 'event')
    .map((entry) => ({ name: entry[1], params: entry[2] })));
  expect(analyticsEvents).toEqual([
    { name: 'ai_consult_open', params: { context: 'compass_lp' } },
    { name: 'ai_consult_provider_click', params: { context: 'compass_lp', provider: 'chatgpt' } },
  ]);
  expect(JSON.stringify(analyticsEvents)).not.toMatch(/@|相談文|https:\/\/compass\.archi-prisma\.co\.jp/);
  await popup.close();
});

test('opens Perplexity after clipboard and legacy-copy failures', async ({ browser }) => {
  const clipboardDeniedContext = await browser.newContext();
  await clipboardDeniedContext.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('clipboard denied')) },
    });
    document.execCommand = () => false;
  });
  let perplexityTargetUrl = '';
  await clipboardDeniedContext.route('https://www.perplexity.ai/**', (route) => {
    perplexityTargetUrl = route.request().url();
    return route.abort();
  });
  const clipboardDeniedPage = await clipboardDeniedContext.newPage();
  await clipboardDeniedPage.route('https://www.googletagmanager.com/**', (route) => route.abort());
  await clipboardDeniedPage.goto('/');

  const popupPromise = clipboardDeniedPage.waitForEvent('popup');
  await clipboardDeniedPage.locator('[data-ai-provider="perplexity"]').click();
  const popup = await popupPromise;
  await expect.poll(() => perplexityTargetUrl).not.toBe('');
  await expect(clipboardDeniedPage.locator('[data-ai-consult-status]')).toHaveText(
    '相談文をコピーできませんでした。開いたAIで質問を入力してください。',
  );
  expect(new URL(perplexityTargetUrl).hostname).toBe('www.perplexity.ai');
  await popup.close();
  await clipboardDeniedContext.close();
});

test('keeps signup and Enterprise modals above the static AI consultation section', async ({ page }) => {
  await page.goto('/');
  const consult = page.locator('[data-ai-consult-section]');
  await page.locator('#pricing').getByRole('button', { name: '14日間無料で始める' }).first().click();
  const signupModal = page.locator('div.fixed').filter({ has: page.locator('#signup-email') });
  await expect(signupModal).toBeVisible();
  await expect(signupModal).toHaveCSS('position', 'fixed');
  await expect(consult).not.toHaveCSS('position', 'fixed');
  const signupStacking = await signupModal.evaluate((modal) => {
    const consult = document.querySelector('[data-ai-consult-section]');
    const topElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    return {
      modalZIndex: Number.parseInt(getComputedStyle(modal).zIndex, 10) || 0,
      consultZIndex: consult ? Number.parseInt(getComputedStyle(consult).zIndex, 10) || 0 : 0,
      interceptsPointer: modal.contains(topElement),
    };
  });
  expect(signupStacking.modalZIndex).toBeGreaterThan(signupStacking.consultZIndex);
  expect(signupStacking.interceptsPointer).toBe(true);
  await signupModal.getByRole('button').first().click();

  await page.getByRole('button', { name: 'Enterpriseの詳細・相談フォームへ' }).click();
  const enterpriseModal = page.locator('div.fixed').filter({
    has: page.getByRole('heading', { name: '41名以上のチーム向け' }),
  });
  await expect(enterpriseModal).toBeVisible();
  await expect(enterpriseModal).toHaveCSS('position', 'fixed');
  await expect(consult).not.toHaveCSS('position', 'fixed');
  const enterpriseStacking = await enterpriseModal.evaluate((modal) => {
    const consult = document.querySelector('[data-ai-consult-section]');
    const topElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    return {
      modalZIndex: Number.parseInt(getComputedStyle(modal).zIndex, 10) || 0,
      consultZIndex: consult ? Number.parseInt(getComputedStyle(consult).zIndex, 10) || 0 : 0,
      interceptsPointer: modal.contains(topElement),
    };
  });
  expect(enterpriseStacking.modalZIndex).toBeGreaterThan(enterpriseStacking.consultZIndex);
  expect(enterpriseStacking.interceptsPointer).toBe(true);
  await enterpriseModal.getByRole('button').first().click();
});

test('supports keyboard topic selection and provider tab traversal with one FAQPage payload', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-ai-consult-topic="fit"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-ai-consult-topic="fit"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-ai-consult-topic="fit"] [data-ai-consult-selected-indicator]')).toBeVisible();

  await page.locator('[data-ai-consult-topic="onboarding"]').focus();
  for (const providerId of ['chatgpt', 'gemini', 'claude', 'perplexity']) {
    await page.keyboard.press('Tab');
    await expect(page.locator(`[data-ai-provider="${providerId}"]`)).toBeFocused();
  }

  expect(await page.evaluate(() => Array.from(
    document.querySelectorAll('script[type="application/ld+json"]'),
  ).filter((script) => script.textContent?.includes('FAQPage')).length)).toBe(1);
});

test('removes topic transitions when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const duration = await page.locator('[data-ai-consult-topic]').first().evaluate(
    (element) => getComputedStyle(element).transitionDuration,
  );
  expect(duration).toBe('0s');
});

test('keeps four static conversion links available without JavaScript', async ({ browser }) => {
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto('/');
  await expect(noJsPage.getByRole('link', { name: 'デモを試す' })).toBeVisible();
  await expect(noJsPage.getByRole('link', { name: '14日間無料トライアルについて問い合わせる' })).toBeVisible();
  await expect(noJsPage.getByRole('link', { name: '最新料金を確認する' })).toBeVisible();
  await expect(noJsPage.getByRole('link', { name: 'その他の問い合わせ' })).toBeVisible();
  await noJsContext.close();
});
