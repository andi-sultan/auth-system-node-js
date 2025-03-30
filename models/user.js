const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = {
  async create({ email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(20).toString("hex");

    const result = await pool.query(
      "INSERT INTO users (email, password, verification_token) VALUES ($1, $2, $3) RETURNING *",
      [email, hashedPassword, verificationToken]
    );

    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  async verifyEmail(token) {
    const result = await pool.query(
      "UPDATE users SET verified = true, verification_token = null WHERE verification_token = $1 RETURNING *",
      [token]
    );
    return result.rows[0];
  },

  async setResetToken(email, token, expiry) {
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3",
      [token, expiry, email]
    );
  },

  async resetPassword(token, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      "UPDATE users SET password = $1, reset_token = null, reset_token_expiry = null WHERE reset_token = $2 AND reset_token_expiry > NOW() RETURNING *",
      [hashedPassword, token]
    );
    return result.rows[0];
  },
};

module.exports = User;
