# VPS Deployment Guide for Agribook

This guide will help you deploy the Agribook application on your VPS.

## Prerequisites

Your VPS should have:
- Node.js 18+ installed
- npm or yarn
- Git
- PM2 (for process management) - optional but recommended

## Step 1: Clone the Repository

```bash
cd /var/www  # or your preferred directory
git clone https://github.com/Uebook/agrieubook.git agribook
cd agribook
```

## Step 2: Install Dependencies

### Install root dependencies (for proxy server)
```bash
npm install
```

### Install admin panel dependencies
```bash
cd admin
npm install
cd ..
```

### Install website dependencies (if any)
```bash
cd website
# No dependencies needed for static site
cd ..
```

## Step 3: Configure Environment Variables

### Admin Panel Environment
```bash
cd admin
cp .env.local.example .env.local  # if example exists, or create new
nano .env.local
```

Add your Supabase credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Step 4: Build the Admin Panel

```bash
cd admin
npm run build
cd ..
```

## Step 5: Start the Servers

### Option 1: Using PM2 (Recommended for Production)

Install PM2 globally:
```bash
npm install -g pm2
```

Create PM2 ecosystem file:
```bash
nano ecosystem.config.js
```

Add this configuration:
```javascript
module.exports = {
  apps: [
    {
      name: 'agribook-admin',
      cwd: './admin',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'agribook-proxy',
      script: './server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

Start the applications:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions to enable auto-start on boot
```

### Option 2: Using the Start Script

```bash
chmod +x start-all.sh
./start-all.sh
```

### Option 3: Manual Start (for testing)

Terminal 1 - Admin Panel:
```bash
cd admin
npm start
```

Terminal 2 - Proxy Server:
```bash
node server.js
```

## Step 6: Configure Nginx (Reverse Proxy)

Install Nginx if not already installed:
```bash
sudo apt update
sudo apt install nginx
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/agribook
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/agribook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 7: Setup SSL with Let's Encrypt (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 8: Firewall Configuration

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
```

## Accessing Your Application

After deployment:
- **Website**: http://yourdomain.com or http://your-vps-ip
- **Admin Panel**: http://yourdomain.com/admin or http://your-vps-ip/admin

## Managing the Application

### Using PM2

```bash
# View logs
pm2 logs

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# View status
pm2 status

# Monitor
pm2 monit
```

### Updating the Application

```bash
cd /var/www/agribook
git pull origin main
cd admin
npm install
npm run build
cd ..
pm2 restart all
```

## Troubleshooting

### Check if services are running
```bash
pm2 status
```

### Check logs
```bash
pm2 logs agribook-admin
pm2 logs agribook-proxy
```

### Check if ports are in use
```bash
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

## Architecture Overview

```
Internet → Nginx (Port 80/443)
    ↓
Proxy Server (Port 3000)
    ├── / → Static Website
    └── /admin/* → Next.js Admin Panel (Port 3001)
```

## Security Recommendations

1. **Change default admin password** immediately after first login
2. **Enable firewall** and only allow necessary ports
3. **Setup SSL certificate** using Let's Encrypt
4. **Regular updates**: Keep Node.js, npm, and dependencies updated
5. **Backup database**: Regular Supabase backups
6. **Monitor logs**: Use PM2 or similar tools to monitor application logs
7. **Environment variables**: Never commit `.env.local` to git

## Support

For issues, check:
- Application logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/error.log`
- System logs: `journalctl -xe`
