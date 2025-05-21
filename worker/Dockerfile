FROM node:22.15.1-alpine

WORKDIR /app

COPY ../wait-for-it.sh /wait-for-it.sh
COPY ../worker .

RUN npm install

CMD ["sh", "-c", "/wait-for-it.sh rabbitmq:5672 -- node worker.js"]
