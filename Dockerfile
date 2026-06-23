# Build + serve the Stack AI Solutions site on Bun.
# Uses the official Bun image for a deterministic build (no Nixpacks/nixpkgs).
FROM oven/bun:1

WORKDIR /app

# Install dependencies first so this layer caches unless the lockfile changes.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the Vite SPA (tsc -b && vite build → ./dist).
COPY . .
RUN bun run build

ENV NODE_ENV=production

# Railway injects $PORT; server.ts binds 0.0.0.0:$PORT and serves ./dist
# plus the /api/voice-token endpoint.
CMD ["bun", "server.ts"]
