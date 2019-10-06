FROM alpine

RUN apk add \
        --no-cache \
        iptables \
        dnsmasq

COPY ./docker-entypoint /
COPY dnsmasq/*.conf /etc/dnsmasq.d/

VOLUME [ "/dnsmasq-leases" ]

ENTRYPOINT [ "/docker-entypoint" ]
CMD [ "run" ]
