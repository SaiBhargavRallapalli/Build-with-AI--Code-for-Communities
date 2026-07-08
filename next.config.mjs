/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // react-leaflet's Leaflet map instance is not safe to re-initialize on the
  // same DOM node, which React 18 Strict Mode's double-invoked effects
  // trigger in dev. Disabling Strict Mode avoids "Map container is already
  // initialized" errors; production builds are unaffected either way.
  reactStrictMode: false,
};

export default nextConfig;
