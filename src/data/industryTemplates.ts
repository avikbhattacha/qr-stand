export interface IndustryCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  defaultTemplates: string[];
}

export const INDUSTRY_CATEGORIES: IndustryCategory[] = [
  {
    id: 'general',
    name: 'General Business',
    iconName: 'Building',
    description: 'Standard multi-purpose reviews for any business',
    defaultTemplates: [
      'Fantastic service from {name}! Extremely professional, on time, and great quality work. Highly recommended!',
      'Great experience with {name}. Honest, reliable, and answered all my questions. 5 stars all the way!',
      'Top-notch customer care and support from {name}. Will definitely be recommending them to friends and family!',
      'Fast, friendly, and reliable service from {name}. Exceeded our expectations in every single way!',
      'A true pleasure doing business with {name}. Seamless process, great attention to detail, and very fair pricing.',
      'Consistently great quality and friendly customer care at {name}. They go the extra mile to ensure you are happy!',
    ],
  },
  {
    id: 'refrigeration_hvac',
    name: 'HVAC & Refrigeration',
    iconName: 'Wrench',
    description: 'Commercial refrigeration, cooling, AC, and appliance repair',
    defaultTemplates: [
      'Exceptional service from {name}! Diagnosed the issue quickly and had everything running smoothly in no time. Honest pricing.',
      'Called {name} for urgent service. Arrived right on schedule, very professional, and explained the repairs clearly. 5 stars!',
      'Reliable, knowledgeable, and courteous team at {name}. Excellent maintenance work and preventative care. Highly recommend!',
      'Super fast response time and outstanding craftsmanship by {name}. Saved our equipment and charged a fair price.',
      'Always dependable! We trust {name} for all our cooling and repair needs. Punctual, neat, and highly skilled.',
      'Top-tier customer care from {name}. Great communication from booking to job completion. Couldn t be happier with the results!',
    ],
  },
  {
    id: 'restaurant_food',
    name: 'Restaurant, Cafe & Dining',
    iconName: 'Utensils',
    description: 'Dining, cafes, bakeries, bars, and catering',
    defaultTemplates: [
      'Had a wonderful experience at {name}! Delicious food, fast and friendly service, and a great atmosphere.',
      'Top-notch quality and hospitality at {name}. Everything was fresh and full of flavor. Staff went above and beyond!',
      'One of our absolute favorite spots! {name} never disappoints. Warm welcoming staff and outstanding service.',
      'Incredible dining experience at {name}! Every dish was prepared to perfection and served with a smile.',
      'Fantastic ambiance, great drink selection, and attentive staff at {name}. Perfect for both casual visits and special occasions.',
      'From start to finish, everything at {name} was first-class. Clean dining room, quick service, and mouthwatering food!',
    ],
  },
  {
    id: 'retail_shop',
    name: 'Retail & Boutique',
    iconName: 'ShoppingBag',
    description: 'Boutiques, specialty stores, clothing, and retail shops',
    defaultTemplates: [
      'Love shopping at {name}! Great selection of quality products, clean store, and the staff was super helpful.',
      'Wonderful customer service at {name}. Found exactly what I needed with great guidance from the team. 5 stars!',
      'Great inventory, fair prices, and a seamless checkout experience at {name}. Highly recommend checking them out!',
      'Such a pleasant visit to {name}! Beautifully curated items and attentive, friendly employees who know their products.',
      'Best shop in town! {name} always has what I am looking for at very reasonable prices. Will be back soon!',
      'Always a 10/10 experience shopping with {name}. Welcoming atmosphere and staff who genuinely care about customers.',
    ],
  },
];

export function getDefaultTemplates(categoryId: string): string[] {
  const found = INDUSTRY_CATEGORIES.find((c) => c.id === categoryId) || INDUSTRY_CATEGORIES[0];
  return [...found.defaultTemplates];
}

export function getStoredTweakedTemplates(categoryId: string): string[] | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(`review_qr_tweaked_templates_${categoryId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((s) => typeof s === 'string')) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function setStoredTweakedTemplates(categoryId: string, templates: string[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(`review_qr_tweaked_templates_${categoryId}`, JSON.stringify(templates));
  } catch {}
}

export function clearStoredTweakedTemplates(categoryId: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(`review_qr_tweaked_templates_${categoryId}`);
  } catch {}
}

export function encodeTemplatesForUrl(templates: string[]): string {
  try {
    return encodeURIComponent(JSON.stringify(templates));
  } catch {
    return '';
  }
}

export function decodeTemplatesFromUrl(raw: string): string[] {
  if (!raw) return [];
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith('[') && decoded.endsWith(']')) {
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
      }
    }
    return decoded
      .split('~~~')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  } catch {
    return [];
  }
}

export function getTemplatesForBusiness(
  category: string,
  businessName: string,
  customTemplate?: string,
  tweakedTemplates?: string[]
): string[] {
  const found = INDUSTRY_CATEGORIES.find((c) => c.id === category) || INDUSTRY_CATEGORIES[0];
  const sourceTemplates =
    tweakedTemplates && tweakedTemplates.length > 0
      ? tweakedTemplates
      : found.defaultTemplates;
  const replaced = sourceTemplates.map((t) => t.replace(/\{name\}/g, businessName || 'this business'));
  if (customTemplate && customTemplate.trim()) {
    const formattedCustom = customTemplate.trim().replace(/\{name\}/g, businessName || 'this business');
    if (!replaced.includes(formattedCustom)) {
      return [formattedCustom, ...replaced];
    }
  }
  return replaced;
}

export function isDirectReviewCommentUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return lower.includes('writereview') || lower.endsWith('/review') || lower.includes('/review?');
}

export function convertToDirectReviewUrl(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{20,}$/.test(trimmed)) {
    return `https://search.google.com/local/writereview?placeid=${trimmed}`;
  }
  const placeIdMatch = trimmed.match(/[?&]placeid=([A-Za-z0-9_-]+)/i);
  if (placeIdMatch && placeIdMatch[1]) {
    return `https://search.google.com/local/writereview?placeid=${placeIdMatch[1]}`;
  }
  const placeIdUnderscore = trimmed.match(/[?&]place_id=([A-Za-z0-9_-]+)/i);
  if (placeIdUnderscore && placeIdUnderscore[1]) {
    return `https://search.google.com/local/writereview?placeid=${placeIdUnderscore[1]}`;
  }
  if (/g\.page\/[a-zA-Z0-9_-]+$/i.test(trimmed)) return `${trimmed}/review`;
  if (/g\.page\/r\/[a-zA-Z0-9_-]+$/i.test(trimmed)) return `${trimmed}/review`;
  return normalizeReviewUrl(trimmed);
}

export function normalizeReviewUrl(url: string): string {
  if (!url) return 'https://search.google.com/local/writereview';
  let trimmed = url.trim();
  if (!trimmed) return 'https://search.google.com/local/writereview';
  if (/^[A-Za-z0-9_-]{20,}$/.test(trimmed)) {
    return `https://search.google.com/local/writereview?placeid=${trimmed}`;
  }
  if (!/^https?:\/\//i.test(trimmed)) trimmed = `https://${trimmed}`;
  return trimmed;
}
