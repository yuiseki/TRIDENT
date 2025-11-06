FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    python3-pip \
    python3-dev \
    python3-setuptools \
    python3-wheel \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . /app

RUN npm ci

EXPOSE 3000

CMD ["npm", "run", "dev"]
