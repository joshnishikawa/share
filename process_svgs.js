const fs = require('fs');
const path = require('path');

const colorableDir = './public/image/colorable';
const outputFile = './public/javascripts/supplies_svg.js';

// Read all SVG files
const files = fs.readdirSync(colorableDir).filter(f => f.endsWith('.svg'));

let output = `// School supplies SVG definitions
// Auto-generated from /public/image/colorable/*.svg
const SUPPLIES_SVG = {\n`;

files.forEach(file => {
  const name = path.basename(file, '.svg');
  const content = fs.readFileSync(path.join(colorableDir, file), 'utf8');
  
  // Extract just the SVG content, remove XML declaration and clean up
  const svgMatch = content.match(/<svg[\s\S]*<\/svg>/);
  if (svgMatch) {
    let svgContent = svgMatch[0];
    
    // Remove unnecessary attributes for inline use
    svgContent = svgContent
      .replace(/\s+sodipodi:[^=]+=["'][^"']*["']/g, '')
      .replace(/\s+inkscape:[^=]+=["'][^"']*["']/g, '')
      .replace(/\s+xmlns:sodipodi=["'][^"']*["']/g, '')
      .replace(/\s+xmlns:inkscape=["'][^"']*["']/g, '')
      .replace(/\s+xmlns:xlink=["'][^"']*["']/g, '')
      .replace(/\s+xmlns:rdf=["'][^"']*["']/g, '')
      .replace(/\s+xmlns:cc=["'][^"']*["']/g, '')
      .replace(/\s+xmlns:dc=["'][^"']*["']/g, '')
      .replace(/<sodipodi:namedview[\s\S]*?<\/sodipodi:namedview>/g, '')
      .replace(/<metadata[\s\S]*?<\/metadata>/g, '')
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();
    
    // Escape backticks and template literal syntax
    svgContent = svgContent.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    
    output += `  '${name}': \`${svgContent}\`,\n`;
  }
});

output += `};\n`;

fs.writeFileSync(outputFile, output);
console.log(`Generated ${outputFile} with ${files.length} SVG definitions`);
