# Optimized Dockerfile for pre-built static site
# Build happens in CI (GitHub Actions) for speed and caching
# This image only packages the pre-built files with Caddy
# Build time: ~5-10 seconds (vs minutes with full build)

FROM caddy:2-builder-alpine AS builder
RUN xcaddy build --output /usr/bin/caddy --with golang.org/x/net@v0.63.0

FROM caddy:2-alpine
COPY --from=builder /usr/bin/caddy /usr/bin/caddy

# Copy pre-built static site from build/ directory
COPY build /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 3000
