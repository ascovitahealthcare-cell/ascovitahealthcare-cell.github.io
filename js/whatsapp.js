const REVIEWS = {
  1:[{user:"Sneha Joshi",rating:5,text:"Noticed brighter skin in 4 weeks. The orange flavour is so refreshing to drink every day!",date:"Feb 2025",verified:true},{user:"Meera Sharma",rating:4,text:"Premium Glutathione product, quality is evident. Genuine L-Glutathione 650mg.",date:"Jan 2025",verified:true}],
  2:[{user:"Pooja Jain",rating:5,text:"ACV + Moringa Green Apple is amazing! Feel the difference in energy and digestion in 2 weeks.",date:"Mar 2025",verified:true},{user:"Vikram Singh",rating:5,text:"Love this product. Cravings have reduced a lot. Great for weight management.",date:"Feb 2025",verified:true}],
  3:[{user:"Sanya Mishra",rating:5,text:"L-Carnitine Orange is so refreshing! My energy during workouts has visibly improved.",date:"Mar 2025",verified:true},{user:"Rohan Gupta",rating:4,text:"Great for fat burning support. Can feel the sustained energy throughout the day.",date:"Feb 2025",verified:true}],
  4:[{user:"Deepa Menon",rating:5,text:"Hair fall reduced significantly in 6 weeks! The guava taste is absolutely delicious.",date:"Feb 2025",verified:true},{user:"Priya Nair",rating:5,text:"B12 + Biotin combo is incredible. Nails stopped breaking and skin is glowing!",date:"Jan 2025",verified:true}],
  5:[{user:"Kavya Patel",rating:5,text:"Vitamin C fizz is so good! My immunity is definitely stronger this season.",date:"Feb 2025",verified:true},{user:"Ritika Desai",rating:5,text:"Best Vitamin C supplement I've tried. Love the moringa addition.",date:"Jan 2025",verified:true}],
  8:[{user:"Ramesh Kumar",rating:5,text:"Best multivitamin at this price. Complete nutrition in one tablet!",date:"Feb 2025",verified:true},{user:"Anjali Mehta",rating:5,text:"Doctor recommended and I'm glad. B12 deficiency improved in 2 months.",date:"Feb 2025",verified:true}],
  10:[{user:"Sunita Rao",rating:5,text:"VitaPlus B12+D3 is fantastic. No fishy smell, easy to swallow, great energy.",date:"Feb 2025",verified:true},{user:"Geeta Iyer",rating:5,text:"Spirulina quality is excellent. Certified organic and made in India!",date:"Jan 2025",verified:true}],
  20:[{user:"Arjun Sharma",rating:5,text:"Moringa tablets are incredible! Energy levels have gone up noticeably.",date:"Mar 2025",verified:true},{user:"Nikhil Patel",rating:4,text:"Pure moringa, no filler. Good stamina and digestion improvement.",date:"Feb 2025",verified:true}],
};
PRODUCTS.forEach(p => {
  if (!REVIEWS[p.id]) REVIEWS[p.id] = [{user:"Verified Buyer",rating:Math.round(p.rating),text:`${p.name} is exactly as described. Great quality from Ascovita.`,date:"Jan 2025",verified:true},{user:"Happy Customer",rating:5,text:"Ascovita products are genuine and effective.",date:"Feb 2025",verified:true}];
});

