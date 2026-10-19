FROM node:20
WORKDIR /app
RUN echo "Copying files...."
COPY . .
WORKDIR /app/
RUN rm -f package-lock.json && npm install --legacy-peer-deps
ENV PORT=9013
CMD ["npm", "run", "start"]
EXPOSE 9013