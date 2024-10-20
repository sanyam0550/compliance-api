#!/bin/bash

# Name of the Docker image and container
IMAGE_NAME="compliance-api"
CONTAINER_NAME="compliance-api"
IMAGE_TAG="latest"

# Docker build context
DOCKER_CONTEXT="."

# Port mapping
HOST_PORT=3000
CONTAINER_PORT=3000

# Echo the service name
echo "Building the Docker image for $IMAGE_NAME:$IMAGE_TAG..."

# Check if a container with the same name is already running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Stopping and removing the existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Check if the old image with the 'latest' tag exists
if [ "$(docker images -q $IMAGE_NAME:$IMAGE_TAG)" ]; then
    echo "Removing old image with tag $IMAGE_TAG..."
    docker rmi $IMAGE_NAME:$IMAGE_TAG
fi

# Build the Docker image and tag it as 'latest'
docker build -t $IMAGE_NAME:$IMAGE_TAG $DOCKER_CONTEXT

# Check if the build succeeded
if [ $? -ne 0 ]; then
  echo "Docker build failed! Exiting..."
  exit 1
fi

# Run the new container
echo "Starting the Docker container for $CONTAINER_NAME..."

docker run -d -p $HOST_PORT:$CONTAINER_PORT --name $CONTAINER_NAME $IMAGE_NAME:$IMAGE_TAG

# Check if the container started successfully
if [ $? -ne 0 ]; then
  echo "Failed to start the Docker container! Exiting..."
  exit 1
fi

echo "$CONTAINER_NAME is up and running on port $HOST_PORT!"
