/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: ".next",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    SESSION_TOKEN: process.env.SESSION_TOKEN,
  },
};

module.exports = nextConfig;
