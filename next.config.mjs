/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // The Benchmarks tab was retired; published medians live on Industry Stats.
    return [
      { source: "/benchmarks", destination: "/stats", permanent: false },
      // The calculator is now part of Step 1 (Your restaurant).
      { source: "/calculator", destination: "/", permanent: false },
    ];
  },
};
export default nextConfig;
