require('dotenv').config();
// Если JWT_SECRET не задан — генерируем при старте. Для входа важен только пароль админа.
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = require('crypto').randomBytes(32).toString('hex');
}
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const authRoutes = require('./routes/auth');
const accountsRoutes = require('./routes/accounts');
const { importAccountsFromTxt, importAccountsFromContent } = require('./utils/importAccounts');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);

// Production: serve React build and SPA fallback (for Render / single-server deploy)
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  const clientBuild = path.join(__dirname, '..', 'client', 'build');
  const fsSync = require('fs');
  if (fsSync.existsSync(clientBuild)) {
    app.use(express.static(clientBuild));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuild, 'index.html'));
    });
  }
}

// Initialize data directory
const dataDir = path.join(__dirname, 'data');
const accountsFile = path.join(dataDir, 'accounts.json');

async function initializeData() {
  try {
    await fs.mkdir(dataDir, { recursive: true });

    try {
      await fs.access(accountsFile);
    } catch {
      await fs.writeFile(accountsFile, JSON.stringify([], null, 2));
    }

    // Secret load on Render: if no accounts yet, load from env (file path or base64 content)
    let current = JSON.parse(await fs.readFile(accountsFile, 'utf8'));
    if (current.length === 0) {
      const secretPath = process.env.ACCOUNTS_FILE;
      const secretBase64 = process.env.ACCOUNTS_TXT;
      let loaded = false;
      if (secretPath) {
        try {
          await fs.access(secretPath);
          await importAccountsFromTxt(secretPath);
          loaded = true;
        } catch (e) {
          console.warn('ACCOUNTS_FILE set but file not found or unreadable:', e.message);
        }
      }
      if (!loaded && secretBase64) {
        try {
          const content = Buffer.from(secretBase64, 'base64').toString('utf8');
          await importAccountsFromContent(content);
        } catch (e) {
          console.warn('ACCOUNTS_TXT (base64) failed:', e.message);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

initializeData();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
