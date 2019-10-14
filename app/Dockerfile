FROM node:alpine AS build

COPY [ "package.json", "yarn.lock", "./" ]
RUN apk add \
        --no-cache \
        python \
        make \
        g++ \
    && yarn install \
            --production \
            --frozen-lockfile

FROM node:alpine
LABEL name='anyrouter'
LABEL version='1.0.0'
LABEL maintainer='Alexander Groß <agross@therightstuff.de>'

# The image is supposed to be used with --net=host, so this will not matter.
EXPOSE 3000

ENTRYPOINT [ "/docker-entypoint" ]
CMD [ "run" ]

HEALTHCHECK --start-period=5s \
            --timeout=2s \
            CMD wget -O /dev/null http://localhost:3000 || exit 1

RUN apk add \
        --no-cache \
        iptables

COPY docker-entypoint /

ENV NODE_ENV production

WORKDIR /app
# Speed up development by installing packages in a separate container.
COPY --from=build [ "node_modules", "./" ]

COPY . .
RUN yarn run build
