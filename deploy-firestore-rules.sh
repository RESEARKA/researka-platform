#!/bin/bash

# Script to deploy Firestore security rules
echo "Deploying Firestore security rules..."

# Make sure Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
firebase login

# Deploy only Firestore rules
firebase deploy --only firestore:rules

echo "Firestore rules deployed successfully!"
