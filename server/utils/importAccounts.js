const fs = require('fs').promises;
const path = require('path');

async function importAccountsFromTxt(txtFilePath) {
  try {
    const fileContent = await fs.readFile(txtFilePath, 'utf8');
    const accounts = parseTxtContent(fileContent);
    const accountsFile = path.join(__dirname, '..', 'data', 'accounts.json');
    await fs.mkdir(path.dirname(accountsFile), { recursive: true });
    await fs.writeFile(accountsFile, JSON.stringify(accounts, null, 2));
    console.log(`Successfully imported ${accounts.length} accounts`);
    return accounts;
  } catch (error) {
    console.error('Error importing accounts:', error);
    throw error;
  }
}

function parseTxtContent(fileContent) {
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim());
  return lines.map((line, index) => {
    const [email, password] = line.split(':');
    return {
      id: `acc_${Date.now()}_${index}`,
      email: email?.trim() || '',
      password: password?.trim() || '',
      status: 'available',
      createdAt: new Date().toISOString()
    };
  }).filter(acc => acc.email && acc.password);
}

async function importAccountsFromContent(content) {
  const accounts = parseTxtContent(content);
  const accountsFile = path.join(__dirname, '..', 'data', 'accounts.json');
  await fs.mkdir(path.dirname(accountsFile), { recursive: true });
  await fs.writeFile(accountsFile, JSON.stringify(accounts, null, 2));
  console.log(`Successfully imported ${accounts.length} accounts from secret`);
  return accounts;
}

module.exports = { importAccountsFromTxt, importAccountsFromContent };
