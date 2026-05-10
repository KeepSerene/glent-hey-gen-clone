/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev", // Allows public samples
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com", // Allows private presigned URLs
      },
    ],
  },
};

export default config;