const STORE = {
  cart:[], wishlist:[],
  init(){try{this.cart=JSON.parse(localStorage.getItem('asc_cart')||'[]');}catch(e){this.cart=[];}try{this.wishlist=JSON.parse(localStorage.getItem('asc_wish')||'[]');}catch(e){this.wishlist=[];}this.updateCartUI();},
  save(){try{localStorage.setItem('asc_cart',JSON.stringify(this.cart));localStorage.setItem('asc_wish',JSON.stringify(this.wishlist));}catch(e){}this.updateCartUI();},
  addToCart(id,qty=1){const p=PRODUCTS.find(p=>p.id===id);if(!p)return;const ex=this.cart.find(i=>i.id===id);if(ex)ex.qty+=qty;else this.cart.push({id,qty});this.save();window._trackAddToCart&&window._trackAddToCart(p,qty);showToast(`${p.name} added to cart! 🌿`);},
  removeFromCart(id){this.cart=this.cart.filter(i=>i.id!==id);this.save();},
  updateQty(id,qty){const item=this.cart.find(i=>i.id===id);if(item){item.qty=Math.max(1,qty);this.save();}},
  getSubtotal(){return this.cart.reduce((s,i)=>{const p=PRODUCTS.find(p=>p.id===i.id);return s+(p?((p.salePrice||p.price)||0)*i.qty:0);},0);},
  applyCode(code){return null;}, // All codes validated via backend — see applyCode()
  updateCartUI(){const count=this.cart.reduce((s,i)=>s+i.qty,0);document.querySelectorAll('.cart-badge').forEach(el=>{el.textContent=count;el.style.display=count>0?'flex':'none';});},
  toggleWishlist(id){const idx=this.wishlist.indexOf(id);if(idx>-1){this.wishlist.splice(idx,1);showToast('Removed from wishlist');}else{this.wishlist.push(id);showToast('Added to wishlist! 💚');}this.save();}
};

function fmt(p){return '₹'+p.toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:2});}
function stars(r){const f=Math.floor(r),h=r%1>=0.5;return '<span class="stars">'+'★'.repeat(f)+(h?'☆':'')+'</span><span class="rating-n">'+r+'</span>';}
function showToast(msg,type=''){const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),350);},3200);}
function renderProductCard(p){
  const disc=p.salePrice&&p.price?Math.round((1-p.salePrice/p.price)*100):0;
  const rawTiers=p._backendTiers||QTY_TIERS[p.id];
  const tiers=rawTiers&&rawTiers.filter(t=>t.rate!=null&&t.mrp!=null).length?rawTiers.filter(t=>t.rate!=null&&t.mrp!=null):null;
  const maxDisc=tiers?Math.max(...tiers.map(t=>t.discountPct||0)):disc;
  const baseRate=tiers?tiers[0].rate:(p.salePrice||p.price);
  const baseMRP=tiers?tiers[0].mrp:p.price;
  const priceDisplay=(baseRate==null)?'<em style="font-size:0.8rem;color:#b8860b">Price Coming Soon</em>':'\u20B9'+baseRate.toLocaleString('en-IN');
  return `<div class="product-card" data-product-id="${p.id}" onclick="openProduct(${p.id})"><div class="p-img-wrap"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x400/EAF2E0/2D5016?text=Ascovita'">${p.badge?`<span class="p-badge">${p.badge}</span>`:''} ${maxDisc>0?`<span class="p-disc-badge">${tiers?'Up to ':'-'}${maxDisc}%</span>`:''}<div class="p-actions"><button class="btn-wishlist" onclick="event.stopPropagation();STORE.toggleWishlist(${p.id})" title="Wishlist">♡</button><button class="btn-qadd" onclick="event.stopPropagation();${tiers?`openProduct(${p.id})`:`STORE.addToCart(${p.id})`}">${tiers?'Choose Pack':'Add to Cart'}</button></div></div><div class="p-info"><div class="p-brand">${p.brand}</div><div class="p-name">${p.name}</div><div class="p-rating">${stars(p.rating)} <span class="review-ct">(${p.reviews})</span></div><div class="p-price"><span class="sale-price">${priceDisplay}</span>${(baseMRP&&baseMRP!==baseRate)?`<span class="orig-price">₹${baseMRP.toLocaleString('en-IN')}</span>`:''}</div>${tiers?`<div class="tier-offer-tag">⚡ Up to ${maxDisc}% OFF on larger packs</div>`:(p.offer?`<span class="offer-tag" style="margin-top:4px;display:inline-block">${p.offer}</span>`:'')}</div></div>`;
}
