# Agribook - Unified Server Setup

This setup allows you to run both the website and admin panel on a single port (3000) with proper routing.

## Architecture

- **Website**: Served at `http://localhost:3000` (static files)
- **Admin Panel**: Served at `http://localhost:3000/admin` (Next.js app)

## How It Works

1. **Proxy Server** (`server.js`): Runs on port 3000
   - Routes requests to `/admin/*` to the Next.js admin panel
   - Serves static website files for all other requests

2. **Admin Panel**: Next.js app running on port 3001
   - Configured with `basePath: '/admin'` in `next.config.ts`
   - Proxied through the main server at `/admin`

3. **Website**: Static HTML/CSS/JS files in the `website/` directory
   - Served directly by the proxy server

## Running the Servers

### Option 1: Manual Start (Recommended for Development)

Start each server in a separate terminal:

```bash
# Terminal 1: Start the admin panel
cd admin
npm run dev

# Terminal 2: Start the proxy server
cd ..
node server.js
```

### Option 2: Using the Start Script

```bash
./start-all.sh
```

This will start both servers automatically. Press CTRL+C to stop all servers.

### Option 3: Using npm

```bash
# From the root directory
npm run dev
```

## Accessing the Applications

Once both servers are running:

- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## File Structure

```
Agribook/
├── server.js           # Proxy server (port 3000)
├── start-all.sh        # Script to start both servers
├── admin/              # Next.js admin panel (port 3001)
│   ├── next.config.ts  # Configured with basePath: '/admin'
│   └── package.json    # Dev script runs on port 3001
└── website/            # Static website files
    ├── index.html
    ├── styles.css
    └── script.js
```

## Notes

- The admin panel must be running on port 3001 for the proxy to work
- The proxy server must be running on port 3000
- Both servers need to be running simultaneously for the full setup to work
- The admin panel is configured with `basePath: '/admin'` so all its routes are prefixed with `/admin`
