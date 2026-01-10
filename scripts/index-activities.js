#!/usr/bin/env node

/**
 * Typesense Activity Indexing Script
 *
 * This script creates the 'activities' collection in Typesense and imports
 * activity data from data/activities.json.
 *
 * Prerequisites:
 *   npm install typesense
 *
 * Usage:
 *   TYPESENSE_HOST=xxx.typesense.net \
 *   TYPESENSE_API_KEY=your-admin-api-key \
 *   node scripts/index-activities.js
 *
 * Environment Variables:
 *   TYPESENSE_HOST    - Your Typesense Cloud cluster host (e.g., xxx.typesense.net)
 *   TYPESENSE_API_KEY - Your Admin API key (not the search-only key)
 */

const Typesense = require('typesense');
const fs = require('fs');
const path = require('path');

// Configuration from environment variables
const config = {
    host: process.env.TYPESENSE_HOST,
    port: 443,
    protocol: 'https',
    apiKey: process.env.TYPESENSE_API_KEY
};

// Validate environment variables
if (!config.host || !config.apiKey) {
    console.error('Error: TYPESENSE_HOST and TYPESENSE_API_KEY environment variables are required');
    console.error('');
    console.error('Usage:');
    console.error('  TYPESENSE_HOST=xxx.typesense.net \\');
    console.error('  TYPESENSE_API_KEY=your-admin-api-key \\');
    console.error('  node scripts/index-activities.js');
    process.exit(1);
}

// Initialize Typesense client
const client = new Typesense.Client({
    nodes: [{
        host: config.host,
        port: config.port,
        protocol: config.protocol
    }],
    apiKey: config.apiKey,
    connectionTimeoutSeconds: 10
});

// Collection schema
const collectionSchema = {
    name: 'activities',
    fields: [
        { name: 'id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'category', type: 'string', facet: true },
        { name: 'subcategory', type: 'string', facet: true, optional: true },
        { name: 'tags', type: 'string[]', facet: true },
        { name: 'address', type: 'string', optional: true },
        { name: 'neighborhood', type: 'string', facet: true, optional: true },
        { name: 'price_range', type: 'string', facet: true, optional: true },
        { name: 'website_url', type: 'string', optional: true },
        { name: 'image_url', type: 'string', optional: true },
        { name: 'distance_from_venue', type: 'string', optional: true },
        { name: 'highlights', type: 'string[]', optional: true },
        { name: 'best_for', type: 'string[]', facet: true, optional: true }
    ]
};

async function run() {
    console.log('Typesense Activity Indexer');
    console.log('==========================');
    console.log('');
    console.log('Connecting to:', config.host);
    console.log('');

    try {
        // Try to delete existing collection (ignore error if it doesn't exist)
        try {
            await client.collections('activities').delete();
            console.log('Deleted existing activities collection');
        } catch (e) {
            if (e.httpStatus === 404) {
                console.log('No existing collection to delete');
            } else {
                throw e;
            }
        }

        // Create collection
        await client.collections().create(collectionSchema);
        console.log('Created activities collection');

        // Read activities data
        const dataPath = path.join(__dirname, '..', 'data', 'activities.json');
        const activitiesRaw = fs.readFileSync(dataPath, 'utf-8');
        const activities = JSON.parse(activitiesRaw);
        console.log('Read ' + activities.length + ' activities from data file');

        // Index documents
        console.log('Importing documents...');
        const results = await client.collections('activities').documents().import(activities, {
            action: 'create'
        });

        // Check for errors
        const errors = results.filter(function(r) { return !r.success; });
        if (errors.length > 0) {
            console.error('Some documents failed to index:');
            errors.forEach(function(err) {
                console.error('  -', err);
            });
        } else {
            console.log('Successfully indexed ' + activities.length + ' activities');
        }

        console.log('');
        console.log('Done! Your activities are now searchable.');
        console.log('');
        console.log('Next steps:');
        console.log('1. Update assets/js/typesense-search.js with your Typesense credentials');
        console.log('2. Add the Typesense logo to assets/images/sponsors/typesense-logo.svg');
        console.log('3. Open things-to-do.html in your browser to test');

    } catch (error) {
        console.error('Error:', error.message);
        if (error.httpStatus) {
            console.error('HTTP Status:', error.httpStatus);
        }
        process.exit(1);
    }
}

run();
