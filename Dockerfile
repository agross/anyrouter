FROM alpine
LABEL name='Meta Router'
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
        supervisor

COPY docker-entypoint /
COPY supervisord.conf /
COPY dnsmasq/*.conf /etc/dnsmasq.d/
COPY app /app

RUN mkdir -p /var/log/supervisord

WORKDIR /app
RUN yarn install
