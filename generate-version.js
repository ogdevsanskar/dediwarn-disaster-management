#!/usr/bin/env node

/**
 * Build Version Generator
 * Generates version.json with current build information
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get package.json version
let packageVersion = '1.0.0';
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  packageVersion = packageJson.version;
} catch (error) {
  console.log('Could not read package.json, using default version');
}

// Generate build info
const buildTime = new Date().toISOString();
const buildId = Date.now().toString();
const randomSuffix = Math.random().toString(36).substring(2, 15);
const commitHash = process.env.COMMIT_SHA || process.env.RENDER_GIT_COMMIT || 'unknown';
const renderDeployId = process.env.RENDER_SERVICE_ID || 'local';

const versionInfo = {
  version: `${packageVersion}-${buildId}-${randomSuffix}`,
  buildId: buildId,
  buildTime: buildTime,
  commitHash: commitHash,
  renderDeployId: renderDeployId,
  cacheBuster: `cb-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  features: [
    "Enhanced Navigation System",
    "OpenStreetMap Integration", 
    "Turn-by-turn Navigation",
    "Emergency Resource Discovery",
    "Real-time Hazard Detection",
    "GPS Tracking",
    "CDN Cache Busting",
    "Progressive Web App",
    "Offline Support",
    "Render CDN Bypass"
  ],
  apis: {
    osrm: "https://router.project-osrm.org",
    nominatim: "https://nominatim.openstreetmap.org", 
    overpass: "https://overpass-api.de/api"
  },
  deployment: {
    platform: "Render",
    cachingStrategy: "aggressive-no-cache",
    lastDeployment: buildTime,
    environment: process.env.NODE_ENV || "production",
    region: process.env.RENDER_REGION || "oregon",
    forceNoCacheHeaders: true
  },
  cacheBusting: {
    enabled: true,
    strategy: "render-cdn-bypass",
    maxAge: 0,
    mustRevalidate: true,
    noStore: true,
    cdnBypass: true,
    timestampVersion: buildId
  }
};

// Write to public directory
const publicDir = path.join(__dirname, 'public');
const frontendPublicDir = path.join(__dirname, 'frontend', 'public');

// Ensure directories exist
[publicDir, frontendPublicDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Write version files
const versionJson = JSON.stringify(versionInfo, null, 2);

try {
  fs.writeFileSync(path.join(publicDir, 'version.json'), versionJson);
  console.log('✅ Generated version.json in public/');
} catch (error) {
  console.log('Could not write to public/version.json:', error.message);
}

try {
  fs.writeFileSync(path.join(frontendPublicDir, 'version.json'), versionJson);
  console.log('✅ Generated version.json in frontend/public/');
} catch (error) {
  console.log('Could not write to frontend/public/version.json:', error.message);
}

// Update service worker with version
const swPath = path.join(publicDir, 'sw.js');
const frontendSwPath = path.join(frontendPublicDir, 'sw.js');

[swPath, frontendSwPath].forEach(swFile => {
  if (fs.existsSync(swFile)) {
    try {
      let swContent = fs.readFileSync(swFile, 'utf8');
      
      // Update version in service worker
      swContent = swContent.replace(
        /let APP_VERSION = '[^']*'/,
        `let APP_VERSION = '${packageVersion}-${buildId}'`
      );
      
      fs.writeFileSync(swFile, swContent);
      console.log(`✅ Updated service worker version in ${swFile}`);
    } catch (error) {
      console.log(`Could not update service worker ${swFile}:`, error.message);
    }
  }
});

console.log(`\n🚀 Build version generated: ${packageVersion}-${buildId}`);
console.log(`📅 Build time: ${buildTime}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'production'}`);

export default versionInfo;
