# Pre-requisites

- Install Docker
- Install Google Chrome
- Add [the extension](https://chrome.google.com/webstore/detail/aws-identity-center-crede/jcjnbobieodcccmlijkjlbielmhhnpff/) to Chrome

# Setup

1. Make sure the volume has the correct path to your `.aws` directory, in the docker-compose.yml file.
2. In your terminal run: `docker-compose build`
3. Then: `docker-compose up -d` (This spins up a container. If you want to stop it you can run `docker-compose down --remove-orphans`)
4. Navigate to your aws identity center start page. (Should be something like: https://\*.awsapps.com/start#/)
5. Open the extension and you should be good to go!

# Developing
To load the unpacked extension for development purposes, do the following:
1. Open your Chrome browser and navigate to [chrome://extensions/](chrome://extensions/)
2. On the top right of your screen toggle on "Developer mode".
3. On the top left of your screen click the "Load unpacked" button and navigate to/select the `AwsCredentialsExtension` sub folder in this project.
4. You should now see the "Aws Credentials Extension" under your extensions in Chrome. Feel free to pin it to your task bar.
5. Navigate to your aws app login (should be somethingl like: https://\*.awsapps.com/start#/), open the extension and click the "Refresh x AWS Credentials" button. That's it!
