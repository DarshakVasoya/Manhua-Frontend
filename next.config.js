/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Allow all i{number}.wp.com hostnames
        hostname: 'i*.wp.com',
        pathname: '/**', // allow all paths
      },
      {
        protocol: 'https',
        hostname: 'kingofshojo.com',
        pathname: '/**', // allow all paths
      },
    ],
  },
};

module.exports = nextConfig;
