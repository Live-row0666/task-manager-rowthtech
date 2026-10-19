FROM node:20
WORKDIR /app
RUN echo "Copying files...."
COPY . .
WORKDIR /app
RUN rm -f package-lock.json && npm install
ENV PORT=9012
CMD ["npm", "run", "start"]
EXPOSE 9012
