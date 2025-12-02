import { generateBadge } from "./generator/badge.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function test() {
  console.log("🎨 Generating test badges...\n");

  const logosDir = path.join(__dirname, "../assets/logos");

  const testCases = [
    { text: "TypeScript", color: "#3178C6" },
    {
      text: "Python",
      color: "#3776AB",
      logo: path.join(logosDir, "python/python-no-outline.png"),
    },
    {
      text: "HTML",
      color: "#E34F26",
      logo: path.join(logosDir, "html/html.png"),
    },
    {
      text: "Supabase",
      color: "#34b27b",
      logo: path.join(logosDir, "supabase/supabase-black.png"),
    },
    {
      text: "Tailwind CSS",
      color: "#38bdf8",
      logo: path.join(logosDir, "tailwind/tailwind-black.png"),
    },
    { text: "React", color: "#61DAFB" },
    { text: "Node.js", color: "#339933" },
    { text: "Rust", color: "#CE422B" },
  ];

  const outputDir = path.join(__dirname, "../output");
  await fs.mkdir(outputDir, { recursive: true });

  for (const { text, color, logo } of testCases) {
    try {
      // Generate at 4x scale for visibility
      const badge = await generateBadge({ text, color, scale: 4, logo });
      const filename = `${text.toLowerCase().replace(/\./g, "-")}.png`;
      const outputPath = path.join(outputDir, filename);

      await fs.writeFile(outputPath, badge);
      console.log(`✅ ${text}: ${outputPath}`);
    } catch (error) {
      console.error(`❌ ${text}: ${error}`);
    }
  }

  console.log("\n🎉 Done! Check the output folder.");
}

test();
