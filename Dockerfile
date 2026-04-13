### Build stage
FROM node:20-slim AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN NODE_OPTIONS="--max-old-space-size=3072" npm run build

### Runtime stage — only ship what's needed
FROM node:20-slim
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/build build/
COPY --from=build /usr/src/app/package.json .

# Set up a non-root user
RUN addgroup --gid 1500 moddo && \
    adduser --home /moddo -uid 1500 --gid 1500 moddo && \
    chown moddo:moddo /moddo

USER moddo:moddo

ENV BODY_SIZE_LIMIT=15M

ENTRYPOINT [ "node", "build" ]
