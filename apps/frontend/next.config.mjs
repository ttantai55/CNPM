/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.VERCEL) return []
    const backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
}

export default nextConfig
