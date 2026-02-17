const fs = require('fs').promises;
const path = require('path');
const { importAccountsFromTxt } = require('../utils/importAccounts');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node importAccounts.js <path-to-txt-file>');
    console.log('Example: node importAccounts.js ../accounts.txt');
    process.exit(1);
  }

  const txtFilePath = path.resolve(args[0]);
  
  try {
    await importAccountsFromTxt(txtFilePath);
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error.message);
    process.exit(1);
  }
}

main();
