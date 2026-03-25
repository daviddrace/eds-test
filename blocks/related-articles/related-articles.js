/**
 * Related Articles block — fetches and renders article cards.
 *
 * Authored as a single-row block in Google Docs with one of:
 *   - Comma-separated tags to filter the query index (e.g. "wisdom-teeth, oral-health")
 *   - OR an Elasticsearch query string (future integration)
 *
 * For the POC this queries the EDS query-index.json and filters by tags.
 * Production would swap the fetch for an authenticated Elasticsearch call.
 *
 * @param {Element} block
 */

const QUERY_INDEX = '/query-index.json';
const MAX_RESULTS = 4;

function buildCard(article) {
  const card = document.createElement('article');
  card.classList.add('related-articles-card');

  const image = document.createElement('div');
  image.classList.add('related-articles-card-image');
  if (article.image) {
    const img = document.createElement('img');
    img.src = article.image;
    img.alt = article.title || '';
    img.loading = 'lazy';
    img.width = 300;
    img.height = 200;
    image.append(img);
  }

  const body = document.createElement('div');
  body.classList.add('related-articles-card-body');

  if (article.category) {
    const cat = document.createElement('span');
    cat.classList.add('related-articles-card-category');
    cat.textContent = article.category;
    body.append(cat);
  }

  const title = document.createElement('h3');
  const link = document.createElement('a');
  link.href = article.path;
  link.textContent = article.title;
  title.append(link);
  body.append(title);

  card.append(image, body);
  return card;
}

export default async function decorate(block) {
  const tags = block.querySelector('div > div')?.textContent?.trim() || '';
  block.textContent = '';

  const heading = document.createElement('h2');
  heading.textContent = 'Related Articles';
  block.append(heading);

  const list = document.createElement('div');
  list.classList.add('related-articles-list');
  block.append(list);

  if (!tags) return;

  const tagList = tags.split(',').map((t) => t.trim().toLowerCase());

  try {
    /* TODO: replace with Elasticsearch call using article meta tags */
    const resp = await fetch(QUERY_INDEX);
    if (!resp.ok) return;

    const json = await resp.json();
    const articles = (json.data || [])
      .filter((item) => {
        const itemTags = (item.tags || '').toLowerCase();
        return tagList.some((t) => itemTags.includes(t));
      })
      .slice(0, MAX_RESULTS);

    articles.forEach((article) => list.append(buildCard(article)));
  } catch (e) {
    /* fail silently — related articles are non-critical */
  }
}
