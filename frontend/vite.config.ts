import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2015",
    minify: "esbuild",
    sourcemap: false,
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       // Core React chunks
    //       "react-core": ["react", "react-dom"],
    //       "react-router": ["react-router-dom"],

    //       // UI component libraries
    //       "ui-radix": [
    //         "@radix-ui/react-accordion",
    //         "@radix-ui/react-dialog",
    //         "@radix-ui/react-dropdown-menu",
    //         "@radix-ui/react-select",
    //         "@radix-ui/react-tabs",
    //         "@radix-ui/react-toast",
    //       ],
    //       "ui-icons": ["lucide-react"],

    //       // Utility libraries
    //       "utils-core": ["clsx", "class-variance-authority", "tailwind-merge"],
    //       "utils-api": ["axios"],
    //     },
    //   },
    // },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "lucide-react",
      "clsx",
      "class-variance-authority",
      "tailwind-merge",
      "axios",
    ],
  },
  server: {
    host: true,
    port: 3000,
    fs: {
      // Mitigate GHSA-93m4-6634-74q7: Enhanced file system access restrictions
      strict: true,
      // Only allow specific directories instead of ".." to prevent backslash bypass
      allow: [
        path.resolve(__dirname, "./src"),
        path.resolve(__dirname, "../backend"),
        path.resolve(__dirname, "../")
      ],
      deny: [
        ".env", ".env.*",
        "*.{crt,key,pem,p12,pfx}",
        "**/.git/**",
        "**/node_modules/**",
        "**/.DS_Store",
        "**/Thumbs.db"
      ],
    },
    headers: {
      // Enhanced security headers
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    },
  },
  preview: {
    host: true,
    port: 3000,
    headers: {
      // Enhanced security headers for preview
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    },
  },
})
