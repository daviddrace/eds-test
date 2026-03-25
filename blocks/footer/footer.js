import { getMetadata } from '../../scripts/aem.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';

  let fragment = null;
  try {
    const resp = await fetch(`${footerPath}.plain.html`);
    if (resp.ok) {
      const html = await resp.text();
      const temp = document.createElement('div');
      temp.innerHTML = html;
      fragment = temp;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to load footer fragment from ${footerPath}:`, e);
  }

  // decorate footer DOM
  block.textContent = '';

  if (!fragment) {
    return;
  }

  // Parse fragment (p + ul pairs for columns, last few p for copyright/legal)
  const section = document.createElement('div');
  section.classList.add('section', 'footer-columns');

  let currentColumn = null;
  const copyrightElements = [];

  // fragment is wrapped in a div, so look at its children
  const children = fragment.children.length === 1 && fragment.children[0].tagName === 'DIV'
    ? Array.from(fragment.children[0].children)
    : Array.from(fragment.children);

  children.forEach((el) => {
    if (el.tagName === 'P') {
      if (el.textContent.includes('Copyright') || (el.querySelector('a') && el.textContent.includes('|'))) {
        // Likely copyright or legal links
        copyrightElements.push(el.cloneNode(true));
      } else {
        // New column heading
        currentColumn = document.createElement('div');
        currentColumn.classList.add('footer-column');
        currentColumn.append(el.cloneNode(true));
        section.append(currentColumn);
      }
    } else if (el.tagName === 'UL' && currentColumn) {
      // Links for the current column
      currentColumn.append(el.cloneNode(true));
    }
  });

  block.append(section);

  if (copyrightElements.length > 0) {
    const copyrightSection = document.createElement('div');
    copyrightSection.classList.add('section', 'footer-legal');
    copyrightElements.forEach((el) => copyrightSection.append(el));
    block.append(copyrightSection);
  }

  // Required by AEM boilerplate styles to make the block visible
  block.setAttribute('data-block-status', 'loaded');
}
