# Context
This is the repository for a conference website, Blastoff Rails.
Keep things as simple as possible. Eleventy static site generator, html, css, js.
Prefer not to add dependencies to the project but if it is absolutely necessary ask first.

# WebC Components
The project uses WebC for components. Key setup details:
- WebC plugin is configured in .eleventy.js with components in src/_components/
- Pages that use WebC components must have .webc extension
- Components should use webc:root attribute on the html element to avoid wrapper elements
- Use webc:keep on <link> and <script> tags to prevent inlining
- The page-layout.webc component provides the base HTML structure for all pages

# Colors Guide
"text": "#4f6d7bff",          // paynes-gray: clean and readable
"text-dark": "#54291eff",     // caput-mortuum: deep, strong contrast
"border": "#b64023ff",        // rust: assertive and warm
"primary": "#e9702dff",       // spanish-orange: vibrant and eye-catching
"secondary": "#ffb338ff",     // orange-web: energetic, great for accents
"primary-dark": "#b64023ff",  // rust: complements primary with more depth
"bg": "#fef0d4ff",            // papaya-whip: soft, welcoming background
"bg-alt": "#ffffff",          // white: clean alternate background
"overlay": "#54291ecc"        // caput-mortuum with opacity for overlays
