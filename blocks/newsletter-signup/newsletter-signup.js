/**
 * Newsletter Signup block — iframed SFMC Cloud Pages form.
 *
 * Authored as a single-row block in Google Docs:
 *   Row 1: SFMC Cloud Pages URL (the iframe src)
 *
 * The iframe is loaded lazily via IntersectionObserver so it never
 * blocks the initial page load or impacts Lighthouse scores.
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const url = block.querySelector('div > div')?.textContent?.trim();
  block.textContent = '';

  if (!url) return;

  const placeholder = document.createElement('div');
  placeholder.classList.add('newsletter-signup-placeholder');
  block.append(placeholder);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.title = 'Sign up for our newsletter';
      iframe.loading = 'lazy';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('scrolling', 'no');
      iframe.classList.add('newsletter-signup-iframe');

      /* Resize iframe to fit content once loaded */
      iframe.addEventListener('load', () => {
        try {
          const { scrollHeight } = iframe.contentDocument?.body || {};
          if (scrollHeight) iframe.style.height = `${scrollHeight}px`;
        } catch {
          /* cross-origin — use a fixed height or postMessage from SFMC page */
        }
      });

      placeholder.replaceWith(iframe);
    });
  }, { rootMargin: '200px' });

  observer.observe(placeholder);
}
