import { CredentialService } from "./credential-service.js";
import { StorageService } from "./storage-service.js";

document.getElementById("refresh").onclick = refreshAwsCredentials;
init();

async function init() {
  try {
    setLoadingMessage();
    const cookie = await getSSOCookie();
    const profiles = await CredentialService.getAwsProfiles(cookie);
    buildConfigUI(profiles);
    clearResultMessage();
  } catch (e) {
    console.log(e);
    setResultMessage("An unknown error occurred.");
  }
}

async function refreshAwsCredentials() {
  setLoadingMessage();
  const apps = document.querySelectorAll(".app-container");
  const enabledProfiles = [...apps].flatMap((app) => {
    const profileContainers = [...app.querySelectorAll(".profile-container")];
    const profileData = profileContainers.reduce((prev, profile) => {
      const enabled = profile.querySelector(".profile-enabled").checked;
      if (!enabled) return prev;
      const roleName = profile.querySelector(".profile-name").innerText;
      const alias = profile.querySelector("input.profile-alias").value;
      prev.push({ roleName, alias });
      return prev;
    }, []);

    const accountId = app.querySelector(".app-name").innerText.split(" ")[0];
    return profileData.map((d) => {
      return { ...d, accountId };
    });
  });

  try {
    await CredentialService.putAwsCredentials(
      await getSSOCookie(),
      enabledProfiles
    );
    setResultMessage("Success!");
  } catch (e) {
    console.log(e);
    setResultMessage("An unknown error occurred");
  }
}

/**
 * @param {GetProfilesResponse} accounts
 */
function buildConfigUI(accounts) {
  const container = document.getElementById("config-container");
  accounts.sort((a, b) =>
    a.searchMetadata.AccountName.localeCompare(b.searchMetadata.AccountName)
  );

  for (const account of accounts) {
    const appContainer = document.createElement("details");
    appContainer.classList.add("app-container");

    const appNameEl = document.createElement("summary");
    appNameEl.classList.add("app-name");
    appNameEl.innerHTML = `${account.searchMetadata.AccountName} <span>(${account.searchMetadata.AccountId})</span>`;
    appContainer.append(appNameEl);

    let longestProfileName = 0;
    for (const p of account.profiles) {
      longestProfileName = Math.max(longestProfileName, p.name.length);
    }

    for (const p of account.profiles) {
      const profileConfig = StorageService.getProfileConfigById(p.id);
      const profileContainer = document.createElement("div");
      profileContainer.classList.add("profile-container");

      const profileName = document.createElement("p");
      const spacesToAdd = new Array(longestProfileName - p.name.length)
        .fill("_")
        .join("");
      profileName.classList.add("profile-name");
      profileName.innerHTML = `${p.name}<span class='transparent-text'>${spacesToAdd}</span>`;

      const profileAlias = document.createElement("input");
      profileAlias.placeholder = "profile_name";
      profileAlias.type = "text";
      profileAlias.value =
        profileConfig?.alias ?? `${account.searchMetadata.AccountId}_${p.name}`;
      profileAlias.classList.add("profile-alias");
      profileAlias.oninput = () => {
        const config = {
          ...(StorageService.getProfileConfigById(p.id) ?? {}),
          id: p.id,
          alias: profileAlias.value,
        };
        StorageService.putProfileConfig(config);
      };

      const enabledBox = document.createElement("input");
      enabledBox.type = "checkbox";
      enabledBox.classList.add("profile-enabled");
      enabledBox.checked = profileConfig?.enabled ?? true;
      enabledBox.onchange = () => {
        const config = {
          ...(StorageService.getProfileConfigById(p.id) ?? {}),
          id: p.id,
          enabled: enabledBox.checked,
        };
        StorageService.putProfileConfig(config);
        updateRefreshText();
      };

      profileContainer.append(profileName, profileAlias, enabledBox);
      appContainer.append(profileContainer);
    }

    container.append(appContainer);
    updateRefreshText();
  }
}

function asTableColumn(node) {
  const td = document.createElement("td");
  td.append(node);
  return td;
}

async function getSSOCookie() {
  const focusTab = (
    await chrome.tabs.query({ active: true, currentWindow: true })
  )[0];
  const domain = new URL(focusTab.url).host;
  const ssoCookies = await chrome.cookies.getAll({
    domain,
    name: "x-amz-sso_authn",
  });

  return ssoCookies[0].value;
}

function updateRefreshText() {
  const enabledCount = [
    ...document.querySelectorAll("input.profile-enabled:checked"),
  ].length;

  const plural = enabledCount !== 1;
  document.getElementById(
    "refresh"
  ).innerText = `Refresh ${enabledCount} AWS Credential${plural ? "s" : ""}`;
}

function setResultMessage(message) {
  document.getElementById("refresh").classList.remove("hide");
  document.getElementById("result-container").innerText = message;
}

function setLoadingMessage() {
  document.getElementById("refresh").classList.add("hide");
  document.getElementById("result-container").innerText = "Loading...";
}

function clearResultMessage() {
  setResultMessage("");
}
