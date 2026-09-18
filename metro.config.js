const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The project lives under ~/Documents, which macOS protects: the Watchman daemon gets
// "Operation not permitted" there and Metro crashes in watch mode. Use Metro's built-in
// Node file watcher instead. To use Watchman again, grant it Full Disk Access
// (System Settings > Privacy & Security) or move the repo out of ~/Documents, then remove this.
config.resolver.useWatchman = false;

module.exports = config;
