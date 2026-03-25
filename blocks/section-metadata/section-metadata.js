/**
 * Section Metadata block — stores page metadata (style, layout, etc.)
 * Parses metadata rows and applies style classes to parent section.
 * Block structure: each row has [key, value] cells.
 * Example: [style, article-with-sidebar] applies class "article-with-sidebar" to section.
 */

export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) {
    block.style.display = 'none';
    return;
  }

  const rows = [...block.querySelectorAll(':scope > div')];
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();

      if (key === 'style' && value) {
        value.split(',').forEach((style) => {
          section.classList.add(style.trim());
        });
      }
    }
  });

  block.style.display = 'none';
}
