const fs = require("fs");
const os = require("os");

/**
 *
 * @returns {Record<"[profile_name]", string>}
 */
function getCredentials() {
  const credentialsFile = "~/.aws/credentials".replace("~", os.homedir());

  if (!fs.existsSync(credentialsFile)) {
    return {};
  }

  const credentials = fs.readFileSync(credentialsFile, { encoding: "utf8" });

  const profileKeyRegex = /\[.+\]/g;
  const profileBodyRegex = /\[.+\]\s/g;

  const profileKey = credentials.match(profileKeyRegex) ?? [];
  const profileBodies = credentials.split(profileBodyRegex);

  if (profileBodies.findIndex((s) => s === "") === 0) {
    profileBodies.splice(0, 1); // Remove empty string
  }

  const profileMap = profileKey.reduce((prev, current, i) => {
    prev[current] = profileBodies[i];
    return prev;
  }, {});

  return profileMap;
}

module.exports = { getCredentials };
