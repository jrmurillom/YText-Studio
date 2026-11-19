import pkg from '../../package.json';

/**
 * Single source of truth for the application version.
 * Synchronized with root package.json and src-tauri/tauri.conf.json.
 */
export const APP_VERSION: string = pkg.version;
