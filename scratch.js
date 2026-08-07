const fs = require('fs');
let code = fs.readFileSync('src/actions/system.ts', 'utf8');

code = code.replace(/import \{ PRODUCT_CATEGORIES, FABRIC_OPTIONS \} from "@\/lib\/constants";\n/, '');

code = code.replace(
  /export async function saveNavigationLinks\(links: any\) \{/,
  'type LinkItem = { href?: string; label?: string; submenu?: LinkItem[] };\nexport async function saveNavigationLinks(links: LinkItem[]) {'
);
code = code.replace(
  /const findChanges = \(oldArr: any\[\], newArr: any\[\], prefix = "link"\) => \{/,
  'const findChanges = (oldArr: LinkItem[], newArr: LinkItem[], prefix = "link") => {'
);

code = code.replace(
  /export async function saveStoreTaxonomy\(categories: any\[\], fabrics: any\[\]\) \{/,
  'type TaxonomyItem = { label?: string; value?: string };\nexport async function saveStoreTaxonomy(categories: TaxonomyItem[], fabrics: TaxonomyItem[]) {'
);
code = code.replace(
  /const diffTaxonomy = \(oldArr: any\[\], newArr: any\[\], prefix: string\) => \{/,
  'const diffTaxonomy = (oldArr: TaxonomyItem[], newArr: TaxonomyItem[], prefix: string) => {'
);

code = code.replace(
  /export async function saveCompanyProfile\(profileData: any\) \{/,
  'export async function saveCompanyProfile(profileData: Record<string, unknown>) {'
);

code = code.replace(/catch \(error: any\)/g, 'catch (error: unknown)');
code = code.replace(/error: error\.message/g, 'error: error instanceof Error ? error.message : "Unknown error"');

fs.writeFileSync('src/actions/system.ts', code);
console.log("Done");
