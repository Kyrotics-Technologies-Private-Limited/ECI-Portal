# Bhasantar_frontend

This repository contains the React.js frontend application for the Bhasantar document translation portal.

## Table of Contents

* [Project Overview](#project-overview)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Running Locally](#running-locally)
* [Environment Variables](#environment-variables)
* [Deployment](#deployment)
* [CI/CD](#ci-cd)
* [Folder Structure](#folder-structure)
* [Contributing](#contributing)
* [License](#license)

## Project Overview

Bhasantar is a sophisticated web application designed to facilitate the translation of legal documents from English into various Indian regional languages, primarily Bengali. This frontend provides the user interface for clients to upload documents, track translation progress, and for the internal legal team to refine machine translations using an integrated editor.

## Features

* Client-side document upload (PDF) with folder management.
* Dashboard for tracking document status (Ready for work, Work in progress, Completed, Delivered).
* Integrated split-screen editor for human refinement of translations.
* Role-based access control for different user types (Client User, Company User, QA, Admin, Super Admin).
* Download functionality for original and translated documents.
* Reporting and analytics dashboards for administrators.

## Tech Stack

* React.js
* Tailwind CSS
* Quill (for rich text editing)
* Firebase (for authentication integration)

## Prerequisites

* Node.js (LTS version recommended)
* npm (Node Package Manager)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-org/Bhasantar_frontend.git](https://github.com/your-org/Bhasantar_frontend.git)
    cd Bhasantar_frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running Locally

1.  **Create a `.env` file** in the root directory based on the `Environment Variables` section below.
2.  **Start the development server:**
    ```bash
    npm start
    ```
    The application will typically be available at `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the root of the project and populate it with the following:


Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

Backend API URL
REACT_APP_BACKEND_API_URL=http://localhost:5000/api

*Note: Replace placeholders with your actual Firebase and backend API details.*

## Deployment

The frontend is primarily hosted on Google App Engine for the main portal.

To deploy to Google App Engine:

1.  Ensure you have the Google Cloud SDK installed and configured.
2.  Authenticate with Google Cloud and set your project.
3.  From the project root, run:
    ```bash
    gcloud app deploy
    ```
    This command uses the `app.yaml` file to deploy the application.

## CI/CD

Pushing code to the `main` branch of this repository automatically triggers a build and deployment to a test domain via Vercel for continuous integration and testing. Production deployments to Google App Engine are triggered manually using `gcloud app deploy`.

## Folder Structure


├── public/                  # Public assets
├── src/                     # Source code
│   ├── assets/              # Static assets (images, icons)
│   ├── components/          # Reusable React components
│   ├── config/              # Application configurations
│   ├── context/             # React Context for global state
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Top-level page components
│   ├── services/            # API service calls, Firebase interactions
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main application component
│   ├── index.css            # Global CSS styles
│   ├── main.jsx             # Entry point for the React app
│   └── ...
├── .gcloudignore            # Files to ignore during GCP deployment
├── .gitignore               # Files to ignore for Git
├── app.yaml                 # Google App Engine configuration
├── dispatch.yaml            # Google App Engine dispatch rules (if used)
├── index.html               # Main HTML file
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration for Tailwind CSS
├── README.md                # This file
├── tailwind.config.js       # Tailwind CSS configuration
├── vercel.json              # Vercel deployment configuration
└── vite.config.js           # Vite build tool configuration


## Contributing

Please follow standard Gitflow for contributions. Create a new branch for features or bug fixes and submit a Pull Request.
