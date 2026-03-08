import type { RecipeSearch, SuggestedIngredient, ManualSearchResult } from '../types'

export const MOCK_USER = {
  uid: 'mock-user-1',
  email: 'fabrizio@example.com',
  displayName: 'Fabrizio',
  photoURL: null,
}

export const MOCK_PRODUCTS_RAMEN = {
  'whole-milk': {
    tesco: [
      { id: 'p1', supermarket: 'tesco' as const, name: 'Tesco Fresh Milk 2 Litre', price: 1.89, priceText: '€1.89', unitPrice: '€0.95/litre', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/250005606', available: true },
      { id: 'p2', supermarket: 'tesco' as const, name: 'Avonmore Whole Milk 2 Litre', price: 2.19, priceText: '€2.19', unitPrice: '€1.10/litre', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/250004694', available: true },
    ],
    supervalu: [
      { id: 'p3', supermarket: 'supervalu' as const, name: 'SuperValu Fresh Whole Milk 2L', price: 2.35, priceText: '€2.35', unitPrice: '€1.18/litre', imageUrl: null, productUrl: 'https://shop.supervalu.ie/shopping/dairy-milk-eggs-whole-supervalu-fresh-2-litre-/p-1025460000', available: true },
      { id: 'p3b', supermarket: 'supervalu' as const, name: 'Dawn Ballinahina Full Fat Milk 2L', price: 2.19, priceText: '€2.19', unitPrice: '€1.10/litre', imageUrl: null, productUrl: 'https://shop.supervalu.ie/shopping/dairy-milk-eggs-whole-dawn-ballinahina-full-fat-2-litre-/p-1017748000', available: true },
    ],
    dunnes: [
      { id: 'p4', supermarket: 'dunnes' as const, name: 'Dunnes Stores Irish Whole Milk 1 Litre', price: 1.25, priceText: '€1.25', unitPrice: '€1.25/litre', imageUrl: null, productUrl: 'https://www.dunnesstoresgrocery.com/product/dunnes-stores-irish-whole-milk-1-litre-100806906', available: true },
    ],
    aldi: [
      { id: 'p4b', supermarket: 'aldi' as const, name: 'Clonbawn Whole Milk 1.75L', price: 1.59, priceText: '€1.59', unitPrice: '€0.91/litre', imageUrl: null, productUrl: 'https://www.aldi.ie/product/clonbawn-whole-milk-1-75l-000000000000422116', available: true },
    ],
    lidl: [
      { id: 'p5', supermarket: 'lidl' as const, name: 'Coolree Whole Milk 2L', price: 1.49, priceText: '€1.49', unitPrice: '€0.75/litre', imageUrl: null, productUrl: 'https://www.lidl.ie/h/eggs-staple-foods/h10071045', available: true },
    ],
  },
}

export const MOCK_RECIPE_SEARCHES: RecipeSearch[] = [
  {
    id: 'group-1',
    recipeName: 'Ramen',
    activePills: ['gluten-free', 'high-protein'],
    keywords: ['chicken broth', 'spicy'],
    status: 'done',
    errorMessage: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    ingredients: [
      {
        id: 'ing-1',
        name: 'Chicken breast',
        quantity: '400g',
        notes: 'boneless, skinless',
        searchStatus: 'done',
        source: 'ai',
        selectedProducts: null,
        products: [
          { id: 'p10', supermarket: 'tesco', name: 'Tesco Irish Chicken Breast Fillets 500G', price: 5.49, priceText: '€5.49', unitPrice: '€10.98/kg', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/313963527', available: true },
          { id: 'p10b', supermarket: 'tesco', name: 'Tesco Free Range Irish Chicken Breast Fillets 454G', price: 5.99, priceText: '€5.99', unitPrice: '€13.20/kg', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/314425720', available: true },
          { id: 'p11', supermarket: 'supervalu', name: 'SuperValu Fresh Irish Free Range Chicken Breast Fillets 440G', price: 5.99, priceText: '€5.99', unitPrice: '€13.61/kg', imageUrl: null, productUrl: 'https://shop.supervalu.ie/product/supervalu-fresh-irish-free-range-chicken-breast-fillets-440-g-id-1419610001', available: true },
          { id: 'p12', supermarket: 'dunnes', name: 'Dunnes Stores Irish Chicken Breast Fillets 420G', price: 5.49, priceText: '€5.49', unitPrice: '€13.07/kg', imageUrl: null, productUrl: 'https://www.dunnesstoresgrocery.com/product/dunnes-stores-irish-chicken-breast-fillets-420g-id-100222325', available: true },
          { id: 'p12b', supermarket: 'dunnes', name: 'Manor Farm Fresh Irish Chicken Breast Fillets 450G', price: 5.29, priceText: '€5.29', unitPrice: '€11.76/kg', imageUrl: null, productUrl: 'https://www.dunnesstoresgrocery.com/product/manor-farm-fresh-irish-chicken-breast-fillets-450g-id-100272033', available: true },
          { id: 'p13', supermarket: 'aldi', name: "Butcher's Selection Irish Chicken Breast Fillets", price: 4.49, priceText: '€4.49', unitPrice: '€8.98/kg', imageUrl: null, productUrl: 'https://www.aldi.ie/product/butchers-selection-irish-chicken-breast-fillets-000000000000382272', available: true },
          { id: 'p14', supermarket: 'lidl', name: 'Irish Chicken Breast Fillets', price: 4.29, priceText: '€4.29', unitPrice: '€8.58/kg', imageUrl: null, productUrl: 'https://www.lidl.ie/p/irish-chicken-breast-fillets/p10055430', available: true },
        ],
      },
      {
        id: 'ing-2',
        name: 'Ramen noodles',
        quantity: '200g',
        notes: 'gluten-free if possible',
        searchStatus: 'done',
        source: 'ai',
        selectedProducts: null,
        products: [
          { id: 'p20', supermarket: 'tesco', name: 'itsu Ramen Soba Noodles 200G', price: 2.50, priceText: '€2.50', unitPrice: '€12.50/kg', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/315164364', available: true },
          { id: 'p20b', supermarket: 'tesco', name: 'Yutaka Soba Noodles 250G', price: 2.29, priceText: '€2.29', unitPrice: '€9.16/kg', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/272855073', available: true },
          { id: 'p21', supermarket: 'supervalu', name: 'Hakubaku Organic Ramen Noodles 270G', price: 2.99, priceText: '€2.99', unitPrice: '€11.07/kg', imageUrl: null, productUrl: 'https://shop.supervalu.ie/product/hakubaku-organic-ramen-noodles-270-g-id-1360340000', available: true },
          { id: 'p22', supermarket: 'dunnes', name: 'Soba Noodles 250G', price: 1.99, priceText: '€1.99', unitPrice: '€7.96/kg', imageUrl: null, productUrl: 'https://www.dunnesstoresgrocery.com/product/soba-noodles-250g-id-100287475', available: true },
        ],
      },
      {
        id: 'ing-3',
        name: 'Ramen broth',
        quantity: '500ml',
        notes: 'miso or chicken ramen base',
        searchStatus: 'done',
        source: 'ai',
        selectedProducts: null,
        products: [
          { id: 'p30', supermarket: 'tesco', name: 'itsu Brilliant Broth Chicken Ramen 500ml', price: 2.99, priceText: '€2.99', unitPrice: '€5.98/litre', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/315157131', available: true },
          { id: 'p30b', supermarket: 'tesco', name: 'itsu Brilliant Broth Classic Ramen 500ml', price: 2.99, priceText: '€2.99', unitPrice: '€5.98/litre', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/315165150', available: true },
          { id: 'p30c', supermarket: 'tesco', name: 'Tesco Miso Ramen Flavour Kit 40G', price: 1.49, priceText: '€1.49', unitPrice: '€37.25/kg', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/322145797', available: true },
          { id: 'p31', supermarket: 'supervalu', name: 'Hikari Miso Miso Soup 3 Pack 20G', price: 1.99, priceText: '€1.99', unitPrice: '€99.50/kg', imageUrl: null, productUrl: 'https://shop.supervalu.ie/product/hikari-miso-miso-soup-3-pack-20-g-id-1766335000', available: true },
        ],
      },
      {
        id: 'ing-4',
        name: 'Soy sauce',
        quantity: '3 tbsp',
        notes: 'gluten-free tamari soy sauce',
        searchStatus: 'done',
        source: 'manual',
        selectedProducts: null,
        products: [
          { id: 'p40', supermarket: 'tesco', name: 'Kikkoman Tamari Gluten Free Soy Sauce 250ml', price: 3.49, priceText: '€3.49', unitPrice: '€13.96/litre', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/276783813', available: true },
        ],
      },
    ],
  },
  {
    id: 'group-2',
    recipeName: 'Pasta Carbonara',
    activePills: [],
    keywords: ['pancetta'],
    status: 'searching',
    errorMessage: null,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    ingredients: [
      {
        id: 'ing-5',
        name: 'Spaghetti',
        quantity: '400g',
        notes: '',
        searchStatus: 'done',
        source: 'ai',
        selectedProducts: null,
        products: [
          { id: 'p50', supermarket: 'tesco', name: 'Napolina Spaghetti 500G', price: 1.29, priceText: '€1.29', unitPrice: '€2.58/kg', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/308113228', available: true },
          { id: 'p50b', supermarket: 'tesco', name: 'Barilla Spaghetti 500G', price: 1.39, priceText: '€1.39', unitPrice: '€2.78/kg', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/284182493', available: true },
          { id: 'p51', supermarket: 'supervalu', name: 'SuperValu Wholegrain Spaghetti 500G', price: 1.29, priceText: '€1.29', unitPrice: '€2.58/kg', imageUrl: null, productUrl: 'https://shop.supervalu.ie/shopping/food-cupboard-pasta-supervalu-spaghetti-whole-wheat-500-g-/p-1528214000', available: true },
          { id: 'p52', supermarket: 'dunnes', name: 'Dunnes Stores Spaghetti 500G', price: 0.89, priceText: '€0.89', unitPrice: '€1.78/kg', imageUrl: null, productUrl: 'https://www.dunnesstoresgrocery.com/product/dunnes-stores-spaghetti-500g-id-100884813', available: true },
          { id: 'p53', supermarket: 'aldi', name: 'Free From Gluten Free Spaghetti 500G', price: 1.49, priceText: '€1.49', unitPrice: '€2.98/kg', imageUrl: null, productUrl: 'https://www.aldi.ie/product/free-from-glutenfree-spaghetti-000000000337329001', available: true },
          { id: 'p54', supermarket: 'lidl', name: 'Baresa Spaghetti 500G', price: 0.89, priceText: '€0.89', unitPrice: '€1.78/kg', imageUrl: null, productUrl: 'https://www.lidl.ie/en/p/product-recommendation/spaghetti/p12609', available: true },
        ],
      },
      {
        id: 'ing-6',
        name: 'Pancetta',
        quantity: '150g',
        notes: '',
        searchStatus: 'done',
        source: 'ai',
        selectedProducts: null,
        products: [
          { id: 'p60', supermarket: 'tesco', name: 'Tesco Smoked Pancetta 2 x 65G', price: 2.99, priceText: '€2.99', unitPrice: '€23.00/kg', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/268334344', available: true },
          { id: 'p60b', supermarket: 'tesco', name: 'Tesco Finest Smoked Pancetta Slices 110G', price: 2.49, priceText: '€2.49', unitPrice: '€22.64/kg', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/266520697', available: true },
          { id: 'p61', supermarket: 'dunnes', name: 'Dunnes Stores Simply Better Italian Pancetta Arrotolata 80G', price: 3.49, priceText: '€3.49', unitPrice: '€43.63/kg', imageUrl: null, productUrl: 'https://www.dunnesstoresgrocery.com/product/dunnes-stores-simply-better-italian-pancetta-arrotolata-80g-100272830', available: true },
        ],
      },
      {
        id: 'ing-7',
        name: 'Eggs',
        quantity: '4 large',
        notes: 'free-range',
        searchStatus: 'done',
        source: 'ai',
        selectedProducts: null,
        products: [
          { id: 'p70', supermarket: 'tesco', name: 'Tesco Free Range Eggs Large 6 Pack', price: 2.29, priceText: '€2.29', unitPrice: '€0.38 each', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/252807478', available: true },
          { id: 'p70b', supermarket: 'tesco', name: 'Tesco Free Range Eggs Large Box of 12', price: 3.99, priceText: '€3.99', unitPrice: '€0.33 each', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/260300783', available: true },
          { id: 'p71', supermarket: 'supervalu', name: 'SuperValu Free Range Medium Eggs 6 Pack', price: 2.49, priceText: '€2.49', unitPrice: '€0.42 each', imageUrl: null, productUrl: 'https://shop.supervalu.ie/product/supervalu-free-range-medium-eggs-6-piece-1026381000', available: true },
          { id: 'p71b', supermarket: 'supervalu', name: 'SuperValu Free Range Large Eggs 12 Pack', price: 4.49, priceText: '€4.49', unitPrice: '€0.37 each', imageUrl: null, productUrl: 'https://shop.supervalu.ie/product/supervalu-free-range-large-eggs-12-piece-1600350000', available: true },
          { id: 'p72', supermarket: 'dunnes', name: 'Dunnes Stores 6 Large Fresh Irish Free Range Eggs', price: 2.19, priceText: '€2.19', unitPrice: '€0.37 each', imageUrl: null, productUrl: 'https://www.dunnesstoresgrocery.com/product/dunnes-stores-6-large-fresh-irish-free-range-eggs-100130759', available: true },
          { id: 'p73', supermarket: 'aldi', name: "Healy's Farm Free Range Eggs 6 Pack", price: 1.99, priceText: '€1.99', unitPrice: '€0.33 each', imageUrl: null, productUrl: 'https://www.aldi.ie/product/healy-s-farm-6-free-range-eggs-000000000000423736', available: true },
        ],
      },
    ],
  },
  {
    id: 'group-3',
    recipeName: 'Beef Stew',
    activePills: ['organic', 'grass-fed'],
    keywords: [],
    status: 'error',
    errorMessage: 'Product search timed out. Try searching again.',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    ingredients: [],
  },
]

export const MOCK_SUGGESTED_INGREDIENTS: SuggestedIngredient[] = [
  { name: 'Whole milk', quantity: '500ml', notes: '' },
  { name: 'Unsalted butter', quantity: '100g', notes: '' },
  { name: 'Plain flour', quantity: '250g', notes: '' },
  { name: 'Free-range eggs', quantity: '3 large', notes: 'free-range preferred' },
  { name: 'Caster sugar', quantity: '200g', notes: '' },
  { name: 'Vanilla extract', quantity: '1 tsp', notes: '' },
  { name: 'Baking powder', quantity: '2 tsp', notes: '' },
]

export const MOCK_MANUAL_SEARCH_RESULTS: ManualSearchResult[] = [
  {
    supermarket: 'tesco',
    status: 'ok',
    products: [
      { id: 'ms1', supermarket: 'tesco', name: 'Tesco Fresh Milk 2 Litre', price: 1.89, priceText: '€1.89', unitPrice: '€0.95/litre', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/250005606', available: true },
      { id: 'ms2', supermarket: 'tesco', name: 'Avonmore Whole Milk 2 Litre', price: 2.19, priceText: '€2.19', unitPrice: '€1.10/litre', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/250004694', available: true },
      { id: 'ms2b', supermarket: 'tesco', name: 'Premier Milk 2 Litre', price: 1.99, priceText: '€1.99', unitPrice: '€1.00/litre', imageUrl: null, productUrl: 'https://www.tesco.ie/groceries/en-IE/products/250004728', available: true },
    ],
  },
  {
    supermarket: 'supervalu',
    status: 'ok',
    products: [
      { id: 'ms4', supermarket: 'supervalu', name: 'SuperValu Fresh Whole Milk 2L', price: 2.35, priceText: '€2.35', unitPrice: '€1.18/litre', imageUrl: null, productUrl: 'https://shop.supervalu.ie/shopping/dairy-milk-eggs-whole-supervalu-fresh-2-litre-/p-1025460000', available: true },
      { id: 'ms5', supermarket: 'supervalu', name: 'Dawn Ballinahina Full Fat Milk 2L', price: 2.19, priceText: '€2.19', unitPrice: '€1.10/litre', imageUrl: null, productUrl: 'https://shop.supervalu.ie/shopping/dairy-milk-eggs-whole-dawn-ballinahina-full-fat-2-litre-/p-1017748000', available: true },
    ],
  },
  {
    supermarket: 'dunnes',
    status: 'ok',
    products: [
      { id: 'ms6', supermarket: 'dunnes', name: 'Dunnes Stores Irish Whole Milk 1 Litre', price: 1.25, priceText: '€1.25', unitPrice: '€1.25/litre', imageUrl: null, productUrl: 'https://www.dunnesstoresgrocery.com/product/dunnes-stores-irish-whole-milk-1-litre-100806906', available: true },
    ],
  },
  {
    supermarket: 'aldi',
    status: 'ok',
    products: [
      { id: 'ms7', supermarket: 'aldi', name: 'Clonbawn Whole Milk 1.75L', price: 1.59, priceText: '€1.59', unitPrice: '€0.91/litre', imageUrl: null, productUrl: 'https://www.aldi.ie/product/clonbawn-whole-milk-1-75l-000000000000422116', available: true },
    ],
  },
  {
    supermarket: 'lidl',
    status: 'ok',
    products: [
      { id: 'ms8', supermarket: 'lidl', name: 'Coolree Whole Milk 2L', price: 1.49, priceText: '€1.49', unitPrice: '€0.75/litre', imageUrl: null, productUrl: 'https://www.lidl.ie/h/eggs-staple-foods/h10071045', available: true },
    ],
  },
]

// Pre-generated supermarket search URLs for a given ingredient name
export function supermarketSearchUrls(ingredientName: string): Record<string, string> {
  const q = encodeURIComponent(ingredientName)
  return {
    tesco: `https://www.tesco.ie/groceries/en-IE/search?query=${q}`,
    supervalu: `https://shop.supervalu.ie/results?q=${q}`,
    dunnes: `https://www.dunnesstoresgrocery.com/sm/delivery/rsid/258/results?q=${q}`,
    aldi: `https://www.aldi.ie/search?q=${q}`,
    lidl: `https://www.lidl.ie/search?q=${q}`,
  }
}
