FROM node:16

ARG NEXT_PUBLIC_INFURA_PROJECT_ID
ARG NEXT_PUBLIC_MARKET_FEE_ADDRESS
ENV NEXT_PUBLIC_MARKET_FEE_ADDRESS=${NEXT_PUBLIC_MARKET_FEE_ADDRESS}
ENV NEXT_PUBLIC_INFURA_PROJECT_ID=${NEXT_PUBLIC_INFURA_PROJECT_ID}

COPY . /usr/app/market
WORKDIR /usr/app/market
RUN npm ci --legacy-peer-deps
RUN npm run build
EXPOSE 80
CMD ["npx", "next", "start", "-p", "80"]
