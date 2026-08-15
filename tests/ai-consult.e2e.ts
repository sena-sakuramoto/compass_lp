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
      await expect(page.locator('[data-ai-consult-topic]')).toHaveCount(5);
      await expect(page.locator('[data-ai-provider]')).toHaveCount(4);
      await expect(page.locator('[data-ai-provider-icon]')).toHaveCount(4);
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
