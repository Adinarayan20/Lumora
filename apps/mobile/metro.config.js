const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace root paths
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo workspace
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve symlinks and local workspace package aliases
config.resolver.extraNodeModules = {
  '@lumora/theme': path.resolve(workspaceRoot, 'packages/theme/index.ts'),
  '@lumora/ui': path.resolve(workspaceRoot, 'packages/ui/index.ts'),
  '@lumora/shared': path.resolve(workspaceRoot, 'packages/shared/dist/index.js'),
};

module.exports = config;
