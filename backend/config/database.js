const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'totp_auth.json');

let database = {
  users: [],
  login_history: [],
  nextUserId: 1,
  nextLoginHistoryId: 1,
};

function loadDatabase() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      database = JSON.parse(data);
    } else {
      saveDatabase();
    }
    console.log('✅ Database loaded');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf-8');
  } catch (error) {
    console.error('❌ Save error:', error);
  }
}

loadDatabase();

const db = {
  users: {
    insert: (username, email, password_hash) => {
      const id = database.nextUserId++;
      const user = {
        id,
        username,
        email,
        password_hash,
        totp_secret: null,
        totp_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      database.users.push(user);
      saveDatabase();
      return user;
    },

    findByUsername: (username) => {
      return database.users.find(u => u.username === username) || null;
    },

    findById: (id) => {
      return database.users.find(u => u.id === id) || null;
    },

    updateTOTPSecret: (id, secret) => {
      const user = database.users.find(u => u.id === id);
      if (user) {
        user.totp_secret = secret;
        user.updated_at = new Date().toISOString();
        saveDatabase();
      }
      return user;
    },

    enableTOTP: (id) => {
      const user = database.users.find(u => u.id === id);
      if (user) {
        user.totp_enabled = true;
        user.updated_at = new Date().toISOString();
        saveDatabase();
      }
      return user;
    },

    disableTOTP: (id) => {
      const user = database.users.find(u => u.id === id);
      if (user) {
        user.totp_enabled = false;
        user.totp_secret = null;
        user.updated_at = new Date().toISOString();
        saveDatabase();
      }
      return user;
    },

    getTOTPSecret: (id) => {
      const user = database.users.find(u => u.id === id);
      return user?.totp_secret || null;
    },

    isTOTPEnabled: (id) => {
      const user = database.users.find(u => u.id === id);
      return user?.totp_enabled || false;
    },
  },

  login_history: {
    insert: (user_id, ip_address, success, method) => {
      const id = database.nextLoginHistoryId++;
      const record = {
        id,
        user_id,
        login_time: new Date().toISOString(),
        ip_address,
        success,
        method,
      };
      database.login_history.push(record);
      saveDatabase();
      return record;
    },

    findByUserId: (user_id) => {
      return database.login_history.filter(h => h.user_id === user_id);
    },
  },

  checkUsernameExists: (username) => {
    return database.users.some(u => u.username === username);
  },

  checkEmailExists: (email) => {
    return database.users.some(u => u.email === email);
  },

  getDatabase: () => database,
};

console.log(`📁 Database: ${dbPath}`);

module.exports = db;
