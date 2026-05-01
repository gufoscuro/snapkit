### Build stage
FROM node:20-slim AS build
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

### Runtime stage — only ship what's needed
FROM node:20-slim
LABEL org.opencontainers.image.source="https://github.com/moddopro/app"
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
