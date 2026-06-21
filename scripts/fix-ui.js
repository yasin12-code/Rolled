const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? 
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Backgrounds
    content = content.replace(/bg-white/g, 'bg-white dark:bg-gray-900');
    content = content.replace(/bg-gray-50\/50/g, 'bg-gray-50/50 dark:bg-gray-800/50');
    content = content.replace(/bg-gray-50/g, 'bg-gray-50 dark:bg-[#1a1a24]');
    
    // Fix over-replaced
    content = content.replace(/bg-white dark:bg-gray-900\/5/g, 'bg-white/5');
    content = content.replace(/bg-white dark:bg-gray-900\/10/g, 'bg-white/10');
    content = content.replace(/bg-white dark:bg-[#1a1a24]/g, 'bg-white dark:bg-[#1a1a24]'); // already existing ones
    
    // Borders
    content = content.replace(/border-gray-100/g, 'border-gray-100 dark:border-gray-800');
    content = content.replace(/border-gray-200/g, 'border-gray-200 dark:border-white/10');
    
    // Text colors
    content = content.replace(/text-gray-900/g, 'text-gray-900 dark:text-gray-100');
    content = content.replace(/text-gray-700/g, 'text-gray-700 dark:text-gray-300');
    content = content.replace(/text-gray-600/g, 'text-gray-600 dark:text-gray-400');
    content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');

    // Fix double darks (if any were already present)
    content = content.replace(/dark:text-gray-100 dark:text-gray-100/g, 'dark:text-gray-100');
    content = content.replace(/dark:text-gray-300 dark:text-gray-300/g, 'dark:text-gray-300');
    content = content.replace(/dark:text-gray-400 dark:text-gray-400/g, 'dark:text-gray-400');
    content = content.replace(/dark:bg-gray-900 dark:bg-gray-900/g, 'dark:bg-gray-900');
    content = content.replace(/dark:bg-gray-800\/50 dark:bg-gray-800\/50/g, 'dark:bg-gray-800/50');
    content = content.replace(/dark:bg-\[#1a1a24\] dark:bg-\[#1a1a24\]/g, 'dark:bg-[#1a1a24]');
    content = content.replace(/dark:border-gray-800 dark:border-gray-800/g, 'dark:border-gray-800');
    content = content.replace(/dark:border-white\/10 dark:border-white\/10/g, 'dark:border-white/10');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', filePath);
    }
}

walkDir('./app/(dashboard)', processFile);
console.log('Done');
