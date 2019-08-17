FROM node:latest

WORKDIR /app

RUN npm install -g @angular/cli

EXPOSE 5000
COPY ./entrypoint.sh /
CMD [ "bash", "/entrypoint.sh"]
