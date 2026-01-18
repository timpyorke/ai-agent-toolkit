#!/bin/bash

# AI Agent Toolkit - Installation Script
# Installs the CLI tool globally using npm

set -e

echo "🚀 Installing AI Agent Toolkit CLI..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ Node.js $(node --version) detected"
echo "✓ npm $(npm --version) detected"
echo

# Install dependencies and link globally
echo "📦 Installing dependencies..."
npm install

echo
echo "🔗 Linking CLI globally..."
npm link

echo
echo "✅ Installation complete!"
echo
echo "Usage:"
echo "  aat list              # List all available skills"
echo "  aat info <skill>      # Show skill details"
echo "  aat copy              # Copy skills interactively"
echo "  aat copy --all        # Copy all skills"
echo
echo "Get started:"
echo "  aat list"
echo
