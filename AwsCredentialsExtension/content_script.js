runIt();

async function runIt() {
  try {
    const [dev_access, prod_access] = await Promise.all([
      getAwsCredentials("489561981168", "Developer"),
      getAwsCredentials("367507620554", "CodeArtifact"),
    ]);

    const response = await fetch("http://localhost:8081/credentials", {
      method: "POST",
      body: JSON.stringify({ dev_access, prod_access }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw "failed!";
    }

    chrome.runtime.sendMessage(undefined, true);
  } catch (e) {
    chrome.runtime.sendMessage(undefined, false);
  }
}

async function getSessionJwt() {
  const cookie = await window.cookieStore.get("x-amz-sso_authn");
  return cookie.value;
}

async function getAwsCredentials(accountId, roleName) {
  const response = await fetch(
    `https://portal.sso.us-east-1.amazonaws.com/federation/credentials/?account_id=${accountId}&role_name=${roleName}&debug=true`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "x-amz-sso_bearer_token": await getSessionJwt(),
      },
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "omit",
    }
  );

  if (!response.ok) {
    throw "Failed!";
  }

  const { roleCredentials } = await response.json();
  return roleCredentials;
}

function elementExists(elFunc, timeout = 5000) {
  return new Promise((resolve, reject) => {
    let elapsedTime = 0;
    const intervalId = setInterval(() => {
      if (elapsedTime >= timeout) {
        clearInterval(intervalId);
        reject("Timeout was reached");
        return;
      }

      const el = elFunc();
      if (el) {
        resolve(el);
        clearInterval(intervalId);
      }

      elapsedTime += 50;
    }, 50);
  });
}
