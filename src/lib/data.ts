import type { Product, CategoryInfo } from "@/types";

export const categories: CategoryInfo[] = [
  {
    id: "women-ethnic",
    name: "Women's Ethnic",
    slug: "women-ethnic",
    description: "Exquisite salwar suits, lehengas & more",
    image: "/categories/women-ethnic.jpg",
    productCount: 156,
  },
  {
    id: "kurtis",
    name: "Kurtis & Kurtas",
    slug: "kurtis",
    description: "Daily wear and festive kurtis",
    image: "/categories/women-ethnic.jpg",
    productCount: 45,
  },
  {
    id: "lehengas",
    name: "Lehengas & Cholis",
    slug: "lehengas",
    description: "Bridal and party wear lehengas",
    image: "/categories/women-ethnic.jpg",
    productCount: 23,
  },
  {
    id: "ethnic-gowns",
    name: "Ethnic Gowns",
    slug: "ethnic-gowns",
    description: "Beautiful flowing ethnic gowns",
    image: "/categories/women-ethnic.jpg",
    productCount: 18,
  },
  {
    id: "dupattas",
    name: "Dupattas & Shawls",
    slug: "dupattas",
    description: "Matching dupattas and wraps",
    image: "/categories/women-ethnic.jpg",
    productCount: 29,
  },
  {
    id: "women-western",
    name: "Women's Western",
    slug: "women-western",
    description: "Trendy dresses, tops & contemporary wear",
    image: "/categories/women-western.jpg",
    productCount: 98,
  },
  {
    id: "dresses",
    name: "Dresses & Maxi",
    slug: "dresses",
    description: "Stylish western dresses",
    image: "/categories/women-western.jpg",
    productCount: 42,
  },
  {
    id: "tops",
    name: "Tops & Tunics",
    slug: "tops",
    description: "Casual and formal tops",
    image: "/categories/women-western.jpg",
    productCount: 36,
  },
  {
    id: "coord-sets",
    name: "Co-ord Sets",
    slug: "coord-sets",
    description: "Matching top and bottom sets",
    image: "/categories/women-western.jpg",
    productCount: 15,
  },
  {
    id: "fabrics-cotton",
    name: "Cotton Fabrics",
    slug: "fabrics-cotton",
    description: "Premium pure cotton materials",
    image: "/categories/fabrics.jpg",
    productCount: 85,
  },
  {
    id: "fabrics-silk",
    name: "Silk Fabrics",
    slug: "fabrics-silk",
    description: "Luxurious silk materials",
    image: "/categories/fabrics.jpg",
    productCount: 65,
  },
  {
    id: "unstitched",
    name: "Unstitched Dress Materials",
    slug: "unstitched",
    description: "Dress materials & unstitched fabric sets",
    image: "/categories/unstitched.jpg",
    productCount: 132,
  },
];

