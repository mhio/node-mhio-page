FROM mhart/alpine-node:6.10.2

WORKDIR /app

ADD package.json /app
RUN set -uex; \
    npm install; \
    rm -rf /root/.npm;

ADD . /app

USER nobody
EXPOSE 4444
CMD ["/usr/bin/node", "/app/index.js"]

