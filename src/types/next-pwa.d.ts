declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface RuntimeCaching {
    urlPattern: string | RegExp;
    handler: string;
    options?: Record<string, unknown>;
  }

  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: RuntimeCaching[];
    buildExcludes?: string[];
    publicExcludes?: string[];
    fallbacks?: Record<string, string>;
    cacheOnFrontEndNav?: boolean;
    reloadOnOnline?: boolean;
    swcMinify?: boolean;
    [key: string]: unknown;
  }

  function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}