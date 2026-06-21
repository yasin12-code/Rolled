const fs = require('fs');

const filePath = './app/(dashboard)/designer/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Split at "Live Document Preview"
const splitIndex = content.indexOf('Live Document Preview');
let header = content.substring(0, splitIndex);
let preview = content.substring(splitIndex);

// Remove dark mode classes from preview
preview = preview.replace(/dark:bg-gray-900/g, '');
preview = preview.replace(/dark:bg-gray-800\/50/g, '');
preview = preview.replace(/dark:bg-\[#1a1a24\]/g, '');
preview = preview.replace(/dark:border-gray-800/g, '');
preview = preview.replace(/dark:border-white\/10/g, '');
preview = preview.replace(/dark:text-gray-100/g, '');
preview = preview.replace(/dark:text-gray-300/g, '');
preview = preview.replace(/dark:text-gray-400/g, '');

// Clean up any double spaces left by replacements
preview = preview.replace(/  +/g, ' ');

fs.writeFileSync(filePath, header + preview, 'utf8');

const clientsPath = './app/(dashboard)/clients/page.tsx';
let clientsContent = fs.readFileSync(clientsPath, 'utf8');
clientsContent = clientsContent.replace(
  /className="inline-flex items-center justify-center min-w-6 px-2 h-6 rounded-full bg-gray-100 text-xs font-medium"/g,
  'className="inline-flex items-center justify-center min-w-6 px-2 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-medium"'
);
fs.writeFileSync(clientsPath, clientsContent, 'utf8');

console.log('Fixed designer and clients');
