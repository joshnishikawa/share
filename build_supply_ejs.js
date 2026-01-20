const fs = require('fs');
const path = require('path');

const colorableDir = './public/image/colorable';
const outputDir = './views/activities/things/supplies';

// Read all SVG files
const files = fs.readdirSync(colorableDir).filter(f => f.endsWith('.svg'));

console.log(`Found ${files.length} SVG files to process...`);

files.forEach(file => {
  const name = path.basename(file, '.svg');
  const svgContent = fs.readFileSync(path.join(colorableDir, file), 'utf8');
  
  // Remove XML declaration
  const svgWithoutDeclaration = svgContent.replace(/<\?xml[^?]*\?>\s*/g, '');
  
  // Create EJS wrapper
  const ejsContent = `<div class="supply" data-shape="${name}">
  ${svgWithoutDeclaration}</div>
`;
  
  // Write EJS file
  const outputPath = path.join(outputDir, `${name}.ejs`);
  fs.writeFileSync(outputPath, ejsContent);
  console.log(`✓ Generated ${name}.ejs`);
});

console.log(`\nSuccessfully generated ${files.length} EJS files in ${outputDir}`);
