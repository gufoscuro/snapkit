FROM node:20-slim
WORKDIR /usr/src/app
COPY . .

# Remove node_modules if the directory exists 
# (avoid issues during local builds)
RUN rm -rf node_modules

RUN npm install
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Set up a non-root user
RUN addgroup --gid 1500 moddo && \
    adduser --home /moddo -uid 1500 --gid 1500 moddo && \
    chown moddo:moddo /moddo

USER moddo:moddo

ENV BODY_SIZE_LIMIT=15M

ENTRYPOINT [ "node", "build" ] 