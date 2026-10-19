FROM node:20
WORKDIR /app
RUN echo "Copying files...."
COPY . .
WORKDIR /app/
RUN rm -f package-lock.json && npm install --legacy-peer-deps && npm install ajv@^8 ajv-keywords@^5 --legacy-peer-deps
ENV PORT=9015
CMD ["npm", "run", "start"]
EXPOSE 9015
