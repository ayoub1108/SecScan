
// EXAMPLE: DO NOT USE IN PRODUCTION
// This is a demonstration file showing what NOT to do

const fs = require('fs');
const path = require('path');

// High: Path Traversal vulnerability
function getFile(filename) {
  // Vulnerable to path traversal
  const filePath = './data/' + filename;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    return 'File not found';
  }
}

// The correct way would be:
// function getFileSafe(filename) {
//   // Safe from path traversal
//   const filePath = path.join('./data', path.basename(filename));
//   
//   try {
//     const content = fs.readFileSync(filePath, 'utf8');
//     return content;
//   } catch (error) {
//     return 'File not found';
//   }
// }

module.exports = { getFile };
