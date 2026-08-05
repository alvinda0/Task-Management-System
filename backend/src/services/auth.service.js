const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRepository = require("../repositories/user.repository");

async function register(data) {
  const { name, email, password } = data;

  if (!name || !email || !password) {
    throw new Error("Name, email, dan password wajib diisi");
  }

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userId = await userRepository.createUser({
    name,
    email,
    password: hashedPassword,
  });

  return {
    id: userId,
    name,
    email,
  };
}

async function login(data) {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new Error("Email atau password salah");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Email atau password salah");
  }

  return jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
}

module.exports = {
  register,
  login,
};