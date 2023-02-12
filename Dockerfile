FROM node
COPY . /app
WORKDIR /app
CMD npm install 
CMD sudo systemctl start mysql
CMD CREATE DATABASE trell_shop_db
CMD node index.js



FROM mcr.microsoft.com/mssql/server:2017-latest
ARG SA_PASSWORD="Password1!"
ENV SA_PASSWORD=$SA_PASSWORD
ENV ACCEPT_EULA="Y"

EXPOSE 1433
