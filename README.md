# Webhook Proxy

This project is a webhook proxy that receives webhooks, enqueues them, and then processes them. It uses RabbitMQ for the queue and configuration files for different environments.

## Project Structure

The project is divided into two main parts:

-   `webhook-proxy-app`: This directory contains the source code for the webhook proxy application. It is a TypeScript project.
-   `testing-tools`: This directory contains tools for testing the webhook proxy. It includes a Dockerfile and docker-compose.yml for running the tests in a container.

## Setup

The project requires a RabbitMQ instance. You can either run and configure it normally, or use the proivided docker-compose file in the main directory to start it with `docker-compose up -d`

To set up the main project project, follow these steps:

1. `cd webhook-proxy-app`
2.  Install dependencies: `npm install`
3.  Start the project: `npm run dev`

To use the testing service, either run it directly with `npm install` and `npm start` or run it through docker with `docker-compose up -d`