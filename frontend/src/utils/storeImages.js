/**
 * storeImages.js
 * Curated, fast-loading CDN photography for storefronts, categories, and customer avatars.
 * Optimized with Unsplash CDN parameters for fast delivery, responsive sizing, and high visual fidelity.
 */

// Category Hero / Fallback Photography
export const CATEGORY_PHOTOS = {
  'Tech & Electronics':
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=700&q=80',
  'Grocery & Mart':
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80',
  'Fashion & Boutique':
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=80',
  'Cafe & Dining':
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=700&q=80',
  'Services & Wellness':
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80',
  'General':
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=700&q=80',
};

// Store-Specific Showcase Photography
export const STORE_SHOWCASE_PHOTOS = {
  // Tech & Electronics
  'croma digital hub electronics':
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
  'vijay sales mega appliance mart':
    'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
  'reliance digital superstore delhi':
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',

  // Grocery & Mart
  'dmart hypermarket & grocery mart':
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
  'nature basket organic gourmet mart':
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  'more mega mart supermarket retail':
    'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=800&q=80',

  // Fashion & Boutique
  'fabindia heritage apparel & decor':
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
  'manyavar mohey ethnic couture mart':
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
  'zudio trendy fashion store pune':
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',

  // Cafe & Dining
  'third wave coffee roasters indiranagar':
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
  'blue tokai coffee roasters bandra':
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
  'chaayos chai & snacking hub gurgaon':
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',

  // Services & Wellness
  'kama ayurveda wellness & spa lounge':
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
  'forest essentials luxury ayurveda store':
    'https://images.unsplash.com/photo-1608248597359-21b9335ef00e?auto=format&fit=crop&w=800&q=80',
};

// Customer & User Profile Avatars
export const USER_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
];

/**
 * Returns a high-quality photograph for a given store name and category.
 */
export const getStorePhoto = (storeName = '', category = 'General') => {
  const normalized = (storeName || '').trim().toLowerCase();
  if (STORE_SHOWCASE_PHOTOS[normalized]) {
    return STORE_SHOWCASE_PHOTOS[normalized];
  }
  return CATEGORY_PHOTOS[category] || CATEGORY_PHOTOS['General'];
};

/**
 * Returns a deterministic portrait avatar based on user ID or email.
 */
export const getUserAvatar = (identifier = '') => {
  if (!identifier) return USER_AVATARS[0];
  const str = String(identifier);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % USER_AVATARS.length;
  return USER_AVATARS[index];
};
