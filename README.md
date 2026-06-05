# Landlord-Tenant Management System

A comprehensive, mobile-first web application for managing properties, tenants, and payments.

## Features

- **Dashboard**: Real-time overview of revenue, tenants, and properties.
- **Property Management**: Add and list properties.
- **Tenant Management**: Register and manage tenants, track lease details.
- **Rent Tracking**: Record payments, view history, and generate receipts.
- **Water Bill Management**: Track and bill water usage.
- **WhatsApp Integration**: Send payment receipts and reminders via WhatsApp (requires Twilio).
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Dark Mode**: Built-in dark/light theme toggle.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (Development)
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd landlord-system
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env` file in the root directory (or use the existing one) and add the following:

    ```env
    DATABASE_URL="file:./dev.db"
    NEXTAUTH_SECRET="your-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    
    # Optional: Twilio for WhatsApp
    TWILIO_ACCOUNT_SID="your-sid"
    TWILIO_AUTH_TOKEN="your-token"
    TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
    ```

4.  Initialize the database:
    ```bash
    npx prisma db push
    ```

5.  (Optional) Seed the database:
    *Note: The automatic seed script might encounter issues. You can manually add data using Prisma Studio.*
    ```bash
    npx prisma studio
    ```

6.  Run the development server:
    ```bash
    npm run dev
    ```

7.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app`: Application routes and pages.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions, database connection, authentication config.
- `prisma`: Database schema and migrations.

## CI/CD and k3s Deployment

This repository includes a Jenkins pipeline and Kubernetes manifests for automatic deployment to a k3s cluster.

### Included configuration

- `Jenkinsfile` - CI/CD pipeline for build, docker image push, and deployment.
- `Dockerfile` - Multi-stage container build for production.
- `.dockerignore` - Files excluded from the Docker build context.
- `k8s/namespace.yaml` - Namespace definition for the cluster.
- `k8s/deployment.yaml` - Kubernetes deployment manifest.
- `k8s/service.yaml` - Service exposing the app on NodePort `30080`.
- `k8s/secret-example.yaml` - Example secret manifest for sensitive values.

### Jenkins setup

1.  Install Jenkins on your VPS or CI host.
2.  Add credentials:
    - `docker-registry-credentials` for Docker registry login.
    - `kubeconfig-credentials` for your k3s cluster kubeconfig file.
3.  Configure the pipeline job to use the included `Jenkinsfile`.
4.  Set `DOCKER_REGISTRY` in the Jenkinsfile to your registry host.

### k3s deployment notes

- The current `k8s/service.yaml` uses `NodePort` on port `30080`.
- Replace `REPLACE_IMAGE` inside `k8s/deployment.yaml` if you want to apply the manifest directly.
- Use `kubectl apply -f k8s/secret-example.yaml` after updating the secret values.

### Example deployment commands

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret-example.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/deployment.yaml
kubectl set image deployment/landlord-system landlord-system=your-registry.example.com/landlord-system:latest --namespace=landlord
```

## License

MIT
