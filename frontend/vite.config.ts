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
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunks
          "react-core": ["react", "react-dom"],
          "react-router": ["react-router-dom"],

          // UI component libraries
          "ui-radix": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
          ],
          "ui-icons": ["lucide-react"],

          // Utility libraries
          "utils-core": ["clsx", "class-variance-authority", "tailwind-merge"],
          "utils-api": ["axios"],

          // Feature-based chunks
          "testing": ["@/lib/testing"],
          "workspace": ["@/components/workspace", "@/lib/response"],
          "modals": ["@/components/modals"],
          "import": ["@/utils/import"],

          // Development/Analysis chunks
          "console": ["@/lib/console"],
          "testing-framework": ["@/lib/testing"],
        },
      },
    },
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
      // Mitigate GHSA-93m4-6634-74q7: Restrict file system access
      strict: true,
      allow: [".."], // Only allow parent directory access
      deny: [".env", ".env.*", "*.{crt,key,pem}", "**/.git/**"],
    },
    headers: {
      // Security headers
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    },
  },
  preview: {
    host: true,
    port: 3000,
    headers: {
      // Security headers for preview
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    },
  },
})
