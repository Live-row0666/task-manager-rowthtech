FROM node:20
WORKDIR /app
RUN echo "Copying files...."
COPY . .
WORKDIR /app/
RUN npm install --legacy-peer-deps
CMD ["npm", "run", "start"]
EXPOSE 9013