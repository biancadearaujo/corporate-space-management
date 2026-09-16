import type { NextConfig } from 'next';

const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/:path*',
                destination: 'http://localhost:8080/:path*',
            },
        ];
    },
};

export default nextConfig;
