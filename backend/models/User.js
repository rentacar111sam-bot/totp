const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static create(username, email, password) {
    try {
      if (db.checkUsernameExists(username)) {
        throw new Error('Username already exists');
      }
      if (db.checkEmailExists(email)) {
        throw new Error('Email already exists');
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = db.users.insert(username, email, hashedPassword);

      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  static findByUsername(username) {
    const user = db.users.findByUsername(username);
    if (!user) return null;

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static findById(userId) {
    const user = db.users.findById(userId);
    if (!user) return null;

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static verifyPassword(username, password) {
    try {
      const user = db.users.findByUsername(username);
      if (!user) {
        return null;
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
      if (!isPasswordValid) {
        return null;
      }

      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  static saveTOTPSecret(userId, secret) {
    const user = db.users.updateTOTPSecret(userId, secret);
    if (!user) return null;

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static enableTOTP(userId) {
    const user = db.users.enableTOTP(userId);
    if (!user) return null;

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static disableTOTP(userId) {
    const user = db.users.disableTOTP(userId);
    if (!user) return null;

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static getTOTPSecret(userId) {
    return db.users.getTOTPSecret(userId);
  }

  static isTOTPEnabled(userId) {
    return db.users.isTOTPEnabled(userId);
  }
}

module.exports = User;
