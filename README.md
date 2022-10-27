# Pre-requisites

- Install [https://nodejs.org/en/download/](NodeJS) (My preference is to install and use [https://community.chocolatey.org/packages/nvm](NVM))
- Install Google Chrome

# Setup

1. Copy the .bashrc file in this folder to `C:\Users\[user.account]`
2. In your terminal execute: `npm run build`
3. Then: `npm start` (This starts the node api. If you want to stop it you can run `npm stop`)
4. Open your Chrome browser and navigate to [chrome://extensions/](chrome://extensions/)
5. On the top right of your screen toggle on "Developer mode".
6. On the top left of your screen click the "Load unpacked" button and navigate to/select the `AwsCredentialsExtension` sub folder in this project.
7. You should now see the "Aws Credentials Extension under your extensions in Chrome. Feel free to pin it to your task bar.
8. Navigate to [https://d-90677c91b4.awsapps.com/start#/](https://d-90677c91b4.awsapps.com/start#/), open the extension and click the "Refresh AWS Credentials" button. That's it!
