FROM alpine
LABEL name='dnsmasq'
LABEL version='1.0.0'
LABEL maintainer='Alexander Groß <agross@therightstuff.de>'

VOLUME [ "/dnsmasq-leases" ]

HEALTHCHECK --start-period=5s \
            --timeout=2s \
            CMD nc 127.0.0.1 53 || exit 1

RUN apk add \
        --no-cache \
        dnsmasq

COPY conf.d/*.conf /etc/dnsmasq.d/

CMD [ "dnsmasq", "--no-daemon" ]
