# React Survey Application

This application is a React-based web app designed to conduct various surveys, including pre-workshop, post-workshop, follow-up, and surveys for previous participants. It integrates Google OAuth for authentication and uses SurveyJS for rendering survey forms.

## Features

- User authentication via Google OAuth.
- Survey forms for pre-workshop, post-workshop, follow-up, and old participants.
- Protected routes to ensure surveys are accessible only after authentication.
- Dynamic routing based on user status and survey completion.
- Custom themes for surveys using SurveyJS.

## Getting Started

To get started, clone the repository from the Google Cloud Source Repository:

```bash
gcloud source repos clone react_fl2f_forms --project=fl2f-1
```

Install the dependencies:

```bash
npm install
```

Run the application:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Components

### `App`

Serves as the root component, setting up routing logic and managing application-wide states like user authentication and user information.

### `Login`

Handles user authentication via Google and navigates the user to the appropriate survey based on their completion status.

### `PreWorkshop`, `PostWorkshop`, `FollowUp`

These components render specific survey forms for different phases of the workshop. They manage the submission of survey data to the backend.

### `OldFollowup`

A special component for collecting data from participants of previous workshops. It is similar to the `FollowUp` component, but it does not require authentication. Will be removed in the future.

## `Surveys`

This folder contains the survey forms for the different phases of the workshop. They are rendered by the `PreWorkshop`, `PostWorkshop`, and `FollowUp` components. They use SurveyJS to render the forms and manage the submission of survey data to the backend.

## Utils

### `PrivateRoutes`

A utility component for routes that require authentication. It redirects the user to the login page if they are not authenticated.

## Technologies Used

- React
- react-router-dom for routing.
- SurveyJS for survey forms.
- Axios for HTTP requests.
- Google OAuth for authentication.
- CSS for styling.

## Deployment

The application is deployed on Google Cloud Platform Run in a Docker container. The Dockerfile is included in the repository. The application is served on port 8080.

### Frontend Container

The frontend container is built from the `Dockerfile.frontend`. It can be built locally using the following command:

```bash
docker build -f Dockerfile.frontend -t forms-react-flask-frontend .
```

### Backend Container

The backend container is built from the `Dockerfile.backend` It can be built locally the following command:

```bash
docker build -f Dockerfile.backend -t forms-react-flask-backend .
```

### Deployment to Google Cloud Platform

The application is deployed to Google Cloud Platform Run using the `service.yaml` file. The frontend and backend containers are deployed as a single service with a sidecar container. The sidecar container is used to wait for the backend container to start before starting the frontend container. This is necessary because the frontend container requires the backend container to be running before it can start.

The application is deployed using the following command, which builds the frontend and backend containers and deploys them to Google Cloud Platform Run:

```bash
gcloud run services replace service.yaml
```

Note:

- Is important to know that the command is not working 100% of the time, so verify that the deployment was successful on the Google Cloud Platform Run dashboard.
- You need the Google Cloud SDK installed and configured to run the command.
