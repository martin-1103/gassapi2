module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
    // Tidak pakai recommended-requiring-type-checking dulu untuk mengurangi noise
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    // Sinkron dengan TypeScript config - ES2022
    ecmaVersion: 2022,
    sourceType: "commonJS", // Sesuaikan dengan tsconfig.json module: CommonJS
    // Tidak pakai project: "./tsconfig.json" dulu untuk mengurangi strictness
  },
  plugins: ["@typescript-eslint"],
  rules: {
    // Console detection - deteksi console.log tapi izinkan console.warn/error
    "no-console": [
      "warn",
      {
        "allow": ["warn", "error", "info"] // Izinkan beberapa console utility
      }
    ],

    // Basic consistency rules - yang penting-penting aja
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"],

    // TypeScript specific rules - lebih relaxed
    "@typescript-eslint/no-explicit-any": "warn", // Hanya warning, tidak error
    "@typescript-eslint/no-unused-vars": [
      "warn", // Turunkan ke warning
      {
        "argsIgnorePattern": "^_", // Izinkan variabel dengan prefix _
        "varsIgnorePattern": "^_"
      }
    ],

    // Code quality rules - yang penting aja
    "@typescript-eslint/explicit-function-return-type": "off", // Sesuai tsconfig.json
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "@typescript-eslint/no-inferrable-types": "off", // Off dulu, terlalu strict

    // Modern JavaScript/TypeScript patterns - opsional, tidak强制
    "@typescript-eslint/prefer-nullish-coalescing": "off", // Off dulu, terlalu banyak changes
    "@typescript-eslint/prefer-optional-chain": "off", // Off dulu, biar gradual adoption

    // Additional rules - lebih relaxed
    "@typescript-eslint/no-non-null-assertion": "warn",
    "curly": "off" // Off dulu, optional
  },
  // Override rules untuk test files dan utils
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.spec.ts"],
      rules: {
        "no-console": "off", // Bebas console.log di test files
        "@typescript-eslint/no-explicit-any": "off", // Lebih fleksibel untuk testing
        "@typescript-eslint/no-unused-vars": "off" // Bebas unused vars di test
      }
    },
    {
      files: ["**/utils/Logger.ts", "**/utils/LoggerTest.ts"],
      rules: {
        "no-console": "off" // Logger boleh pake console
      }
    }
  ],
  ignorePatterns: [
    "dist/",
    "node_modules/",
    "coverage/",
    "**/*.js", // Ignore generated JavaScript files
    "bin/"
  ],
  env: {
    node: true, // Node.js environment
    es2022: true // ES2022 features
  }
};