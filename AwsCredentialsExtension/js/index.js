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
 * @param {GetProfilesResponse} profiles
 */
function buildConfigUI(profiles) {
  const container = document.getElementById("config-container");
  for (const profile of profiles) {
    const appContainer = document.createElement("div");
    appContainer.classList.add("app-container");
    const appNameEl = document.createElement("p");
    appNameEl.classList.add("app-name");
    appNameEl.innerText = profile.name;
    appContainer.append(appNameEl);

    for (const p of profile.profiles) {
      const profileConfig = StorageService.getProfileConfigById(p.id);
      const profileContainer = document.createElement("div");
      profileContainer.classList.add("profile-container");

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
      };

      const profileName = document.createElement("p");
      profileName.classList.add("profile-name");
      profileName.innerText = p.name;

      const profileAliasLabel = document.createElement("label");
      profileAliasLabel.classList.add("profile-alias");
      profileAliasLabel.innerText = "Alias";
      const profileAlias = document.createElement("input");
      profileAlias.type = "text";
      profileAlias.value =
        profileConfig?.alias ?? `${profile.searchMetadata.AccountId}_${p.name}`;
      profileAlias.classList.add("profile-alias");
      profileAlias.oninput = () => {
        const config = {
          ...(StorageService.getProfileConfigById(p.id) ?? {}),
          id: p.id,
          alias: profileAlias.value,
        };
        StorageService.putProfileConfig(config);
      };

      profileContainer.append(
        enabledBox,
        profileName,
        profileAliasLabel,
        profileAlias
      );
      appContainer.append(profileContainer);
    }

    container.append(appContainer);
    requestAnimationFrame(configureCollapsableProfiles);
  }
}

function configureCollapsableProfiles() {
  const container = document.getElementById("config-container");
  container.querySelectorAll(".app-container").forEach((app) => {
    const profileContainers = app.querySelectorAll(".profile-container");
    profileContainers.forEach((p) => {
      p.setAttribute("x-open", true);
      p.style.height = `${p.scrollHeight}px`;
    });

    app.querySelector(".app-name").onclick = () => {
      profileContainers.forEach((p) => {
        const isOpen = p.getAttribute("x-open") === "true";
        p.setAttribute("x-open", !isOpen);

        if (isOpen) {
          p.style.height = "0px";
        } else {
          p.style.height = `${p.scrollHeight}px`;
        }
      });
    };
  });
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

function setResultMessage(message) {
  document.getElementById("result-container").innerText = message;
}

function setLoadingMessage() {
  setResultMessage("Loading...");
}

function clearResultMessage() {
  setResultMessage("");
}
