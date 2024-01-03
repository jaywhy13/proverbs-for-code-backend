FROM node:20.10.0

# Set the working directory in the container to /app
RUN mkdir /app
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install any needed packages
RUN yarn install

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Build the application
RUN yarn build

EXPOSE 3001

# Define the command to run your app using CMD which defines your runtime
CMD ["node", "-r", "./tracing.js", "dist/index.js"]
