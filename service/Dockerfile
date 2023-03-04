FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

ENV PORT=80
ENV CREDENTIAL_FILE="aws/credentials"
EXPOSE 80
CMD [ "npm", "start" ]