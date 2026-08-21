/*
 * Ozylix route-aware structured data.
 *
 * Keep this graph factual and small: the visible page is the source of truth.
 * Product offers are generated from the live PRODUCTS array, while ratings are
 * emitted only when the product has a non-zero real review count.
 */
(function () {
  var ORIGIN = 'https://www.ozylix.com';
  var ORG_ID = ORIGIN + '/#organization';
  var SITE_ID = ORIGIN + '/#website';

  var PAGE_INFO = {
    home: { name: 'Ozylix effervescent vitamins and supplements', description: 'Shop Ozylix effervescent vitamins and everyday supplements made by Ascovita Healthcare in Anand, Gujarat.' },
    shop: { name: 'Shop Ozylix supplements', description: 'Browse Ozylix glutathione, spirulina, moringa, ACV and multivitamin supplements with current prices and availability.' },
    about: { name: 'About Ozylix', description: 'Learn how Ozylix supplements are made by Ascovita Healthcare in Anand, Gujarat.' },
    blog: { name: 'The Ozylix Blog', description: 'Practical guides about ingredients, effervescent supplements, manufacturing, delivery and everyday wellness.' },
    faq: { name: 'Ozylix frequently asked questions', description: 'Answers about Ozylix products, ingredients, shipping, payment, returns, Mix & Match and wholesale enquiries.' },
    contact: { name: 'Contact Ozylix', description: 'Contact Ozylix for product questions, order support, wholesale enquiries and manufacturing information.' },
    advisor: { name: 'Ozylix AI Health Advisor', description: 'A general wellness questionnaire for exploring products that may fit a stated goal. Not medical advice.' },
    privacy: { name: 'Ozylix Privacy Policy', description: 'How Ozylix collects, uses, stores and protects information.' },
    terms: { name: 'Ozylix Terms and Conditions', description: 'Terms for Ozylix purchases, accounts, payments, delivery, returns and website use.' },
    shipping: { name: 'Ozylix Shipping Policy', description: 'Ozylix dispatch timelines, delivery charges, tracking and delivery support in India.' },
    refund: { name: 'Ozylix Refund and Return Policy', description: 'Ozylix eligibility, timelines and steps for reporting damaged, incorrect, sealed or unused products.' },
    accessibility: { name: 'Ozylix Accessibility Statement', description: 'Ozylix accessibility commitments and how to report an issue.' },
    conduct: { name: 'Ozylix Conduct and Violation Policy', description: 'Rules for safe and respectful Ozylix account, review and support interactions.' },
    'discount-policy': { name: 'Ozylix Discount Policy', description: 'How Ozylix coupons, Mix & Match offers, eligibility and limits are applied.' },
    'vita-points': { name: 'Ozylix VitaPoints Rewards', description: 'How Ozylix VitaPoints are earned, redeemed and adjusted on eligible orders.' },
    download: { name: 'Install the Ozylix App', description: 'Continue the Ozylix shopping experience on supported devices.' },
    wishlist: { name: 'My Ozylix Wishlist', description: 'Saved Ozylix products for later.' },
    notifications: { name: 'Ozylix Notification Center', description: 'Review Ozylix order, rewards and service notifications.' },
    cart: { name: 'Your Ozylix Cart', description: 'Review selected products, quantities, discounts, delivery charges and the current order total.' },
    checkout: { name: 'Ozylix Secure Checkout', description: 'Complete an Ozylix order; available payment methods and delivery charges are shown before payment.' }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function text(value) {
    return String(value == null ? '' : value).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  function currentPage() {
    var first = (location.pathname || '/').replace(/^\/+|\/+$/g, '').split('/')[0];
    return first || 'home';
  }

  function currentUrl() {
    var path = location.pathname || '/';
    return ORIGIN + (path === '/' ? '/' : path.replace(/\/+$/, ''));
  }

  function imageUrl(value) {
    if (!value) return '';
    var raw = typeof value === 'string' ? value : value.url;
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : ORIGIN + '/' + String(raw).replace(/^\/+/, '');
  }

  function availability(product) {
    if (typeof product.stock === 'undefined') return 'https://schema.org/InStock';
    return Number(product.stock) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
  }

  function productNode(product) {
    var url = currentUrl();
    var price = Number(product.salePrice || product.price || 0);
    var reviews = Number(product.reviews || product.reviewCount || 0);
    var rating = Number(product.rating || 0);
    var image = imageUrl(product.image || (product.images && product.images[0]));
    var node = {
      '@type': 'Product',
      '@id': url + '#product',
      name: text(product.name),
      description: text(product.description),
      image: image ? [image] : undefined,
      url: url,
      sku: product.sku || String(product.id || ''),
      brand: { '@type': 'Brand', name: 'Ozylix' },
      offers: {
        '@type': 'Offer',
        url: url,
        priceCurrency: 'INR',
        price: price,
        availability: availability(product),
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@id': ORG_ID },
        areaServed: { '@type': 'Country', name: 'India' }
      }
    };
    if (reviews > 0 && rating > 0) {
      node.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: rating,
        reviewCount: reviews,
        bestRating: 5,
        worstRating: 1
      };
    }
    Object.keys(node).forEach(function (key) { if (node[key] === undefined || node[key] === '') delete node[key]; });
    return node;
  }

  function baseGraph(url, page) {
    var info = PAGE_INFO[page] || PAGE_INFO.home;
    return [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'Ozylix',
        alternateName: ['Ozylix India', 'Ozylix Effervescent'],
        url: ORIGIN + '/',
        logo: { '@type': 'ImageObject', url: ORIGIN + '/assets/ozylix-icon-512.png', caption: 'Ozylix logo' },
        description: 'Ozylix is the consumer supplement brand of Ascovita Healthcare, made in Anand, Gujarat.',
        parentOrganization: { '@id': ORIGIN + '/#ascovita' },
        address: { '@type': 'PostalAddress', addressLocality: 'Anand', addressRegion: 'Gujarat', postalCode: '388001', addressCountry: 'IN' },
        telephone: '+91-98985-82650',
        email: 'ascovitahealthcare@gmail.com',
        sameAs: ['https://www.instagram.com/ozylixlife', 'https://www.ascovita.com/']
      },
      {
        '@type': 'Organization',
        '@id': ORIGIN + '/#ascovita',
        name: 'Ascovita Healthcare',
        url: 'https://www.ascovita.com/',
        description: 'The parent company that manufactures Ozylix products in Anand, Gujarat.'
      },
      {
        '@type': 'WebSite',
        '@id': SITE_ID,
        url: ORIGIN + '/',
        name: 'Ozylix',
        publisher: { '@id': ORG_ID },
        inLanguage: 'en-IN'
      },
      {
        '@type': 'WebPage',
        '@id': url + '#webpage',
        url: url,
        name: info.name,
        description: info.description,
        isPartOf: { '@id': SITE_ID },
        about: { '@id': ORG_ID },
        inLanguage: 'en-IN'
      },
      {
        '@type': 'BreadcrumbList',
        '@id': url + '#breadcrumb',
        itemListElement: page === 'home' ? [{ '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN + '/' }] : [
          { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN + '/' },
          { '@type': 'ListItem', position: 2, name: info.name, item: url }
        ]
      }
    ];
  }

  function faqNode(url) {
    var root = document.getElementById('page-faq');
    if (!root) return null;
    var questions = [];
    root.querySelectorAll('.faq-item').forEach(function (item) {
      var button = item.querySelector('.faq-q');
      var answer = item.querySelector('.faq-a-inner');
      var question = text(button && button.textContent).replace(/\s*\+\s*$/, '');
      var answerText = text(answer && answer.textContent);
      if (question && answerText) questions.push({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answerText } });
    });
    return questions.length ? { '@type': 'FAQPage', '@id': url + '#faq', mainEntity: questions } : null;
  }

  function clearEmitted() {
    document.querySelectorAll('script[data-ozylx-seo]').forEach(function (node) { node.remove(); });
  }

  function insertGraph(graph) {
    clearEmitted();
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-ozylx-seo', '1');
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    document.head.appendChild(script);
  }

  window.emitStaticSeoGraph = function () { window.emitPageSeoGraph(null); };
  window.emitPageSeoGraph = function (product) {
    var page = currentPage();
    var url = currentUrl();
    var graph = baseGraph(url, page);
    var faq = page === 'faq' ? faqNode(url) : null;
    if (faq) graph.push(faq);
    if (product && product.id) {
      graph.push(productNode(product));
    } else if (page === 'shop' && typeof PRODUCTS !== 'undefined' && PRODUCTS.length) {
      var items = PRODUCTS.map(productNode);
      graph.push({ '@type': 'ItemList', '@id': url + '#products', name: 'Ozylix products', numberOfItems: items.length, itemListElement: items.map(function (item, index) {
        return { '@type': 'ListItem', position: index + 1, item: { '@id': item['@id'] } };
      }) });
      graph = graph.concat(items);
    }
    insertGraph(graph);
  };

  function boot() {
    if (typeof PRODUCTS !== 'undefined' && PRODUCTS && PRODUCTS.length) window.emitPageSeoGraph(null);
    else setTimeout(boot, 500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
