const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Clean up table tags
      if (content.match(/<table className="[^"]*"/)) {
        content = content.replace(/<table className="[^"]*"/g, '<table className="data-table"');
        changed = true;
      }

      // Clean up thead tags - remove all classes
      if (content.match(/<thead[^>]*>/)) {
        content = content.replace(/<thead[^>]*>/g, '<thead>');
        changed = true;
      }

      // Clean up th tags - remove all classes except text-right
      if (content.match(/<th className="[^"]*"/)) {
        content = content.replace(/<th className="([^"]*)"/g, (match, classes) => {
          if (classes.includes('text-right')) {
            return '<th className="text-right"';
          }
          return '<th';
        });
        changed = true;
      }

      // Clean up td tags - remove all classes except text-right
      if (content.match(/<td className="[^"]*"/)) {
        content = content.replace(/<td className="([^"]*)"/g, (match, classes) => {
          if (classes.includes('text-right')) {
            return '<td className="text-right"';
          }
          return '<td';
        });
        changed = true;
      }

      // Clean up tr tags - remove hardcoded borders and hover backgrounds
      if (content.match(/<tr key=\{[^\}]+\} className="[^"]*"/)) {
        content = content.replace(/(<tr key=\{[^\}]+\}) className="[^"]*"/g, '$1');
        changed = true;
      }

      // Remove "border-b border-gray-100" and similar hardcoded "lining" across the app
      if (content.match(/border-b\s+border-[a-z0-9-\/]+/g)) {
        content = content.replace(/border-b\s+border-[a-z0-9-\/]+/g, '');
        changed = true;
      }
      if (content.match(/border-t\s+border-[a-z0-9-\/]+/g)) {
        content = content.replace(/border-t\s+border-[a-z0-9-\/]+/g, '');
        changed = true;
      }
      
      // Remove border from Navbar
      if (content.includes('border-b border-[#F0F0F5]')) {
        content = content.replace('border-b border-[#F0F0F5]', 'shadow-sm');
        changed = true;
      }

      if (changed) {
        // cleanup extra spaces
        content = content.replace(/ \s+/g, ' ');
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir('./app');
processDir('./components');
