// Extracted from index.html (line 24602) by Manus SEO pass — load order preserved

function openBlog(id) {
  const b = BLOGS.find(x => x.id === id);
  if (!b) return;
  const ov = document.getElementById('blogOverlay');
  const rd = document.getElementById('blogReader');
  const bodyHtml = b.bodyHtml || (b.body
    ? b.body.split(/\.(?=\s[A-Z])/).map(s => s.trim()).filter(Boolean).map(s => '<p>' + s + '</p>').join('')
    : '<p>' + b.excerpt + '</p>');
  const shopBtn = b.relatedProduct
    ? '<div style="margin-top:24px"><button class="btn-primary" onclick="closeBlog();openProduct(' + b.relatedProduct + ')">Shop This Product &rarr;</button></div>'
    : '';
  rd.innerHTML = '<button class="br-close" onclick="closeBlog()" aria-label="Close article">&times;</button>'
    + '<img class="br-img" src="' + b.img + '" alt="' + (b.alt || b.title) + '" loading="lazy" decoding="async">'
    + '<span class="br-tag">' + b.tag + '</span>'
    + '<h2>' + b.title + '</h2>'
    + '<div class="br-meta">' + b.date + ' &middot; ' + b.readTime + ' &middot; ' + b.author + '</div>'
    + '<div class="br-body">' + bodyHtml + '</div>'
    + shopBtn;
  const blogSlug = b.slug || slugify(b.title);
  const articleTitle = b.metaTitle || b.title;
  document.title = /\bOzylix\b/i.test(articleTitle) ? articleTitle : articleTitle + ' | Ozylix';
  const blogDescription = document.querySelector('meta[name="description"]');
  if (blogDescription) blogDescription.setAttribute('content', b.metaDescription || b.excerpt);
  const blogCanonical = document.querySelector('link[rel="canonical"]');
  if (blogCanonical) blogCanonical.setAttribute('href', 'https://www.ozylix.com/blog/' + blogSlug);
  const blogOgTitle = document.querySelector('meta[property="og:title"]');
  if (blogOgTitle) blogOgTitle.setAttribute('content', b.metaTitle || b.title);
  const blogOgDescription = document.querySelector('meta[property="og:description"]');
  if (blogOgDescription) blogOgDescription.setAttribute('content', b.metaDescription || b.excerpt);
  const blogOgUrl = document.querySelector('meta[property="og:url"]');
  if (blogOgUrl) blogOgUrl.setAttribute('content', 'https://www.ozylix.com/blog/' + blogSlug);
  const blogOgImage = document.querySelector('meta[property="og:image"]');
  if (blogOgImage) blogOgImage.setAttribute('content', /^https?:/.test(b.img) ? b.img : 'https://www.ozylix.com' + b.img);
  let blogSchema = document.getElementById('blog-article-schema');
  if (!blogSchema) { blogSchema = document.createElement('script'); blogSchema.id = 'blog-article-schema'; blogSchema.type = 'application/ld+json'; document.head.appendChild(blogSchema); }
  blogSchema.textContent = JSON.stringify({
    '@context':'https://schema.org', '@type':'Article', headline:b.title, description:b.metaDescription || b.excerpt,
    image:[/^https?:/.test(b.img) ? b.img : 'https://www.ozylix.com' + b.img], datePublished:new Date(b.date).toISOString().split('T')[0], dateModified:new Date(b.date).toISOString().split('T')[0], author:{'@type':'Organization',name:b.author}, publisher:{'@type':'Organization',name:'Ozylix',url:'https://www.ozylix.com/'}, mainEntityOfPage:{'@type':'WebPage','@id':'https://www.ozylix.com/blog/' + blogSlug}
  });
  ov.style.display = 'block';
  try { history.pushState({ page:'blog', id:id }, '', '/blog/' + blogSlug); } catch(e) { window.location.hash = 'blog-' + id; }
}
// ── /blog/<slug> deep links ─────────────────────────────────────────────
// Google can only link to an article it discovered, and it indexes the
// clean path /blog/<slugified-title>, never the #blog-N hash. On arrival
// the init code calls this to open the matching entry by slugified title.
function openBlogBySlug(slug) {
  if (!slug || typeof BLOGS === 'undefined') return;
  const wanted = slugify(decodeURIComponent(slug));
  const b = BLOGS.find(x => (x.slug && slugify(x.slug) === wanted) || slugify(x.title) === wanted || slugify(x.id + '') === wanted);
  if (b) openBlog(b.id);
}

function closeBlog() {
  const ov = document.getElementById('blogOverlay');
  if (ov) ov.style.display = 'none';
  if (location.pathname.startsWith('/blog/')) {
    try { history.replaceState(null, '', '/blog'); } catch(e) {}
  } else if (location.hash && location.hash.startsWith('#blog-')) {
    try { history.replaceState(null, '', location.pathname + location.search); } catch(e) {}
  }
}
