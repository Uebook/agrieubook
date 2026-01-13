# Agribook Marketing Website

A static marketing and information website for Agribook - an agricultural eBook platform.

## Overview

This is a static website showcasing Agribook's features, books, authors, and services. It's designed to be a marketing and information site for both users and vendors.

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with smooth animations
- **Sections**:
  - Hero section with key statistics
  - Features overview
  - Category showcase
  - Featured books
  - Author profiles
  - Platform statistics
  - About section
  - Call-to-action
  - Footer with links

## File Structure

```
website/
├── index.html      # Main HTML file
├── styles.css      # All styling
├── script.js       # JavaScript for interactivity and data population
└── README.md       # This file
```

## Usage

Simply open `index.html` in a web browser. No build process or server required - it's a fully static website.

### Local Development

1. Open `index.html` in your browser
2. Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   ```

## Data

The website uses dummy data defined in `script.js`:
- Categories (10 categories)
- Books (8 featured books)
- Authors (4 expert authors)
- Statistics (platform metrics)

## Customization

### Colors

Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #2d5016;
    --secondary-color: #f5a623;
    --accent-color: #27ae60;
    /* ... */
}
```

### Content

- **Books**: Edit the `books` array in `script.js`
- **Authors**: Edit the `authors` array in `script.js`
- **Categories**: Edit the `categories` array in `script.js`
- **Text Content**: Edit directly in `index.html`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- All images use Unsplash placeholder URLs
- Replace with actual images for production
- All data is static/dummy - no API calls
- Fully client-side, no backend required

## Deployment

This static website can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

Simply upload the `website` folder contents to your hosting service.
