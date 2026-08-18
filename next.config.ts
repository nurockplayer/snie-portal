import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  trailingSlash: true,
  experimental: {
    globalNotFound: true,
  },
}

export default nextConfig
