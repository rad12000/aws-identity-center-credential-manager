document.getElementById("me").onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    handleLoad();
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content_script.js"],
    });
  });
};

chrome.runtime.onMessage.addListener((success) => {
  if (success === true) {
    handleSuccess();
  } else {
    handleFailure();
  }
});

function handleSuccess() {
  document.getElementById("result-container").innerText = "Success!";
}

function handleFailure() {
  document.getElementById("result-container").innerText = "Failed!";
}

function handleLoad() {
  document.getElementById("result-container").innerText = "Loading...";
}
