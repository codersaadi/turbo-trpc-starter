#!/bin/bash

# =============================================================================
# Environment Setup Script
# Creates .env file from .env.example if it doesn't exist
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

ENV_FILE="$ROOT_DIR/.env"
ENV_EXAMPLE="$ROOT_DIR/.env.example"

echo "🔧 Setting up environment..."

# Check if .env.example exists
if [ ! -f "$ENV_EXAMPLE" ]; then
    echo "❌ Error: .env.example not found at $ENV_EXAMPLE"
    exit 1
fi

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  .env file already exists at $ENV_FILE"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping .env creation."
        exit 0
    fi
fi

# Copy .env.example to .env
cp "$ENV_EXAMPLE" "$ENV_FILE"
echo "✅ Created .env from .env.example"

# Generate a random string for secrets (optional enhancement)
# You can uncomment this to auto-generate secrets
# RANDOM_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)

echo ""
echo "📝 Next steps:"
echo "   1. Edit .env and fill in your values"
echo "   2. Start the database: docker compose up -d"
echo "   3. Run migrations: pnpm db:migrate (if available)"
echo "   4. Start the dev server: pnpm dev"
echo ""
echo "🔑 Required variables to configure:"
echo "   - DATABASE_URL (default uses docker-compose postgres on port 5433)"
echo "   - RESEND_KEY (for email sending)"
echo "   - EMAIL_FROM (verified sender email)"
echo ""
