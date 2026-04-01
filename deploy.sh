#!/usr/bin/env bash
set -euo pipefail

FUNCTION_NAME="ai-latencies"
REGION="${AWS_REGION:-us-east-1}"
ROLE_ARN="arn:aws:iam::717589162638:role/ai-latencies-lambda"
S3_BUCKET="ai-latencies-deploy"

echo "Building..."
npm run build --silent

echo "Packaging..."
STAGING=/tmp/ai-latencies-pkg
rm -rf "$STAGING"
mkdir -p "$STAGING"

cp dist/index.mjs "$STAGING/"

# Install only the externalized packages and their full dependency trees
cat > "$STAGING/package.json" <<'PKGJSON'
{"private":true,"dependencies":{"@secure-exec/core":"*","@secure-exec/nodejs":"*","@secure-exec/v8":"*","@secure-exec/v8-linux-x64-gnu":"*","@rivet-dev/agent-os-core":"*","@rivet-dev/agent-os-posix":"*","@rivet-dev/agent-os-python":"*","@rivet-dev/agent-os-common":"*","@rivet-dev/agent-os-coreutils":"*","@rivet-dev/agent-os-sed":"*","@rivet-dev/agent-os-grep":"*","@rivet-dev/agent-os-gawk":"*","@rivet-dev/agent-os-findutils":"*","@rivet-dev/agent-os-diffutils":"*","@rivet-dev/agent-os-tar":"*","@rivet-dev/agent-os-gzip":"*"}}
PKGJSON
(cd "$STAGING" && npm install --production --ignore-scripts --no-audit --no-fund --silent 2>&1)
rm "$STAGING/package.json" "$STAGING/package-lock.json" 2>/dev/null || true

cd "$STAGING" && zip -rq /tmp/ai-latencies.zip . && cd -

ZIP_SIZE=$(du -h /tmp/ai-latencies.zip | cut -f1)
echo "Zip size: $ZIP_SIZE"

echo "Uploading to S3..."
aws s3 cp /tmp/ai-latencies.zip "s3://$S3_BUCKET/code.zip" --region "$REGION" --quiet

# Check if function exists
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" &>/dev/null; then
  echo "Updating function code..."
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --s3-bucket "$S3_BUCKET" \
    --s3-key code.zip \
    --region "$REGION" \
    --no-cli-pager \
    --query 'CodeSize'

  echo "Waiting for update..."
  aws lambda wait function-updated-v2 \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION"
else
  echo "Creating function..."
  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --runtime nodejs20.x \
    --handler index.handler \
    --role "$ROLE_ARN" \
    --s3-bucket "$S3_BUCKET" \
    --s3-key code.zip \
    --timeout 300 \
    --memory-size 512 \
    --region "$REGION" \
    --no-cli-pager

  echo "Waiting for creation..."
  aws lambda wait function-active-v2 \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION"
fi

echo "Deployed."
rm -rf "$STAGING" /tmp/ai-latencies.zip
