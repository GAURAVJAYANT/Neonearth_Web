pipeline {
    agent any

    environment {
        // Essential: Mark as CI so your custom 'AllureOpenReporter.js' 
        // skips the browser pop-up automation during Jenkins runs
        CI = 'true'
    }

    stages {
        stage('🧹 Clean Results') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'rm -rf allure-results allure-report'
                    } else {
                        bat 'if exist allure-results rmdir /s /q allure-results'
                        bat 'if exist allure-report rmdir /s /q allure-report'
                    }
                }
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm install'
                    } else {
                        bat 'npm install'
                    }
                }
            }
        }

        stage('🌐 Install Browsers') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npx playwright install --with-deps'
                    } else {
                        bat 'npx playwright install --with-deps'
                    }
                }
            }
        }

        stage('🚀 Run Playwright Tests') {
            steps {
                script {
                    // catchError allows the pipeline to continue to the Reporting stage even if tests fail
                    catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                        if (isUnix()) {
                            sh 'npx playwright test'
                        } else {
                            bat 'npx playwright test'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            // STEP: ALLURE REPORT PUBLISHING
            // This requires the "Allure Jenkins Plugin" to be installed on your Jenkins server
            allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
            
            // Archive artifacts as backup (screenshots, videos, etc.)
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
        }
    }
}
