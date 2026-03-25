/**
 * Promo Banner block — full-width two-column banner with image and text.
 *
 * Expected block structure (Google Doc table):
 *   Row 1, Col 1: Image
 *   Row 1, Col 2: Heading, description, CTA link
 *
 * @param {Element} block
 */
export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = [...row.children];
  cells[0]?.classList.add('promo-banner-content');
  cells[1]?.classList.add('promo-banner-image');

  const content = block.querySelector('.promo-banner-content');
  if (content) {
    content.querySelectorAll('a').forEach((a) => {
      a.classList.add('button', 'primary');
      a.closest('p')?.classList.add('button-wrapper');
    });
  }
}
