# Lean Node base; no Playwright browsers baked in.
FROM node:20-bookworm

# Create a non-root home and workspace (remoteUser=node is set in devcontainer.json).
WORKDIR /workspace

# XDG + PATH for tidy, cacheable CLI state.
ENV XDG_CONFIG_HOME=/home/node/.config \
    XDG_CACHE_HOME=/home/node/.cache \
    XDG_DATA_HOME=/home/node/.local/share \
    XDG_STATE_HOME=/home/node/.local/state \
    XDG_BIN_HOME=/home/node/.local/bin \
    PNPM_HOME=/home/node/.local/bin \
    PATH=/home/node/.local/bin:/workspace/node_modules/.bin:$PATH

# System deps for Playwright runtime (fonts, libs), but NOT the browsers themselves.
# This keeps the image small and avoids long downloads during build.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates git bash curl unzip \
    libatk1.0-0 libatk-bridge2.0-0 libcups2 libdbus-1-3 libdrm2 \
    libgbm1 libgtk-3-0 libnss3 libxcomposite1 libxdamage1 libxfixes3 \
    libxkbcommon0 libxrandr2 libxss1 libasound2 fonts-liberation

RUN apt-get install -y sudo \
 && rm -rf /var/lib/apt/lists/*

RUN echo "node ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

# Enable corepack and activate pnpm (respects PNPM_HOME/XDG paths).
RUN corepack enable && corepack prepare pnpm@latest --activate

# Pre-create common XDG dirs so they bind cleanly when a host volume is mounted.
RUN mkdir -p /home/node/.config /home/node/.cache /home/node/.local/share \
             /home/node/.local/state /home/node/.local/bin \
 && chown -R node:node /home/node

# Don’t run playwright install here. Browsers will be installed on first use
# into /home/node/.cache/ms-playwright, which is persisted via the devcontainer volume.
# COPY your package files if you want layer-cached deps; optional:
# COPY package.json pnpm-lock.yaml* ./
# RUN pnpm install --frozen-lockfile

# Keep default CMD/ENTRYPOINT; devcontainer will set the workspace and user.
CMD ["sleep", "infinity"]

