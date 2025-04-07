import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

const isProduction = env.NODE_ENV === 'production';
const isCI = env.CI === 'true'; // Detect GitHub Actions or other CI

const baseFolder =
  env.APPDATA !== undefined && env.APPDATA !== ''
    ? `${env.APPDATA}/ASP.NET/https`
    : `${env.HOME}/.aspnet/https`;

const certificateName = 'myvote.client';
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

// Only attempt to create certificates in dev & not in CI
if (!isProduction && !isCI && (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath))) {
  const result = child_process.spawnSync(
    'dotnet',
    ['dev-certs', 'https', '--export-path', certFilePath, '--format', 'Pem', '--no-password'],
    { stdio: 'inherit' }
  );
  if (result.status !== 0) {
    throw new Error('Could not create certificate.');
  }
}

const target = env.ASPNETCORE_HTTPS_PORT
  ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
  : env.ASPNETCORE_URLS
  ? env.ASPNETCORE_URLS.split(';')[0]
  : 'https://localhost:7054';

export default defineConfig({
  plugins: [plugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '^/weatherforecast': {
        target,
        secure: false,
      },
    },
    port: 5173,
    https: !isProduction && !isCI
      ? {
          key: fs.readFileSync(keyFilePath),
          cert: fs.readFileSync(certFilePath),
        }
      : false,
  },
});
