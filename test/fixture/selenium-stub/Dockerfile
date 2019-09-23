FROM node:12.10-slim

WORKDIR /app

ADD package.json /app
RUN set -uex; \
    npm install; \
    rm -rf /root/.npm;

ADD . /app

USER nobody
EXPOSE 4444
CMD ["/usr/bin/node", "/app/index.js"]

