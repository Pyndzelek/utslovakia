/**
 * Static placeholder catalog data for the design pass.
 * Nothing here is wired to Payload CMS — swap for real queries later.
 */

export type ProductBadge = 'new' | 'sale' | 'bestseller'

export interface ProductSpec {
  label: string
  value: string
}

export interface Product {
  id: number
  slug: string
  name: string
  brand: string
  sku: string
  categorySlug: string
  price: number
  oldPrice?: number
  /** EU Omnibus-style note shown under discounted prices */
  lowestPriceNote?: number
  badge?: ProductBadge
  inStock: boolean
  leadTime: string
  excerpt: string
  description: string[]
  features: string[]
  specs: ProductSpec[]
  image: string
}

export interface Category {
  slug: string
  name: string
  tagline: string
  description: string
  productCount: number
  image: string
}

export interface Industry {
  slug: string
  name: string
  description: string
}

export const PRODUCT_IMAGE = '/maszynka.png'

/* ------------------------------------------------------------------------ */
/* Categories                                                                */
/* ------------------------------------------------------------------------ */

export const categories: Category[] = [
  {
    slug: 'bill-acceptors',
    name: 'Akceptory banknotów',
    tagline: 'Zaawansowana weryfikacja banknotów',
    description:
      'Akceptory banknotów do automatów vendingowych, kiosków i urządzeń samoobsługowych.',
    productCount: 24,
    image: PRODUCT_IMAGE,
  },
  {
    slug: 'printers',
    name: 'Drukarki',
    tagline: 'Przemysłowe drukarki do kiosków i automatów',
    description: 'Drukarki termiczne i kioskowe do wydruku paragonów, biletów i kuponów.',
    productCount: 0,
    image: PRODUCT_IMAGE,
  },
  {
    slug: 'monitors',
    name: 'Monitory',
    tagline: 'Monitory przemysłowe',
    description: 'Wyświetlacze przeznaczone do pracy w automatach i kioskach.',
    productCount: 0,
    image: PRODUCT_IMAGE,
  },
  {
    slug: 'pc',
    name: 'Komputery PC',
    tagline: 'Komputery przemysłowe',
    description: 'Komputery i kontrolery przeznaczone do zastosowań przemysłowych.',
    productCount: 0,
    image: PRODUCT_IMAGE,
  },
  {
    slug: 'coin-acceptors',
    name: 'Akceptory monet',
    tagline: 'Precyzyjna weryfikacja monet',
    description: 'Akceptory, walidatory i zmieniacze monet.',
    productCount: 0,
    image: PRODUCT_IMAGE,
  },
  {
    slug: 'scanners',
    name: 'Skanery',
    tagline: 'Skanery kodów kreskowych i QR',
    description: 'Skanery do kiosków, automatów i systemów samoobsługowych.',
    productCount: 0,
    image: PRODUCT_IMAGE,
  },
  {
    slug: 'flippers',
    name: 'Flippery',
    tagline: 'Mechanizmy sterujące',
    description: 'Komponenty i mechanizmy typu flipper.',
    productCount: 0,
    image: PRODUCT_IMAGE,
  },
  {
    slug: 'buttons',
    name: 'Przyciski',
    tagline: 'Przyciski przemysłowe',
    description: 'Przyciski sterujące i podświetlane do kiosków oraz automatów.',
    productCount: 0,
    image: PRODUCT_IMAGE,
  },
  {
    slug: 'touch-screens',
    name: 'Ekrany dotykowe',
    tagline: 'Panele dotykowe',
    description: 'Panele dotykowe i nakładki dotykowe do monitorów.',
    productCount: 0,
    image: PRODUCT_IMAGE,
  },
  {
    slug: 'cabinet-parts',
    name: 'Części do obudów',
    tagline: 'Elementy konstrukcyjne',
    description: 'Elementy montażowe i części do obudów automatów oraz kiosków.',
    productCount: 0,
    image: PRODUCT_IMAGE,
  },
  {
    slug: 'locks',
    name: 'Zamki',
    tagline: 'Zabezpieczenia',
    description: 'Zamki mechaniczne i elektroniczne do automatów oraz kiosków.',
    productCount: 0,
    image: PRODUCT_IMAGE,
  },
  {
    slug: 'power-supplies',
    name: 'Zasilacze',
    tagline: 'Stabilne zasilanie',
    description: 'Zasilacze przemysłowe i moduły zasilające.',
    productCount: 0,
    image: PRODUCT_IMAGE,
  },
  {
    slug: 'cabinets',
    name: 'Obudowy',
    tagline: 'Obudowy kioskowe',
    description: 'Gotowe obudowy i konstrukcje do kiosków oraz urządzeń samoobsługowych.',
    productCount: 0,
    image: PRODUCT_IMAGE,
  },
]

