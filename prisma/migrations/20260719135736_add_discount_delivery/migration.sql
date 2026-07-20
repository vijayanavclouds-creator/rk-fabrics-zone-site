-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "gender" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "basePrice" REAL NOT NULL,
    "salePrice" REAL,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "isFreeDelivery" BOOLEAN NOT NULL DEFAULT true,
    "fabric" TEXT NOT NULL,
    "occasion" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "reviewCount" INTEGER NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
    "isBestseller" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Product" ("basePrice", "category", "createdAt", "description", "fabric", "gender", "id", "isBestseller", "isFeatured", "isNewArrival", "name", "occasion", "rating", "reviewCount", "salePrice", "shortDescription", "slug", "subcategory", "tags", "type") SELECT "basePrice", "category", "createdAt", "description", "fabric", "gender", "id", "isBestseller", "isFeatured", "isNewArrival", "name", "occasion", "rating", "reviewCount", "salePrice", "shortDescription", "slug", "subcategory", "tags", "type" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
