FROM node:alpine
WORKDIR /app
ADD package*.json .
ARG NODE_ENV
RUN if [ "$NODE_ENV" -eq "development" ]; then npm install; else npm install --only=production; fi
COPY . .
CMD ["node", "server.js"]