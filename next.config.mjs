/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blob.v0.app',
      },
    ],
    unoptimized: true,
  },
  async rewrites() {
    // Получаем URL бэкенда из переменных окружения или используем localhost
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
