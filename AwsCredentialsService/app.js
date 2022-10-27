const express = require("express");
const cors = require("cors");
const os = require("os");
const { FileBuilder } = require("./file-builder");
const { getCredentials } = require("./get-credentials");

require("dotenv").config();
const app = express();

console.log(process.env.AWS_CREDENTIAL_FILE);

app.use(cors());
app.use(express.json());

app.post("/credentials", async (req, res) => {
  try {
    const creds = req.body;
    createCredentialFile(creds);
    res.status(201).end();
  } catch (e) {
    console.log(e);
    res.status(500).end();
  }
});

function createCredentialFile(creds) {
  const existingCreds = getCredentials();
  const fb = new FileBuilder();

  for (const [profile, credentials] of Object.entries(creds)) {
    delete existingCreds[`[${profile}]`];

    fb.writeLine(`[${profile}]`)
      .writeLine(`aws_access_key_id=${credentials.accessKeyId}`)
      .writeLine(`aws_secret_access_key=${credentials.secretAccessKey}`)
      .writeLine(`aws_session_token=${credentials.sessionToken}`);
  }

  for (const [profileWithBrackets, credString] of Object.entries(
    existingCreds
  )) {
    fb.writeLine(profileWithBrackets).writeLine(credString.trim());
  }

  fb.build(process.env.AWS_CREDENTIAL_FILE.replace("~", os.homedir()));
}

app.listen(8081, () => {
  console.log("listening on: http://localhost:8081");
});
