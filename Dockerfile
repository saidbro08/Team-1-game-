FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY server ./server
COPY client ./client
COPY consumers ./consumers

ENV PORT=8080
EXPOSE 8080

# BROKER_URL, BROKER_USER and BROKER_PASSWORD are passed at runtime (-e), never baked into the image
CMD ["npm", "run", "server"]
