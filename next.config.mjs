/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ouemiqbpmvbfmtvkmyqe.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Fix X-Content-Type-Options (-5)
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Fix X-Frame-Options (-20)
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Fix Referrer-Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Fix CSP (-25)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://ouemiqbpmvbfmtvkmyqe.supabase.co",
              "font-src 'self'",
              "connect-src 'self' https://ouemiqbpmvbfmtvkmyqe.supabase.co wss://ouemiqbpmvbfmtvkmyqe.supabase.co https://api.fonnte.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Cross Origin Resource Policy
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
          // Cross Origin Opener Policy
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
