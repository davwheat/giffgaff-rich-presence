const Config = require('../Config/config.json');

module.exports = function DebugLog(message) {
  if (Config.debug) console.log(`[D] ${message}`);
};
