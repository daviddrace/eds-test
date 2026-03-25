/**
 * Related Products block — fetches and renders product cards.
 *
 * Authored as a single-row block in Google Docs. The single cell contains
 * comma-separated product tags or category terms (e.g. "toothbrush, toothpaste").
 *
 * Architecture:
 *  - POC: reads from /products.json (a Google Sheet published as a data source)
 *  - Production: swap fetch for Elasticsearch call using same tags
 *
 * Star ratings are loaded asynchronously after the cards render to avoid
 * blocking the page. Buy Now buttons are plain links to PDP pages.
 *
 * @param {Element} block
 */

const PRODUCTS_INDEX = '/products.json';
const MAX_RESULTS = 4;

function buildStarsPlaceholder(sku) {
  const stars = document.createElement('div');
  stars.classList.add('related-products-stars');
  stars.dataset.sku = sku;
  stars.setAttribute('aria-label', 'Loading ratings');
  return stars;
}

function buildProductCard(product) {
  const card = document.createElement('div');
  card.classList.add('related-products-card');

  const imageWrap = document.createElement('div');
  imageWrap.classList.add('related-products-card-image');
  if (product.image) {
    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.title || '';
    img.loading = 'lazy';
    img.width = 200;
    img.height = 200;
    imageWrap.append(img);
  }

  const body = document.createElement('div');
  body.classList.add('related-products-card-body');

  const title = document.createElement('p');
  title.classList.add('related-products-card-title');
  title.textContent = product.title || '';
  body.append(title);

  body.append(buildStarsPlaceholder(product.sku || ''));

  const cta = document.createElement('a');
  cta.classList.add('button', 'primary');
  cta.href = product.pdp || '#';
  cta.textContent = 'Buy Now';
  cta.setAttribute('aria-label', `Buy ${product.title}`);
  body.append(cta);

  card.append(imageWrap, body);
  return card;
}

async function loadRatingsAsync(block) {
  /* TODO: Replace with real third-party ratings SDK call (e.g. Bazaarvoice, PowerReviews).
   * Loaded in delayed.js to keep it off the critical path.
   * Example: window.BV?.ratings?.render({ productId: sku, container: el }); */
  block.querySelectorAll('.related-products-stars[data-sku]').forEach((el) => {
    const { sku } = el.dataset;
    if (!sku) return;
    el.textContent = '★★★★☆ (placeholder)';
    el.setAttribute('aria-label', '4 out of 5 stars');
  });
}

export default async function decorate(block) {
  const tags = block.querySelector('div > div')?.textContent?.trim() || '';
  block.textContent = '';

  const heading = document.createElement('h2');
  heading.textContent = 'Related Products';
  block.append(heading);

  const grid = document.createElement('div');
  grid.classList.add('related-products-grid');
  block.append(grid);

  if (!tags) return;

  const tagList = tags.split(',').map((t) => t.trim().toLowerCase());

  try {
    /* TODO: replace with Elasticsearch call using product tags/categories */
    const resp = await fetch(PRODUCTS_INDEX);
    if (!resp.ok) return;

    const json = await resp.json();
    const products = (json.data || [])
      .filter((p) => {
        const pTags = (p.tags || p.category || '').toLowerCase();
        return tagList.some((t) => pTags.includes(t));
      })
      .slice(0, MAX_RESULTS);

    products.forEach((product) => grid.append(buildProductCard(product)));

    /* Ratings are non-critical — load after a short delay */
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => loadRatingsAsync(block));
    } else {
      setTimeout(() => loadRatingsAsync(block), 0);
    }
  } catch (e) {
    /* fail silently — related products are non-critical */
  }
}
