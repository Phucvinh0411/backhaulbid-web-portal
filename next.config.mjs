/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Keep the production build deterministic on the constrained Docker Desktop VM.
  // Next otherwise spawns a worker per CPU and the build daemon can be OOM-killed.
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
