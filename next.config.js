/** @type {import('next').NextConfig} */
const nextConfig = {};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

module.exports = withPWA(nextConfig);