/* ------------------------------------------------------------------------ */
/* Products                                                                  */
/* ------------------------------------------------------------------------ */

const defaultDescription = [
  'Engineered for demanding unattended environments, this unit delivers class-leading acceptance rates while rejecting counterfeit and damaged media with multi-spectral optical sensing.',
  'Installation is straightforward thanks to the industry-standard mounting footprint and configurable interface protocols. Firmware and currency tables can be updated in the field via USB or the free configuration suite, keeping your fleet current without removing devices from service.',
  'Every unit is bench-tested before dispatch from our Bratislava warehouse and covered by a 24-month manufacturer warranty with local service support.',
]

const defaultFeatures = [
  'Multi-spectral counterfeit detection',
  'Field-updatable firmware and currency sets',
  'Industry-standard mounting footprint',
  'MDB, ccTALK, Pulse and RS-232 interfaces',
  '24-month warranty with local service',
]

export const products: Product[] = [
  {
    id: 1,
    slug: 'jcm-uba-10-bill-validator',
    name: 'JCM UBA-10 Bill Validator',
    brand: 'JCM Global',
    sku: 'JCM-UBA10-EU',
    categorySlug: 'bill-acceptors',
    price: 396,
    oldPrice: 449,
    lowestPriceNote: 429,
    badge: 'bestseller',
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'The industry benchmark banknote validator with 500-note stacker, anti-stringing mechanism and best-in-class acceptance across EUR denominations.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Acceptance rate', value: '98% or better, first insertion' },
      { label: 'Stacker capacity', value: '500 notes, lockable cash box' },
      { label: 'Validation speed', value: '~2.4 s per note' },
      { label: 'Interfaces', value: 'ccTALK, MDB, Pulse, RS-232' },
      { label: 'Supply voltage', value: '12 V DC ± 5%' },
      { label: 'Operating temperature', value: '−10 °C to +60 °C' },
      { label: 'Dimensions (W×H×D)', value: '104 × 275 × 158 mm' },
      { label: 'Weight', value: '1.9 kg' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 2,
    slug: 'jcm-ivizion-100',
    name: 'JCM iVIZION-100',
    brand: 'JCM Global',
    sku: 'JCM-IVZ100-EU',
    categorySlug: 'bill-acceptors',
    price: 612,
    badge: 'new',
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'Next-generation validator with full-note imaging, encrypted communications and the fastest note-to-note cycle time in its class.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Acceptance rate', value: '99% first insertion' },
      { label: 'Stacker capacity', value: '700 notes' },
      { label: 'Validation speed', value: '~1.8 s per note' },
      { label: 'Interfaces', value: 'USB 2.0, ccTALK, ID-003' },
      { label: 'Supply voltage', value: '12–24 V DC' },
      { label: 'Dimensions (W×H×D)', value: '110 × 289 × 164 mm' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 3,
    slug: 'ict-xba-10-banknote-acceptor',
    name: 'ICT XBA-10 Banknote Acceptor',
    brand: 'ICT',
    sku: 'ICT-XBA10',
    categorySlug: 'bill-acceptors',
    price: 289,
    oldPrice: 335,
    lowestPriceNote: 319,
    badge: 'sale',
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'Compact, cost-effective validator ideal for kiosks and amusement machines. Quick-release note path for tool-free cleaning.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Acceptance rate', value: '96% first insertion' },
      { label: 'Stacker capacity', value: '300 notes' },
      { label: 'Interfaces', value: 'Pulse, RS-232, ccTALK' },
      { label: 'Supply voltage', value: '12 V DC' },
      { label: 'Dimensions (W×H×D)', value: '99 × 240 × 140 mm' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 4,
    slug: 'cpi-cashflow-sc83-recycler',
    name: 'CPI CashFlow SC83 Note Recycler',
    brand: 'Crane Payment Innovations',
    sku: 'CPI-SC83-R',
    categorySlug: 'bill-acceptors',
    price: 1240,
    inStock: false,
    badge: 'bestseller',
    leadTime: 'Back in stock in ~2 weeks',
    excerpt:
      'Recycling validator that pays change from accepted notes — cuts float requirements by up to 60% in high-turnover locations.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Recycler capacity', value: '2 × 60 notes + 1000-note cashbox' },
      { label: 'Acceptance rate', value: '98% first insertion' },
      { label: 'Interfaces', value: 'MDB, ccTALK, USB' },
      { label: 'Supply voltage', value: '24 V DC' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 5,
    slug: 'nri-g13-mft-coin-validator',
    name: 'NRI G-13.mft Coin Validator',
    brand: 'Crane NRI',
    sku: 'NRI-G13MFT',
    categorySlug: 'coin-acceptors',
    price: 168,
    badge: 'bestseller',
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'The most widely deployed electronic coin validator in Europe — 16 programmable coin channels with token support.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Coin channels', value: '16, freely programmable' },
      { label: 'Coin diameter', value: '15.0 – 31.5 mm' },
      { label: 'Validation speed', value: 'Up to 2 coins/second' },
      { label: 'Interfaces', value: 'Parallel, Binary, ccTALK' },
      { label: 'Supply voltage', value: '12 V DC' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 6,
    slug: 'nri-currenza-c2-changer',
    name: 'NRI currenza c² Coin Changer',
    brand: 'Crane NRI',
    sku: 'NRI-CURC2',
    categorySlug: 'coin-acceptors',
    price: 486,
    oldPrice: 540,
    lowestPriceNote: 522,
    badge: 'sale',
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'Six-tube coin changer with intelligent float management and the fastest payout in vending. MDB plug-and-play.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Payout tubes', value: '6, self-configuring' },
      { label: 'Tube capacity', value: 'Up to 470 coins' },
      { label: 'Interfaces', value: 'MDB, Executive' },
      { label: 'Supply voltage', value: '24 V DC (MDB)' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 7,
    slug: 'azkoyen-x6-coin-selector',
    name: 'Azkoyen X6 Coin Selector',
    brand: 'Azkoyen',
    sku: 'AZK-X6',
    categorySlug: 'coin-acceptors',
    price: 142,
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'Six-channel electronic selector with anti-fraud rejection lever and self-diagnostics. A workhorse for amusement cabinets.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Coin channels', value: '6 programmable' },
      { label: 'Coin diameter', value: '16 – 28 mm' },
      { label: 'Interfaces', value: 'Parallel, ccTALK' },
      { label: 'Supply voltage', value: '12 V DC' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 8,
    slug: 'comestero-rm5-hd-coin-acceptor',
    name: 'Comestero RM5 HD Coin Acceptor',
    brand: 'Comestero',
    sku: 'CMS-RM5HD',
    categorySlug: 'coin-acceptors',
    price: 119,
    badge: 'new',
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'Heavy-duty evolution of the classic RM5 with reinforced front plate and improved discrimination for worn coins.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Coin channels', value: '12 programmable' },
      { label: 'Coin diameter', value: '16 – 30 mm' },
      { label: 'Interfaces', value: 'Parallel, Timer, ccTALK' },
      { label: 'Supply voltage', value: '12 V DC' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 9,
    slug: 'elo-1590l-open-frame-monitor',
    name: 'ELO 1590L 15″ Open-Frame Monitor',
    brand: 'Elo Touch Solutions',
    sku: 'ELO-1590L',
    categorySlug: 'monitors',
    price: 428,
    badge: 'bestseller',
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'Compact open-frame touch monitor with IntelliTouch surface acoustic wave technology, built for 50,000-hour continuous duty.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Panel size', value: '15″ (4:3), 1024 × 768' },
      { label: 'Touch technology', value: 'IntelliTouch SAW, single touch' },
      { label: 'Brightness', value: '300 cd/m²' },
      { label: 'Inputs', value: 'VGA, HDMI' },
      { label: 'MTBF', value: '50,000 hours demonstrated' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 10,
    slug: 'utg-215-pcap-touch-monitor',
    name: 'UTG 21.5″ PCAP Touch Monitor',
    brand: 'UT Slovakia',
    sku: 'UTS-M215P',
    categorySlug: 'monitors',
    price: 519,
    oldPrice: 585,
    lowestPriceNote: 559,
    badge: 'sale',
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'Full-HD projected-capacitive monitor with 10-point multitouch and edge-to-edge tempered glass, sized for gaming cabinets.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Panel size', value: '21.5″ (16:9), 1920 × 1080' },
      { label: 'Touch technology', value: 'PCAP, 10-point multitouch' },
      { label: 'Glass', value: '3 mm tempered, anti-glare' },
      { label: 'Inputs', value: 'HDMI, DisplayPort, USB touch' },
      { label: 'Mounting', value: 'VESA 100 × 100' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 11,
    slug: 'utg-27-curved-gaming-display',
    name: 'UTG 27″ Curved Gaming Display',
    brand: 'UT Slovakia',
    sku: 'UTS-M27C',
    categorySlug: 'monitors',
    price: 742,
    badge: 'new',
    inStock: true,
    leadTime: 'Ships in 48 h',
    excerpt:
      'J-curve slot-machine display with 2500R curvature, button-deck cutout options and integrated LED edge lighting.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Panel size', value: '27″ J-curve, 1920 × 1080' },
      { label: 'Curvature', value: '2500R' },
      { label: 'Touch technology', value: 'PCAP, 10-point' },
      { label: 'Extras', value: 'Programmable RGB edge light' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 12,
    slug: 'cube-hopper-mk2',
    name: 'Cube Hopper MK2',
    brand: 'SuzoHapp',
    sku: 'SH-CUBEMK2',
    categorySlug: 'hoppers',
    price: 226,
    badge: 'bestseller',
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'The most compact coin hopper on the market — 1.5 L capacity with optical payout sensor and self-clearing agitation.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Capacity', value: '~800 coins (Ø 24 mm)' },
      { label: 'Payout speed', value: 'Up to 12 coins/second' },
      { label: 'Coin diameter', value: '19 – 32 mm' },
      { label: 'Supply voltage', value: '12/24 V DC' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 13,
    slug: 'azkoyen-u-ii-hopper',
    name: 'Azkoyen Hopper U-II',
    brand: 'Azkoyen',
    sku: 'AZK-UII',
    categorySlug: 'hoppers',
    price: 198,
    oldPrice: 234,
    lowestPriceNote: 219,
    badge: 'sale',
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'Universal high-capacity hopper with quick-change coin discs and jam-free elevator design for change machines.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Capacity', value: '~1400 coins (Ø 23 mm)' },
      { label: 'Payout speed', value: 'Up to 10 coins/second' },
      { label: 'Interfaces', value: 'Parallel, ccTALK' },
      { label: 'Supply voltage', value: '24 V DC' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 14,
    slug: 'nayax-vpos-touch-reader',
    name: 'Nayax VPOS Touch Cashless Reader',
    brand: 'Nayax',
    sku: 'NYX-VPOST',
    categorySlug: 'cashless',
    price: 312,
    badge: 'new',
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'All-in-one EMV cashless reader with 2.4″ touch display, NFC, chip & swipe, plus built-in telemetry and remote management.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Payments', value: 'NFC, EMV chip, magstripe, QR' },
      { label: 'Display', value: '2.4″ colour touch' },
      { label: 'Connectivity', value: '4G LTE, Ethernet, Wi-Fi' },
      { label: 'Interfaces', value: 'MDB, Pulse, RS-232' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 15,
    slug: 'utp-contactless-nfc-module',
    name: 'UTP Contactless NFC Module',
    brand: 'UT Slovakia',
    sku: 'UTS-NFC01',
    categorySlug: 'cashless',
    price: 176,
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'Compact certified NFC tap-to-pay module for retrofitting existing cabinets — accepts cards, phones and wearables.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Payments', value: 'NFC contactless (EMV L1/L2)' },
      { label: 'Certification', value: 'PCI PTS 6.x' },
      { label: 'Interfaces', value: 'MDB, USB' },
      { label: 'Supply voltage', value: '12–24 V DC' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 16,
    slug: 'uba-500-note-stacker-box',
    name: 'UBA 500-Note Stacker Box',
    brand: 'JCM Global',
    sku: 'JCM-STK500',
    categorySlug: 'spare-parts',
    price: 64,
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'Original lockable 500-note cash box for the UBA and iVIZION series, with reinforced latch and anti-fishing shutter.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Capacity', value: '500 notes' },
      { label: 'Compatibility', value: 'UBA-1x, iVIZION series' },
      { label: 'Lock', value: 'High-security barrel lock, 2 keys' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 17,
    slug: 'universal-mdb-cable-harness',
    name: 'Universal MDB Cable Harness',
    brand: 'UT Slovakia',
    sku: 'UTS-MDB-CBL',
    categorySlug: 'spare-parts',
    price: 18,
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'Shielded 1.2 m MDB harness with Molex connectors, compatible with all major validator and changer brands.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Length', value: '1.2 m, shielded' },
      { label: 'Connectors', value: 'Molex Mini-Fit 6-pin' },
    ],
    image: PRODUCT_IMAGE,
  },
  {
    id: 18,
    slug: 'illuminated-bezel-kit-blue',
    name: 'Illuminated Bezel Kit — Blue',
    brand: 'UT Slovakia',
    sku: 'UTS-BZL-BL',
    categorySlug: 'spare-parts',
    price: 42,
    oldPrice: 55,
    lowestPriceNote: 49,
    badge: 'sale',
    inStock: true,
    leadTime: 'Ships in 24 h',
    excerpt:
      'LED-illuminated replacement bezel that guides players to the note entry — direct fit for UBA and XBA validators.',
    description: defaultDescription,
    features: defaultFeatures,
    specs: [
      { label: 'Illumination', value: 'Blue LED, 12 V' },
      { label: 'Compatibility', value: 'JCM UBA, ICT XBA series' },
    ],
    image: PRODUCT_IMAGE,
  },
]

