pipeline {
  agent any
  environment {
    IMAGE = "kelongmelita/nextjs-app"
    TAG   = "${BUILD_NUMBER}"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Install') {
      steps { sh 'npm ci' }
    }
    stage('Test') {
      steps { sh 'npm test -- --passWithNoTests --ci' }
    }
    stage('Build Image') {
      steps {
        sh "docker build -t ${IMAGE}:${TAG} ."
      }
    }
    stage('Push to Docker Hub') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-credentials',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
          sh "docker push ${IMAGE}:${TAG}"
        }
      }
    }
    stage('Deploy to k3s') {
      steps {
        withCredentials([file(
          credentialsId: 'k3s-kubeconfig',
          variable: 'KUBECONFIG'
        )]) {
          sh """
            kubectl set image deployment/nextjs-app \\
              nextjs=${IMAGE}:${TAG} \\
              -n your-app
            kubectl rollout status deployment/nextjs-app -n your-app
          """
        }
      }
    }
  }
  post {
    always { cleanWs() }
    success { echo 'Next.js app deployed successfully!' }
    failure { echo 'Build failed!' }
  }
}