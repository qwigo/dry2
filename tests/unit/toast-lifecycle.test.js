import './setup.js';

/**
 * dry-toast show/hide lifecycle.
 *
 * hide() only clears _isVisible inside its 300ms animation timeout, but
 * _handleAttributeChange re-shows after 100ms - so the show() call
 * early-returns on the still-true _isVisible flag, and the pending hide
 * then tears the toast down. A visible toast whose message changes
 * disappears permanently.
 *
 * Separately, Toast.success()/info()/... append a <dry-toast> host
 * element to document.body for every call and never remove it, so the
 * body accumulates dead elements for the lifetime of the page.
 */
describe('dry-toast lifecycle', () => {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  before(async () => {
    await import('../../src/dry2/toast.js');
  });

  beforeEach(() => {
    cleanupDOM();
    document.querySelectorAll('dry-toast, .toast-container').forEach((n) => n.remove());
  });

  afterEach(() => {
    document.querySelectorAll('dry-toast, .toast-container').forEach((n) => n.remove());
    cleanupDOM();
  });

  const containers = () => document.querySelectorAll('.toast-container');
  const hosts = () => document.querySelectorAll('dry-toast');

  describe('hide()', () => {
    it('resolves only after the toast is actually removed', async () => {
      const toast = document.createElement('dry-toast');
      toast.setAttribute('message', 'hello');
      toast.setAttribute('duration', '0');
      document.body.appendChild(toast);
      await waitForComponent(toast).catch(() => {});

      toast.show();
      expect(containers()).to.have.lengthOf(1);

      await toast.hide();

      expect(containers(), 'container should be gone once hide() resolves').to.have.lengthOf(0);
      expect(toast._isVisible, 'should no longer report visible').to.be.false;
    });

    it('is safe to call when not visible', async () => {
      const toast = document.createElement('dry-toast');
      document.body.appendChild(toast);
      await waitForComponent(toast).catch(() => {});

      // Must not reject or throw - callers chain onto this.
      await toast.hide();
    });
  });

  describe('attribute changes while visible', () => {
    it('leaves the toast visible after its message changes', async function () {
      this.timeout(5000);
      const toast = document.createElement('dry-toast');
      toast.setAttribute('message', 'first');
      toast.setAttribute('duration', '0');
      document.body.appendChild(toast);
      await waitForComponent(toast).catch(() => {});

      toast.show();
      expect(containers()).to.have.lengthOf(1);

      toast.setAttribute('message', 'second');

      // Long enough for the hide animation and the re-show to complete.
      await wait(800);

      expect(containers(), 'toast should still be on screen').to.have.lengthOf(1);
      expect(toast._isVisible).to.be.true;
      expect(document.body.textContent).to.include('second');
    });

    it('does not leave duplicate containers behind', async function () {
      this.timeout(5000);
      const toast = document.createElement('dry-toast');
      toast.setAttribute('message', 'first');
      toast.setAttribute('duration', '0');
      document.body.appendChild(toast);
      await waitForComponent(toast).catch(() => {});

      toast.show();
      toast.setAttribute('message', 'second');
      toast.setAttribute('type', 'success');
      await wait(900);

      expect(containers(), 'exactly one container should remain').to.have.lengthOf(1);
    });
  });

  describe('Toast convenience API', () => {
    it('removes its host element from the DOM after hiding', async function () {
      this.timeout(5000);
      expect(hosts()).to.have.lengthOf(0);

      window.Toast.success('done', { duration: 50 });
      await wait(30);
      expect(hosts(), 'host element should exist while showing').to.have.lengthOf(1);

      // duration 50ms + 300ms hide animation, plus margin.
      await wait(700);

      expect(hosts(), 'host element should be cleaned up after hiding').to.have.lengthOf(0);
      expect(containers(), 'container should be cleaned up too').to.have.lengthOf(0);
    });

    it('does not accumulate host elements across many toasts', async function () {
      this.timeout(8000);

      for (let i = 0; i < 5; i++) {
        window.Toast.info(`message ${i}`, { duration: 30 });
      }
      await wait(1200);

      expect(hosts(), 'every auto-hidden toast should clean up after itself')
        .to.have.lengthOf(0);
    });
  });
});