/* ------------------------------------------------------------------------ */
/* Derived collections                                                       */
/* ------------------------------------------------------------------------ */

export const bestsellers = products.filter((p) => p.badge === 'bestseller')
export const promotions = products.filter((p) => p.badge === 'sale')
export const newArrivals = products.filter((p) => p.badge === 'new')

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug)
}

export function getProductsByCategory(slug: string): Product[] {
  return products.filter((p) => p.categorySlug === slug)
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, limit)
}

/* ------------------------------------------------------------------------ */
/* Industries & brands                                                       */
/* ------------------------------------------------------------------------ */

export const industries: Industry[] = [
  {
    slug: 'amusement',
    name: 'Rozrywka i automaty',
    description: 'Salony gier, automaty z nagrodami i automaty do płatności',
  },
  {
    slug: 'vending',
    name: 'Vending i retail',
    description: 'Maszyny vendingowe, kioski i kasy samoobsługowe',
  },
  {
    slug: 'laundry',
    name: 'Myjnie i pralnie',
    description: 'Pralnie samoobsługowe, myjnie samochodowe',
  },
  {
    slug: 'transport',
    name: 'Parkingi i transport',
    description: 'Biletomaty i bramki płatnicze na parkingach',
  },
]

export const brands = [
  'JCM Global',
  'Crane NRI',
  'ICT',
  'Elo Touch',
  'Nayax',
  'Azkoyen',
  'SuzoHapp',
  'Comestero',
]

export const companyStats = [
  { value: '15+', label: 'Years in payment systems' },
  { value: '4 200', label: 'Devices shipped last year' },
  { value: '24 h', label: 'Dispatch from Bratislava' },
  { value: '98%', label: 'Customers order again' },
]
