FROM node:12-alpine AS server

WORKDIR /server

RUN apk add \
        --no-cache \
        python \
        make \
        g++

COPY [ "server/package.json", "server/yarn.lock", "./" ]
RUN yarn install \
         --production \
         --frozen-lockfile

COPY server/ .
RUN yarn run build

FROM node:12-alpine AS client

WORKDIR /client

COPY [ "client/package.json", "client/yarn.lock", "./" ]
RUN yarn install \
         --frozen-lockfile

COPY client/ .
RUN yarn run build && \
    yarn run favicon

FROM node:12-alpine
LABEL name='anyrouter'
LABEL version='1.0.0'
LABEL maintainer='Alexander Groß <agross@therightstuff.de>'

# The image is supposed to be used with --net=host, so this will not matter.
EXPOSE 3000

COPY docker-entypoint /

ENV NODE_ENV production

ENTRYPOINT [ "/docker-entypoint" ]
CMD [ "run" ]

HEALTHCHECK --start-period=5s \
            --timeout=2s \
            CMD wget -O /dev/null http://localhost:3000 || exit 1

RUN apk add \
        --no-cache \
        iptables

WORKDIR /app
# Speed up development by building in separate containers.
COPY --from=server [ "/server", "./" ]
COPY --from=client [ "/client/dist", "./client/" ]
