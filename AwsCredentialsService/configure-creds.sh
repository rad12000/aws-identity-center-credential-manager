#!/bin/bash

aws ecr get-login-password --region us-east-1 --profile dev_access | docker login --username AWS --password-stdin 489561981168.dkr.ecr.us-east-1.amazonaws.com &&
export CODEARTIFACT_AUTH_TOKEN=`aws codeartifact get-authorization-token --domain control4 --domain-owner 367507620554 --query authorizationToken --output text --profile prod_access --region us-east-1` &&
echo $CODEARTIFACT_AUTH_TOKEN