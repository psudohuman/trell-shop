# Use an official Node.js runtime as a parent image
FROM node:14-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the rest of the application files to the working directory
COPY . .

# Install npm dependencies
RUN npm install

# Expose port 3000 for the application to listen on
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]