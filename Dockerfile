FROM alpine
LABEL name='Default gateway switcher'
LABEL version='1.0.0'
LABEL maintainer='Alexander Groß <agross@therightstuff.de>'

# The image is supposed to be used with --net=host, so this will not matter.
EXPOSE 8080

VOLUME [ "/dnsmasq-leases" ]

ENTRYPOINT [ "/docker-entypoint" ]
CMD [ "run" ]

RUN apk add \
        --no-cache \
        iptables \
        \
        dnsmasq \
        \
        nodejs \
        yarn \
        \
        redis \
        \
        supervisor

COPY [ "docker-entypoint", "supervisord/supervisord.conf", "/" ]
COPY dnsmasq/*.conf /etc/dnsmasq.d/
RUN mkdir -p /var/log/supervisord

WORKDIR /app
# Speed up development.
COPY [ "app/package.json", "app/yarn.lock", "./" ]
RUN yarn install

COPY [ "app", "./"]
RUN yarn run build
