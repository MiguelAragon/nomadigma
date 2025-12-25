/** @type {import('next').NextConfig} */
const nextConfig = {
	// Enable standalone output for Docker
	output: 'standalone',
	
	// For local development, basePath is '/'
	// This file will be overwritten during deployment with the appropriate basePath
	images: {
		remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hsuxrxebwdweihrgjuth.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
	},
};

export default nextConfig;
