# Blastoff Rails

A simple, elegant website for Blastoff Rails built with HTML, CSS, and JavaScript.

## Overview

This repository contains the source code for the Blastoff Rails website. The site is built using vanilla web technologies to keep things simple and maintainable.

## Tech Stack

- HTML
- CSS
- JavaScript
- MailerLite integration for email subscriptions

## Development

This is a static website with no build process required.

### Running Locally

To view the site locally in your browser:

1. **Simple file opening** (basic functionality):
   ```bash
   open index.html
   ```
   Or simply double-click `index.html` in your file manager.

2. **Local HTTP server** (recommended for full functionality):
   ```bash
   # Using Python (if installed)
   python -m http.server 8000

   # Using Node.js (if installed)
   npx http-server
   ```

Note: A local HTTP server is recommended to avoid CORS issues and ensure all features work properly.

### Making Changes

1. Edit the HTML, CSS, or JavaScript files directly
2. Test changes in your browser
3. Update `sitemap.xml` if you add or remove pages
