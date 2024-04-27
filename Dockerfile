FROM node:18-alpine

WORKDIR /usr/src/server

COPY package*.json ./

RUN npm install

COPY . .

ENTRYPOINT [ "npm", "start" ]