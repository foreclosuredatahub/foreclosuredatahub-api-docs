import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { compile } from '@mdx-js/mdx';
import SwaggerParser from '@apidevtools/swagger-parser';
const config=JSON.parse(await fs.readFile('docs.json','utf8'));
const pages=config.navigation.tabs.flatMap(t=>t.groups.flatMap(g=>g.pages));
const pageSet=new Set(pages);
assert.equal(pageSet.size,pages.length,'Duplicate navigation page');
const api=await SwaggerParser.validate(config.api.openapi);
for(const page of pages){
 const source=await fs.readFile(page+'.mdx','utf8');
 const frontmatter=source.match(/^---\n([\s\S]*?)\n---\n/);
 assert(frontmatter, page+': frontmatter missing');
 const body=source.slice(frontmatter[0].length);
 await compile(body);
 const endpoint=frontmatter[1].match(/openapi: "GET ([^"]+)"/);
 if(endpoint) assert(api.paths[endpoint[1]]?.get,page+': endpoint missing');
 for(const match of body.matchAll(/(?:href="|\]\()\/([^"\s)#]+)(?:#[^"\s)]*)?(?:"|\))/g)){
  assert(pageSet.has(match[1]),page+': broken internal link '+match[1]);
 }
}
for(const asset of [config.logo.light,config.logo.dark,config.favicon]) await fs.access('.'+asset);
assert.equal(config.colors.primary,'#009866');
console.log('Validated '+pages.length+' MDX pages, navigation, brand assets, links, and '+Object.keys(api.paths).length+' API operations.');
