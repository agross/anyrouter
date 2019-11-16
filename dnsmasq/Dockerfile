FROM debian
LABEL name='dnsmasq'
LABEL version='1.0.0'
LABEL maintainer='Alexander Groß <agross@therightstuff.de>'

VOLUME [ "/dnsmasq-leases" ]

HEALTHCHECK --start-period=5s \
            --timeout=2s \
            CMD /docker-healthcheck || exit 1

COPY docker-healthcheck /

RUN chmod +x /docker-healthcheck && \
    \
    apt-get update && \
    apt-get install \
            --yes \
            dnsmasq \
            dnsutils \
            locales && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean && \
    echo 'en_US.UTF-8 UTF-8' > /etc/locale.gen && \
    locale-gen && \
    update-locale LANG=en_US.UTF-8

# For IDN domains in config.
ENV LANG=en_US.UTF-8

CMD [ "dnsmasq", "--no-daemon", "--conf-dir=/etc/dnsmasq.d/,*.conf" ]
