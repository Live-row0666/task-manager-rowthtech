FROM node:20
WORKDIR /app
RUN echo "Copying files...."
COPY . .
WORKDIR /app
RUN npm install
CMD ["npm", "run", "start"]
EXPOSE 9012
