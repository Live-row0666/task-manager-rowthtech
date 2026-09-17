FROM node:20
WORKDIR /app
RUN echo "Copying files...."
COPY . .
WORKDIR /app/
RUN npm install --force
CMD ["npm", "run", "start"]
EXPOSE 9013