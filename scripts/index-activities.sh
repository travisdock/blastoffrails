#!/bin/bash

#
# Typesense Activity Indexing Script (Shell/cURL version)
#
# This script creates the 'activities' collection in Typesense and imports
# activity data from data/activities.json using cURL.
#
# Prerequisites:
#   - curl
#   - jq (for JSON processing)
#
# Usage:
#   TYPESENSE_HOST=xxx.typesense.net \
#   TYPESENSE_API_KEY=your-admin-api-key \
#   ./scripts/index-activities.sh
#

set -e

# Check environment variables
if [ -z "$TYPESENSE_HOST" ] || [ -z "$TYPESENSE_API_KEY" ]; then
    echo "Error: TYPESENSE_HOST and TYPESENSE_API_KEY environment variables are required"
    echo ""
    echo "Usage:"
    echo "  TYPESENSE_HOST=xxx.typesense.net \\"
    echo "  TYPESENSE_API_KEY=your-admin-api-key \\"
    echo "  ./scripts/index-activities.sh"
    exit 1
fi

# Check for required tools
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed."
    echo "Install it with: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_FILE="$SCRIPT_DIR/../data/activities.json"

echo "Typesense Activity Indexer (Shell version)"
echo "=========================================="
echo ""
echo "Connecting to: $TYPESENSE_HOST"
echo ""

# Delete existing collection (ignore errors)
echo "Deleting existing collection (if any)..."
curl -s -X DELETE "https://${TYPESENSE_HOST}/collections/activities" \
    -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" > /dev/null 2>&1 || true

# Create collection
echo "Creating activities collection..."
curl -s -X POST "https://${TYPESENSE_HOST}/collections" \
    -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "activities",
        "fields": [
            { "name": "id", "type": "string" },
            { "name": "name", "type": "string" },
            { "name": "description", "type": "string" },
            { "name": "category", "type": "string", "facet": true },
            { "name": "subcategory", "type": "string", "facet": true, "optional": true },
            { "name": "tags", "type": "string[]", "facet": true },
            { "name": "address", "type": "string", "optional": true },
            { "name": "neighborhood", "type": "string", "facet": true, "optional": true },
            { "name": "price_range", "type": "string", "facet": true, "optional": true },
            { "name": "website_url", "type": "string", "optional": true },
            { "name": "image_url", "type": "string", "optional": true },
            { "name": "distance_from_venue", "type": "string", "optional": true },
            { "name": "highlights", "type": "string[]", "optional": true },
            { "name": "best_for", "type": "string[]", "facet": true, "optional": true }
        ]
    }' > /dev/null

echo "Collection created successfully"

# Import documents (convert JSON array to JSONL format)
echo "Importing activities..."
ACTIVITY_COUNT=$(jq length "$DATA_FILE")
echo "Found $ACTIVITY_COUNT activities to import"

jq -c '.[]' "$DATA_FILE" | \
curl -s -X POST "https://${TYPESENSE_HOST}/collections/activities/documents/import?action=create" \
    -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" \
    -H "Content-Type: text/plain" \
    --data-binary @- > /dev/null

echo "Successfully imported $ACTIVITY_COUNT activities"
echo ""
echo "Done! Your activities are now searchable."
echo ""
echo "Next steps:"
echo "1. Update assets/js/typesense-search.js with your Typesense credentials"
echo "2. Add the Typesense logo to assets/images/sponsors/typesense-logo.svg"
echo "3. Open things-to-do.html in your browser to test"
