# Compliance API

The **Compliance API** checks webpage content against a given policy using Hugging Face's Zero-Shot Classification model. Built with **Node.js** (v21.7), **NestJS**, and **Puppeteer**, it scrapes webpage content and processes it to detect compliance with provided policy rules. The application is containerized for easy deployment with Docker.

## Prerequisites

- **Docker** (latest version)
- **Node.js** (v21.7 or later)
- **npm** (latest version)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/sanyam0550/compliance-api.git
    cd compliance-api
    ```

2. Install the project dependencies:

    ```bash
    npm install
    ```

3. Build the project:

    ```bash
    npm run build
    ```

## Running with Docker

You can build and run the application using Docker:

1. Build the Docker image:

    ```bash
    docker build -t compliance-api .
    ```

2. Run the Docker container:

    ```bash
    docker run -p 3000:3000 --name compliance-api compliance-api
    ```

Alternatively, you can use the provided `start.sh` script to build and run the Docker container:

1. Make the script executable:

    ```bash
    chmod +x start.sh
    ```

2. Run the script:

    ```bash
    ./start.sh
    ```

The API will be available at `http://localhost:3000`.

## API Endpoints

- **POST** `/compliance/validate`

This endpoint accepts a webpage URL and a policy URL as input and checks the webpage content for compliance with the provided policy.

### Example Request:

```json
curl --location 'http://localhost:3000/compliance/validate' \
--header 'Content-Type: application/json' \
--data '{
    "webpageUrl": "https://mercury.com/",
    "policyUrl": "https://stripe.com/docs/treasury/marketing-treasury"
}'


