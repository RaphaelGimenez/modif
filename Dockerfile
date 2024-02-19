# nextjs dockerfile with dev step. package manager is pnpm
FROM node:20 as modif-build

WORKDIR /app


RUN apt-get -qq update && \
    apt-get -qq dist-upgrade && \
    apt-get -qq install pdftk && \
    apt-get -qq clean

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install

COPY . .

EXPOSE 3000

RUN pnpm build

CMD pnpm start



