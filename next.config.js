/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router ya no es experimental en Next.js 14
  output: 'standalone', // Optimización para Vercel
}

module.exports = nextConfig
