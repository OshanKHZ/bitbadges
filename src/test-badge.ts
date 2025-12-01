import { generateBadge } from './generator/badge.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function test() {
  console.log('🎨 Generating test badges...\n');

  const testCases = [
    { text: 'TypeScript', color: '#3178C6' },
    { text: 'Python', color: '#3776AB' },
    { text: 'React', color: '#61DAFB' },
    { text: 'Node.js', color: '#339933' },
    { text: 'Rust', color: '#CE422B' },
  ];

  const outputDir = path.join(__dirname, '../output');
  await fs.mkdir(outputDir, { recursive: true });

  for (const { text, color } of testCases) {
    try {
      // Generate at 4x scale for visibility
      const badge = await generateBadge({ text, color, scale: 4 });
      const filename = `${text.toLowerCase().replace(/\./g, '-')}.png`;
      const outputPath = path.join(outputDir, filename);

      await fs.writeFile(outputPath, badge);
      console.log(`✅ ${text}: ${outputPath}`);
    } catch (error) {
      console.error(`❌ ${text}: ${error}`);
    }
  }

  console.log('\n🎉 Done! Check the output folder.');
}

test();
