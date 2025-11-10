# Optimized Dockerfile for pre-built static site
# Build happens in CI (GitHub Actions) for speed and caching
# This image only packages the pre-built files with Caddy
# Build time: ~5-10 seconds (vs minutes with full build)

FROM caddy:alpine

# Copy pre-built static site from build/ directory
COPY build /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 3000
