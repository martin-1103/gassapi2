# MCP Linting Issues - Phase 1: Foundation Fix
# Prioritas: Konfigurasi dasar yang harus diperbaiki dulu

## 1. Konfigurasi TypeScript & ESLint (Foundation)
# File: tsconfig.json - Fix module configuration
- Task: Change module from CommonJS to ES2020
- Priority: CRITICAL (menghentikan 1 error)
- Dependencies: None
- Impact: Memperbaiki import.meta error di cli.ts

## 2. Type Safety Configuration
# File: tsconfig.json - Enable strict type checking
- Task: Set noImplicitAny to true
- Priority: HIGH
- Dependencies: Setelah module fix
- Impact: Mengurangi warning @typescript-eslint/no-explicit-any

## 3. ESLint Rules Optimization
# File: .eslintrc.js - Update rules for project needs
- Task: Adjust no-console rule for development vs production
- Priority: MEDIUM
- Dependencies: Setelah logging system decision
- Impact: 247 warning console.log

## 4. Package Scripts Verification
# File: package.json - Ensure all scripts work with new config
- Task: Test build, lint, typecheck scripts
- Priority: MEDIUM
- Dependencies: Setelah tsconfig changes
- Impact: Validasi semua perubahan konfigurasi

## Execution Order:
1. Fix tsconfig.json module → ES2020
2. Update noImplicitAny → true
3. Test all npm scripts
4. Update ESLint configuration jika perlu

## Notes:
- Fase ini harus selesai sebelum code fixes
- Satu error di cli.ts menghentikan kompilasi
- Type safety improvement akan reveal lebih banyak issues