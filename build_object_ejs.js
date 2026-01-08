const fs = require('fs');
const path = require('path');

const objectsDir = './public/image/objects';
const outputDir = './views/activities/objects/room';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read all SVG files
const files = fs.readdirSync(objectsDir).filter(f => f.endsWith('.svg'));

console.log(`Found ${files.length} SVG files to process...`);

files.forEach(file => {
  const name = path.basename(file, '.svg');
  const svgContent = fs.readFileSync(path.join(objectsDir, file), 'utf8');
  
  // Remove XML declaration
  const svgWithoutDeclaration = svgContent.replace(/<\?xml[^?]*\?>\s*/g, '');
  
  // Create EJS wrapper
  const ejsContent = `<div class="object" data-shape="${name}">
  ${svgWithoutDeclaration}</div>
`;
  
  // Write EJS file
  const outputPath = path.join(outputDir, `${name}.ejs`);
  fs.writeFileSync(outputPath, ejsContent);
  console.log(`✓ Generated ${name}.ejs`);
});

console.log(`\nSuccessfully generated ${files.length} EJS files in ${outputDir}`);