export const products: Product[] = [
  {
    "id": "1",
    "name": "The Riviera Striped Tunic",
    "slug": "the-riviera-striped-tunic-2078",
    "description": "Handwoven Banarasi silk saree with intricate zari work. This magnificent piece features traditional motifs woven with pure gold zari thread on a rich emerald green silk base. Perfect for weddings, festivals, and special occasions. Comes with matching blouse piece.",
    "shortDescription": "Handwoven Banarasi silk with pure gold zari work",
    "category": "[\"tops\"]",
    "subcategory": "sarees",
    "gender": "women",
    "type": "readymade",
    "basePrice": 499,
    "salePrice": 399.2,
    "discountPercent": 20,
    "isOnSale": false,
    "isFreeDelivery": true,
    "fabric": "silk",
    "fabricDetails": null,
    "occasion": [
      "Wedding",
      "Festival",
      "Party"
    ],
    "tags": [
      "banarasi",
      "silk",
      "saree",
      "zari",
      "handwoven",
      "premium"
    ],
    "rating": 4.3,
    "reviewCount": 82,
    "isFeatured": true,
    "isNewArrival": true,
    "isBestseller": false,
    "isActive": true,
    "isReturnable": true,
    "createdAt": "2026-07-29T10:50:43.566Z",
    "variants": [
      {
        "id": "1-v1",
        "sku": "RKF-BSS-001-GRN",
        "size": "S",
        "color": "Gray",
        "colorHex": "#aa9374",
        "price": 1299,
        "salePrice": 1039.2,
        "stock": 2,
        "productId": "1"
      },
      {
        "id": "1-v2",
        "sku": "RKF-BSS-001-MAR",
        "size": "M",
        "color": "Gray",
        "colorHex": "#aa9374",
        "price": 1299,
        "salePrice": 1039.2,
        "stock": 5,
        "productId": "1"
      },
      {
        "id": "1-v3",
        "sku": "RKF-BSS-001-NAV",
        "size": "L",
        "color": "Gray",
        "colorHex": "#aa9374",
        "price": 1299,
        "salePrice": 1039.2,
        "stock": 3,
        "productId": "1"
      },
      {
        "id": "cmrt015di000ba0ngappledy2",
        "sku": "VAR-305910",
        "size": "XL",
        "color": "Gray",
        "colorHex": "#aa9374",
        "price": 1299,
        "salePrice": 1039.2,
        "stock": 4,
        "productId": "1"
      },
      {
        "id": "cmrt0bygc000da0ngmlrh2uk1",
        "sku": "VAR-810156",
        "size": "XS",
        "color": "Gray",
        "colorHex": "#aa9374",
        "price": 1299,
        "salePrice": 1039.2,
        "stock": 5,
        "productId": "1"
      }
    ],
    "images": [
      {
        "id": "cmrteipr00013a0ng27lzpqsb",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784562638/rk-fabrics/products/ij7zyin2dqn5zcrpvh9u.jpg",
        "alt": "blob",
        "isPrimary": false,
        "productId": "1"
      },
      {
        "id": "cmrtejb8q0017a0ng8dqdli0q",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784562664/rk-fabrics/products/zw8vdqcxyyg7dokyuzit.jpg",
        "alt": "blob",
        "isPrimary": false,
        "productId": "1"
      },
      {
        "id": "cmrteishi0015a0nggcozbvyv",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784562642/rk-fabrics/products/jsq3w7ywphhkxjqpnf9u.jpg",
        "alt": "blob",
        "isPrimary": true,
        "productId": "1"
      }
    ],
    "reviews": []
  },
  {
    "id": "cmrtex4wp0000cyygm2lwgihs",
    "name": "Solid Ivory Long Sleeve Ruffled Maxi Dress",
    "slug": "solid-ivory-long-sleeve-ruffled-maxi-dress-6612",
    "description": "New product description",
    "shortDescription": "Short description",
    "category": "[\"dresses\"]",
    "subcategory": null,
    "gender": "women",
    "type": "readymade",
    "basePrice": 399,
    "salePrice": 339.15,
    "discountPercent": 15,
    "isOnSale": false,
    "isFreeDelivery": true,
    "fabric": "cotton",
    "fabricDetails": null,
    "occasion": [],
    "tags": [],
    "rating": 3.7,
    "reviewCount": 173,
    "isFeatured": true,
    "isNewArrival": true,
    "isBestseller": false,
    "isActive": true,
    "isReturnable": true,
    "createdAt": "2026-07-29T10:50:44.999Z",
    "variants": [
      {
        "id": "cmrteydt10003cyygmiugpmrf",
        "sku": "VAR-371108",
        "size": "M",
        "color": "Beige",
        "colorHex": "#F5F4F0",
        "price": 399,
        "salePrice": 339.15,
        "stock": 2,
        "productId": "cmrtex4wp0000cyygm2lwgihs"
      },
      {
        "id": "cmrteydt20005cyygqqx3vvev",
        "sku": "VAR-371110",
        "size": "XL",
        "color": "Beige",
        "colorHex": "#F5F4F0",
        "price": 399,
        "salePrice": 339.15,
        "stock": 2,
        "productId": "cmrtex4wp0000cyygm2lwgihs"
      },
      {
        "id": "cmrtf1c4n000lcyygmgprjcsm",
        "sku": "VAR-508902",
        "size": "L",
        "color": "Beige",
        "colorHex": "#F5F4F0",
        "price": 399,
        "salePrice": 339.15,
        "stock": 2,
        "productId": "cmrtex4wp0000cyygm2lwgihs"
      },
      {
        "id": "cmrtex4wp0001cyygi2cg840o",
        "sku": "SOLID-IVORY-LONG-SLEEVE-RUFFLED-MAXI-DRESS-2920-01",
        "size": "S",
        "color": "Beige",
        "colorHex": "#F5F4F0",
        "price": 349,
        "salePrice": 296.65,
        "stock": 4,
        "productId": "cmrtex4wp0000cyygm2lwgihs"
      }
    ],
    "images": [
      {
        "id": "cmrtfwtsv00032o7lnjklzsgl",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784564975/rk-fabrics/products/if6mv9l6lli0m6xi9j3z.jpg",
        "alt": "Gemini_Generated_Image_4okpdd4okpdd4okp.png",
        "isPrimary": false,
        "productId": "cmrtex4wp0000cyygm2lwgihs"
      },
      {
        "id": "cmrtfwtsw00052o7l6fyf7ixo",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784564976/rk-fabrics/products/pjwrf3lkizlgg59zjs9q.jpg",
        "alt": "Gemini_Generated_Image_owupo1owupo1owup.png",
        "isPrimary": false,
        "productId": "cmrtex4wp0000cyygm2lwgihs"
      },
      {
        "id": "cmru6vfle0001ybi5fe31tgt6",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784610263/rk-fabrics/products/jk0kp6dhbgrjr1sk72z4.jpg",
        "alt": "Gemini_Generated_Image_ck2ks1ck2ks1ck2k.png",
        "isPrimary": false,
        "productId": "cmrtex4wp0000cyygm2lwgihs"
      },
      {
        "id": "cmryxu9hb000cvw6qfa5qi6ia",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784897419/rk-fabrics/products/xrjfowldspzj0atlfxtn.jpg",
        "alt": "Gemini_Generated_Image_4okpdd4okpdd4okp.png",
        "isPrimary": false,
        "productId": "cmrtex4wp0000cyygm2lwgihs"
      },
      {
        "id": "cmrtfwtst00012o7ljlk1fu4i",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784564973/rk-fabrics/products/we47etmugcph6nicty4l.jpg",
        "alt": "Gemini_Generated_Image_3gdwad3gdwad3gdw.png",
        "isPrimary": true,
        "productId": "cmrtex4wp0000cyygm2lwgihs"
      }
    ],
    "reviews": []
  },
  {
    "id": "12",
    "name": "A-Line Kurti — Meadow Bloom",
    "slug": "a-line-kurti-meadow-bloom-0396",
    "description": "Cheerful A-line cotton kurti with digital floral print and mirror work accents. The flattering silhouette, three-quarter sleeves, and mandarin collar make it a versatile piece for daily wear and casual outings. Machine washable.",
    "shortDescription": "Digital print cotton kurti with mirror work",
    "category": "[\"womens-kurtis\"]",
    "subcategory": "kurtis",
    "gender": "women",
    "type": "readymade",
    "basePrice": 1299,
    "salePrice": 779.4,
    "discountPercent": 40,
    "isOnSale": false,
    "isFreeDelivery": true,
    "fabric": "Cotton",
    "fabricDetails": null,
    "occasion": [
      "Daily Wear",
      "Casual",
      "College"
    ],
    "tags": [
      "kurti",
      "a-line",
      "cotton",
      "casual",
      "daily-wear",
      "floral"
    ],
    "rating": 5,
    "reviewCount": 89,
    "isFeatured": true,
    "isNewArrival": true,
    "isBestseller": false,
    "isActive": true,
    "isReturnable": true,
    "createdAt": "2026-07-29T10:50:47.905Z",
    "variants": [
      {
        "id": "12-v2",
        "sku": "RKF-ALK-012-YLW-M",
        "size": "S",
        "color": "Green",
        "colorHex": "#3d573e",
        "price": 1299,
        "salePrice": 779.4,
        "stock": 5,
        "productId": "12"
      },
      {
        "id": "12-v3",
        "sku": "RKF-ALK-012-YLW-L",
        "size": "M",
        "color": "Green",
        "colorHex": "#3d573e",
        "price": 1299,
        "salePrice": 779.4,
        "stock": 5,
        "productId": "12"
      },
      {
        "id": "12-v4",
        "sku": "RKF-ALK-012-YLW-XL",
        "size": "L",
        "color": "Green",
        "colorHex": "#3d573e",
        "price": 1299,
        "salePrice": 779.4,
        "stock": 5,
        "productId": "12"
      },
      {
        "id": "cmrrx78rc000b7qenqy86uqvt",
        "sku": "VAR-085206",
        "size": "XL",
        "color": "Green",
        "colorHex": "#3d573e",
        "price": 1299,
        "salePrice": 779.4,
        "stock": 5,
        "productId": "12"
      },
      {
        "id": "cmrrx8hch000d7qen1cqsmsib",
        "sku": "VAR-142990",
        "size": "XXL",
        "color": "Green",
        "colorHex": "#3d573e",
        "price": 1299,
        "salePrice": 779.4,
        "stock": 7,
        "productId": "12"
      },
      {
        "id": "12-v1",
        "sku": "RKF-ALK-012-YLW-S",
        "size": "XS",
        "color": "Green",
        "colorHex": "#3d573e",
        "price": 1299,
        "salePrice": 779.4,
        "stock": 5,
        "productId": "12"
      }
    ],
    "images": [
      {
        "id": "cmrtg8qio00072o7lll03rceo",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784565519/rk-fabrics/products/m9mznz19qxcsl7md8v6t.jpg",
        "alt": "Gemini_Generated_Image_e68xt6e68xt6e68x.png",
        "isPrimary": false,
        "productId": "12"
      },
      {
        "id": "cmrtg8qip00092o7l1s9otzeu",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784565521/rk-fabrics/products/kbfo6kwlovcl5sapeokf.jpg",
        "alt": "Gemini_Generated_Image_f6qdf9f6qdf9f6qd.png",
        "isPrimary": false,
        "productId": "12"
      },
      {
        "id": "cmrtg8qiq000b2o7lsn5zcuv8",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784565524/rk-fabrics/products/onxrhpzojyvkfj4xrg0r.jpg",
        "alt": "Gemini_Generated_Image_omvf13omvf13omvf.png",
        "isPrimary": false,
        "productId": "12"
      },
      {
        "id": "cmrtg8qiq000d2o7lrki5eipl",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784565526/rk-fabrics/products/bggmb3mniadk901ogevf.jpg",
        "alt": "Gemini_Generated_Image_qlpc6kqlpc6kqlpc.png",
        "isPrimary": false,
        "productId": "12"
      },
      {
        "id": "cmrtg8qir000f2o7lg9f9y13d",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784565532/rk-fabrics/products/mvexvsawgp7rcwguxz0m.jpg",
        "alt": "Gemini_Generated_Image_tqm9sctqm9sctqm9.png",
        "isPrimary": false,
        "productId": "12"
      }
    ],
    "reviews": []
  },
  {
    "id": "10",
    "name": "Ochre & Blue Mixed Stripe Button-Down Shirt",
    "slug": "ochre-blue-mixed-stripe-button-down-shirt-0770",
    "description": "Breathtaking designer lehenga in dusty rose with heavy hand-embroidered florals using zardozi, sequins, and pearl work. The flared cancan lehenga paired with a fitted blouse and sheer net dupatta creates a bridal-worthy ensemble. Handcrafted by our master artisans.",
    "shortDescription": "Zardozi hand-embroidered designer lehenga set",
    "category": "[\"tops\"]",
    "subcategory": "lehengas",
    "gender": "women",
    "type": "readymade",
    "basePrice": 249,
    "salePrice": 224.1,
    "discountPercent": 10,
    "isOnSale": false,
    "isFreeDelivery": true,
    "fabric": "organza",
    "fabricDetails": null,
    "occasion": [
      "Wedding",
      "Engagement",
      "Reception"
    ],
    "tags": [
      "lehenga",
      "designer",
      "bridal",
      "zardozi",
      "handcrafted",
      "premium"
    ],
    "rating": 5,
    "reviewCount": 1,
    "isFeatured": true,
    "isNewArrival": true,
    "isBestseller": false,
    "isActive": true,
    "isReturnable": true,
    "createdAt": "2026-07-29T10:50:46.471Z",
    "variants": [
      {
        "id": "10-v4",
        "sku": "RKF-DLH-010-SAG-M",
        "size": "XL",
        "color": "Coral",
        "colorHex": "#C49A52",
        "price": 249,
        "salePrice": 224.1,
        "stock": 2,
        "productId": "10"
      },
      {
        "id": "10-v2",
        "sku": "RKF-DLH-010-RSE-M",
        "size": "M",
        "color": "Coral",
        "colorHex": "#C49A52",
        "price": 249,
        "salePrice": 224.1,
        "stock": 4,
        "productId": "10"
      },
      {
        "id": "10-v3",
        "sku": "RKF-DLH-010-RSE-L",
        "size": "L",
        "color": "Coral",
        "colorHex": "#C49A52",
        "price": 249,
        "salePrice": 224.1,
        "stock": 0,
        "productId": "10"
      },
      {
        "id": "10-v1",
        "sku": "RKF-DLH-010-RSE-S",
        "size": "S",
        "color": "Coral",
        "colorHex": "#C49A52",
        "price": 249,
        "salePrice": 224.1,
        "stock": 1,
        "productId": "10"
      }
    ],
    "images": [
      {
        "id": "cmrtdn731000va0ng76mi34tb",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784561168/rk-fabrics/products/yyhgc4bdwy3xvbmqxvja.jpg",
        "alt": "blob",
        "isPrimary": false,
        "productId": "10"
      },
      {
        "id": "cmrtdp876000xa0ng6xpo4thl",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784561263/rk-fabrics/products/kfdwxmmknzeuaawktexq.jpg",
        "alt": "blob",
        "isPrimary": false,
        "productId": "10"
      },
      {
        "id": "cmrtdqn06000za0ng4h91qct0",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784561329/rk-fabrics/products/id4ipaerd99abix7kjfe.jpg",
        "alt": "blob",
        "isPrimary": false,
        "productId": "10"
      },
      {
        "id": "cmrtdsrbw0011a0ng56a8hvhv",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784561427/rk-fabrics/products/jztpjifob52wilurdkbr.jpg",
        "alt": "blob",
        "isPrimary": true,
        "productId": "10"
      }
    ],
    "reviews": []
  },
  {
    "id": "3",
    "name": "Striped Spaghetti Strap Tiered Midi Dress",
    "slug": "striped-spaghetti-strap-tiered-midi-dress-8849",
    "description": "Delicate Chanderi cotton suit set featuring hand-block printed rose motifs with gold accents. Includes kurta, palazzo, and matching dupatta. The semi-sheer Chanderi fabric drapes beautifully, creating an elegant silhouette perfect for festive gatherings.",
    "shortDescription": "Hand-block printed Chanderi cotton 3-piece set",
    "category": "[\"dresses\"]",
    "subcategory": "suits",
    "gender": "women",
    "type": "readymade",
    "basePrice": 999,
    "salePrice": 699.3,
    "discountPercent": 30,
    "isOnSale": false,
    "isFreeDelivery": true,
    "fabric": "chanderi",
    "fabricDetails": null,
    "occasion": [
      "Festival",
      "Casual",
      "Puja"
    ],
    "tags": [
      "chanderi",
      "cotton",
      "suit",
      "block-print",
      "festive"
    ],
    "rating": 4.1,
    "reviewCount": 115,
    "isFeatured": false,
    "isNewArrival": true,
    "isBestseller": false,
    "isActive": true,
    "isReturnable": true,
    "createdAt": "2026-07-29T10:50:42.125Z",
    "variants": [
      {
        "id": "3-v3",
        "sku": "RKF-CCS-003-PNK-L",
        "size": "M",
        "color": "Blue",
        "colorHex": "#4f2fee",
        "price": 499,
        "salePrice": 349.3,
        "stock": 5,
        "productId": "3"
      },
      {
        "id": "3-v5",
        "sku": "RKF-CCS-003-MNT-L",
        "size": "XL",
        "color": "Blue",
        "colorHex": "#4f2fee",
        "price": 499,
        "salePrice": 349.3,
        "stock": 3,
        "productId": "3"
      },
      {
        "id": "3-v4",
        "sku": "RKF-CCS-003-MNT-M",
        "size": "L",
        "color": "Blue",
        "colorHex": "#4f2fee",
        "price": 499,
        "salePrice": 349.3,
        "stock": 4,
        "productId": "3"
      },
      {
        "id": "3-v1",
        "sku": "RKF-CCS-003-PNK-S",
        "size": "XS",
        "color": "Blue",
        "colorHex": "#4f2fee",
        "price": 499,
        "salePrice": 349.3,
        "stock": 3,
        "productId": "3"
      },
      {
        "id": "3-v2",
        "sku": "RKF-CCS-003-PNK-M",
        "size": "S",
        "color": "Blue",
        "colorHex": "#4f2fee",
        "price": 499,
        "salePrice": 349.3,
        "stock": 4,
        "productId": "3"
      }
    ],
    "images": [
      {
        "id": "cmrt2ahvl000ra0ngulah59se",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784542099/rk-fabrics/products/osb4jlokz7kp7rukikq1.jpg",
        "alt": "blob",
        "isPrimary": true,
        "productId": "3"
      },
      {
        "id": "cmrt20gx9000na0ngys9e2d3z",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784541632/rk-fabrics/products/t1hqy27rijd5dwptki2e.jpg",
        "alt": "blob",
        "isPrimary": false,
        "productId": "3"
      },
      {
        "id": "cmrt25twc000pa0ngdkxr43hx",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784541882/rk-fabrics/products/mdrnrvyhgycbr7j3sdc1.jpg",
        "alt": "blob",
        "isPrimary": false,
        "productId": "3"
      },
      {
        "id": "cmrt8x60i000ta0ng6wbo224a",
        "url": "https://res.cloudinary.com/dodcvilgs/image/upload/v1784553235/rk-fabrics/products/qn6xdnihuwsrqtf2nrep.jpg",
        "alt": "blob",
        "isPrimary": false,
        "productId": "3"
      }
    ],
    "reviews": []
  }
];

export function getProductBySlug(slug: string): Product | undefined {
 return products.find((p) => p.slug === slug && p.isActive !== false);
}

export function getProductsByCategory(category: string): Product[] {
 return products.filter((p) => p.category === category && p.isActive !== false);
}

export function getFeaturedProducts(): Product[] {
 return products.filter((p) => p.isFeatured && p.isActive !== false);
}

export function getNewArrivals(): Product[] {
 return products.filter((p) => p.isNewArrival && p.isActive !== false);
}

export function getBestsellers(): Product[] {
 return products.filter((p) => p.isBestseller && p.isActive !== false);
}

export function searchProducts(query: string): Product[] {
 const q = query.toLowerCase();
 return products.filter(
  (p) =>
  p.isActive !== false && (
  p.name.toLowerCase().includes(q) ||
  p.description.toLowerCase().includes(q) ||
  p.tags.some((t) => t.includes(q)) ||
  p.fabric.toLowerCase().includes(q) ||
  p.category.includes(q))
  );
}
