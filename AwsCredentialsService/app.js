import express from "express";
import cors from "cors";
import { FileBuilder } from "./file-builder.js";
import { getCredentials } from "./get-credentials.js";
import { AwsPortalService } from "./aws-portal-service.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/profiles", async (req, res) => {
  try {
    const awsJwt = req.headers.authorization.split("Bearer ")[1];
    const awsService = new AwsPortalService(awsJwt);
    const apps = await awsService.getAppInstances();
    const instanceWithProfiles = apps.result
      .filter((app) => app.applicationName === "AWS Account")
      .map((r) => {
        return new Promise((resolve, reject) => {
          awsService
            .getAppInstanceProfiles(r.id)
            .then((res) => {
              r.profiles = res.result;
              resolve(r);
            })
            .catch((err) => reject(err));
        });
      });

    const response = await Promise.all(instanceWithProfiles);
    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

app.put("/credentials", async (req, res) => {
  try {
    /**
     * @type {PutCredentialsRequest}
     */
    const creds = req.body;
    const awsJwt = req.headers.authorization.split("Bearer ")[1];
    const awsService = new AwsPortalService(awsJwt);
    const refreshedCredPrms = creds.map(async (c) => {
      try {
        const result = await awsService.getAwsCredentials(
          c.accountId,
          c.roleName
        );
        return { ...result, alias: c.alias };
      } catch (err) {
        throw err;
      }
    });
    const refreshedCreds = await Promise.all(refreshedCredPrms);
    createCredentialFile(
      refreshedCreds.reduce((prev, c) => {
        prev[c.alias] = c;
        return prev;
      }, {})
    );
    res.status(204).end();
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

  fb.build("./aws/credentials");
}

app.listen(process.env.PORT || 8081, () => {
  console.log("listening on: http://localhost:" + (process.env.PORT ?? 8081));
});
