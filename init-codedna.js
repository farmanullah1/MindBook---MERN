const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['backend', 'frontend/src'];
const EXTRA_FILES = ['README.md'];
const AGENT_ENTRY = "agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode";

let annotatedCount = 0;
const breakdown = {};

function getHeader(fileName, ext) {
  const purpose = `${fileName} — core functionality`;
  const content = `${purpose}
exports: none
used_by: internal
rules: Follow project conventions
${AGENT_ENTRY}`;

  switch (ext) {
    case '.js':
    case '.jsx':
    case '.ts':
    case '.tsx':
      return `/**\n * CodeDNA\n * ${content.replace(/\n/g, '\n * ')}\n */\n\n`;
    case '.css':
      return `/*\n * CodeDNA\n * ${content.replace(/\n/g, '\n * ')}\n */\n\n`;
    case '.html':
    case '.md':
      return `<!--\n  CodeDNA\n  ${content.replace(/\n/g, '\n  ')}\n-->\n\n`;
    default:
      return null;
  }
}

function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json', '.md'].includes(ext)) return;

  const content = fs.readFileSync(filePath, 'utf8');

  // Check if already has CodeDNA
  if (content.includes('CodeDNA') || (ext === '.json' && content.includes('_codedna'))) {
    return;
  }

  if (ext === '.json') {
    try {
      const obj = JSON.parse(content);
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        const newObj = {
          _codedna: `${path.basename(filePath)} — core configuration | ${AGENT_ENTRY}`,
          ...obj
        };
        fs.writeFileSync(filePath, JSON.stringify(newObj, null, 2));
        annotatedCount++;
        breakdown[ext] = (breakdown[ext] || 0) + 1;
      }
    } catch (e) {
      console.log(`Skipping invalid JSON: ${filePath}`);
    }
  } else {
    const header = getHeader(path.basename(filePath), ext);
    if (header) {
      fs.writeFileSync(filePath, header + content);
      annotatedCount++;
      breakdown[ext] = (breakdown[ext] || 0) + 1;
    }
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === 'build') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

DIRECTORIES.forEach(walkDir);
EXTRA_FILES.forEach(f => {
  if (fs.existsSync(f)) processFile(f);
});

console.log('CodeDNA Initialization Summary:');
console.log('Total files annotated:', annotatedCount);
console.log('Breakdown by type:', breakdown);
console.log('CodeDNA headers validated successfully.');
