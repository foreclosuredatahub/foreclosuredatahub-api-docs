import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

// Mintlify's default indexes can use its fallback hostname for a proxied site.
// Generate supported custom files from the same navigation and canonical base.
const config = JSON.parse(await fs.readFile('docs.json', 'utf8'));
const base = config.seo.metatags.canonical.replace(/\/$/, '');
assert.equal(base, 'https://www.foreclosuredatahub.com/docs');
const pages = config.navigation.tabs.flatMap(tab => tab.groups.flatMap(group => group.pages));
const records = await Promise.all(pages.map(async page => {
  const source = await fs.readFile(`${page}.mdx`, 'utf8');
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);
  const field = name => JSON.parse(frontmatter[1].match(new RegExp(`^${name}: (.+)$`, 'm'))[1]);
  return {
    page, title: field('title'), description: field('description'),
    url: page === 'index' ? base : `${base}/${page}`,
    markdown: `${base}/${page}.md`, body: source.slice(frontmatter[0].length).trim(),
  };
}));
const xml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const heading = `# ${config.name}\n\n> ${config.description}\n\n`;
const files = {
  'sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    records.map(record => `  <url><loc>${xml(record.url)}</loc></url>`).join('\n') + '\n</urlset>\n',
  'llms.txt': heading + '## Documentation\n\n' +
    records.map(record => `- [${record.title}](${record.markdown}): ${record.description}`).join('\n') +
    `\n\n## API specification\n\n- [OpenAPI](${base}/${config.api.openapi})\n`,
  'llms-full.txt': heading + records.map(record =>
    `## ${record.title}\n\nSource: ${record.url}\n\n${record.description}\n\n${record.body}`
  ).join('\n\n---\n\n') + '\n',
};
for (const [filename, content] of Object.entries(files)) {
  if (process.argv.includes('--check')) {
    assert.equal(await fs.readFile(filename, 'utf8'), content,
      `${filename} is stale; run npm run generate:indexes`);
  } else {
    await fs.writeFile(filename, content);
  }
}
console.log(`${process.argv.includes('--check') ? 'Checked' : 'Generated'} canonical indexes for ${records.length} pages.`);
