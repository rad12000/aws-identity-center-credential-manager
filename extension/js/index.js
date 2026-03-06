import { CredentialService } from "./credential-service.js";
import { StorageService } from "./storage-service.js";

document.getElementById("refresh").onclick = refreshAwsCredentials;
init();

async function init() {
  try {
    showLoading(true);
    const cookie = await getSSOCookie();
    const profiles = await CredentialService.getAwsProfiles(cookie);
    showLoading(false);
    buildConfigUI(profiles);
  } catch (e) {
    console.error(e);
    showLoading(false);
    showError(
      "Unable to load accounts. Make sure you\u2019re on your AWS SSO portal and the local server is running."
    );
  }
}

async function refreshAwsCredentials() {
  const btn = document.getElementById("refresh");
  btn.disabled = true;
  btn.querySelector("#refresh-text").innerText = "Refreshing\u2026";
  hideStatus();

  const apps = document.querySelectorAll(".app-container");
  const enabledProfiles = [...apps].flatMap((app) => {
    const profileContainers = [...app.querySelectorAll(".profile-container")];
    const profileData = profileContainers.reduce((prev, profile) => {
      const enabled = profile.querySelector(".profile-enabled").checked;
      if (!enabled) return prev;
      const roleName = profile.querySelector(".profile-name").textContent;
      const alias = profile.querySelector("input.profile-alias").value;
      prev.push({ roleName, alias });
      return prev;
    }, []);

    const accountId = app.getAttribute("data-account-id");
    return profileData.map((d) => ({ ...d, accountId }));
  });

  try {
    await CredentialService.putAwsCredentials(
      await getSSOCookie(),
      enabledProfiles
    );
    showStatus(
      "success",
      `\u2713 Successfully refreshed ${enabledProfiles.length} credential${enabledProfiles.length !== 1 ? "s" : ""}`
    );
  } catch (e) {
    console.error(e);
    showStatus(
      "error",
      "\u2717 Failed to refresh credentials. Check the server logs."
    );
  } finally {
    btn.disabled = false;
    updateRefreshText();
  }
}

/**
 * @param {GetProfilesResponse} accounts
 */
function buildConfigUI(accounts) {
  const container = document.getElementById("config-container");
  container.innerHTML = "";

  accounts.sort((a, b) =>
    a.searchMetadata.AccountName.localeCompare(b.searchMetadata.AccountName)
  );

  for (const account of accounts) {
    const appContainer = document.createElement("details");
    appContainer.classList.add("app-container");
    appContainer.setAttribute(
      "data-account-id",
      account.searchMetadata.AccountId
    );


    // Summary (clickable account header)
    const appNameEl = document.createElement("summary");
    appNameEl.classList.add("app-name");

    const nameLeft = document.createElement("div");
    nameLeft.classList.add("app-name-left");

    const accountLabel = document.createElement("span");
    accountLabel.classList.add("account-label");
    accountLabel.textContent = account.searchMetadata.AccountName;

    const accountIdSpan = document.createElement("span");
    accountIdSpan.classList.add("account-id");
    accountIdSpan.textContent = account.searchMetadata.AccountId;

    nameLeft.append(accountLabel, accountIdSpan);

    // Chevron
    const chevron = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    chevron.classList.add("chevron");
    chevron.setAttribute("viewBox", "0 0 16 16");
    chevron.innerHTML =
      '<path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';

    appNameEl.append(nameLeft, chevron);
    appContainer.append(appNameEl);

    // Profile rows
    for (const p of account.profiles) {
      const profileConfig = StorageService.getProfileConfigById(p.id);
      const profileKey =
        profileConfig?.alias ??
        `${account.searchMetadata.AccountId}_${p.name}`;

      const profileContainer = document.createElement("div");
      profileContainer.classList.add("profile-container");

      // Role name
      const profileName = document.createElement("span");
      profileName.classList.add("profile-name");
      profileName.textContent = p.name;

      // Alias input
      const profileAlias = document.createElement("input");
      profileAlias.type = "text";
      profileAlias.classList.add("profile-alias");
      profileAlias.placeholder = "profile_name";
      profileAlias.value = profileKey;
      profileAlias.oninput = () => {
        const config = {
          ...(StorageService.getProfileConfigById(p.id) ?? {}),
          id: p.id,
          alias: profileAlias.value,
        };
        StorageService.putProfileConfig(config);
      };

      // Help icon with tooltip
      const helpIcon = document.createElement("span");
      helpIcon.classList.add("alias-help");
      helpIcon.setAttribute("data-tooltip",
        "This value becomes the [profile] name in your ~/.aws/credentials file. " +
        "Use it with: aws s3 ls --profile <this value>"
      );
      helpIcon.textContent = "\u24D8";

      // Checkbox
      const enabledBox = document.createElement("input");
      enabledBox.type = "checkbox";
      enabledBox.classList.add("profile-enabled");
      enabledBox.checked = profileConfig?.enabled ?? true;
      enabledBox.title = "Include this role when refreshing";
      enabledBox.onchange = () => {
        const config = {
          ...(StorageService.getProfileConfigById(p.id) ?? {}),
          id: p.id,
          enabled: enabledBox.checked,
        };
        StorageService.putProfileConfig(config);
        updateRefreshText();
      };

      profileContainer.append(profileName, profileAlias, helpIcon, enabledBox);
      appContainer.append(profileContainer);
    }

    container.append(appContainer);
  }

  document.getElementById("select-all-bar").classList.remove("hide");
  document.getElementById("select-all").onchange = (e) => {
    const checked = e.target.checked;
    document.querySelectorAll(".profile-enabled").forEach((cb) => {
      if (cb.checked !== checked) {
        cb.checked = checked;
        cb.dispatchEvent(new Event("change"));
      }
    });
  };
  document.getElementById("footer").classList.remove("hide");
  updateRefreshText();
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

  if (!ssoCookies || ssoCookies.length === 0) {
    throw new Error(
      "SSO cookie not found. Are you logged in to the AWS portal?"
    );
  }

  return ssoCookies[0].value;
}

function updateRefreshText() {
  const allBoxes = [...document.querySelectorAll("input.profile-enabled")];
  const enabledCount = allBoxes.filter((cb) => cb.checked).length;
  const totalCount = allBoxes.length;

  const plural = enabledCount !== 1;
  document.getElementById("refresh-text").innerText =
    `Refresh ${enabledCount} Credential${plural ? "s" : ""}`;
  document.getElementById("refresh").disabled = enabledCount === 0;

  // Sync select-all checkbox
  const selectAll = document.getElementById("select-all");
  if (selectAll) {
    selectAll.checked = enabledCount === totalCount;
    selectAll.indeterminate = enabledCount > 0 && enabledCount < totalCount;
  }
}

function showLoading(visible) {
  document
    .getElementById("loading-container")
    .classList.toggle("hide", !visible);
}

function showError(message) {
  const el = document.getElementById("error-container");
  el.classList.remove("hide");
  document.getElementById("error-text").innerText = message;
}

function showStatus(type, message) {
  const bar = document.getElementById("status-bar");
  bar.classList.remove("hide", "success", "error");
  bar.classList.add(type);
  document.getElementById("status-text").innerText = message;
}

function hideStatus() {
  const bar = document.getElementById("status-bar");
  bar.classList.add("hide");
  bar.classList.remove("success", "error");
}
