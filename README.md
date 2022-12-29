# Pre-requisites

- Install Docker
- Install Google Chrome

# Setup

1. Open the env file and set the correct path to your .aws folder.
2. In your terminal execute: `docker-compose build`
3. Then: `docker-compose up -d` (This spins up a container. If you want to stop it you can run `docker-compose down --remove-orphans`)
4. Open your Chrome browser and navigate to [chrome://extensions/](chrome://extensions/)
5. On the top right of your screen toggle on "Developer mode".
6. On the top left of your screen click the "Load unpacked" button and navigate to/select the `AwsCredentialsExtension` sub folder in this project.
7. You should now see the "Aws Credentials Extension" under your extensions in Chrome. Feel free to pin it to your task bar.
8. Navigate to your aws app login (should be somethingl like: https://\*.awsapps.com/start#/), open the extension and click the "Refresh x AWS Credentials" button. That's it!
