const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const accountsFile = path.join(__dirname, '..', 'data', 'accounts.json');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Read accounts from JSON file
async function readAccounts() {
  try {
    const data = await fs.readFile(accountsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write accounts to JSON file
async function writeAccounts(accounts) {
  await fs.writeFile(accountsFile, JSON.stringify(accounts, null, 2));
}

// Get all accounts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const accounts = await readAccounts();
    res.json(accounts);
  } catch (error) {
    console.error('Error reading accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get first available account
router.get('/available', authenticateToken, async (req, res) => {
  try {
    const accounts = await readAccounts();
    const availableAccount = accounts.find(acc => acc.status === 'available');
    
    if (!availableAccount) {
      return res.status(404).json({ error: 'No available accounts found' });
    }

    res.json(availableAccount);
  } catch (error) {
    console.error('Error finding available account:', error);
    res.status(500).json({ error: 'Failed to find available account' });
  }
});

// Update account status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['available', 'used'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "available" or "used"' });
    }

    const accounts = await readAccounts();
    const accountIndex = accounts.findIndex(acc => acc.id === id);

    if (accountIndex === -1) {
      return res.status(404).json({ error: 'Account not found' });
    }

    accounts[accountIndex].status = status;
    await writeAccounts(accounts);

    res.json(accounts[accountIndex]);
  } catch (error) {
    console.error('Error updating account status:', error);
    res.status(500).json({ error: 'Failed to update account status' });
  }
});

// Import accounts from TXT file
router.post('/import', authenticateToken, async (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', '..', filePath);
    const fileContent = await fs.readFile(fullPath, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim());

    const accounts = lines.map((line, index) => {
      const [email, password] = line.split(':');
      return {
        id: `acc_${Date.now()}_${index}`,
        email: email?.trim() || '',
        password: password?.trim() || '',
        status: 'available',
        createdAt: new Date().toISOString()
      };
    }).filter(acc => acc.email && acc.password);

    await writeAccounts(accounts);

    res.json({ 
      message: `Imported ${accounts.length} accounts`,
      count: accounts.length 
    });
  } catch (error) {
    console.error('Error importing accounts:', error);
    res.status(500).json({ error: 'Failed to import accounts' });
  }
});

module.exports = router;
