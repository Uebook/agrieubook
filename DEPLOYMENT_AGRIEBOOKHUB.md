# Deployment Guide for agriebookhub.in

This guide will help you deploy the Agribook application to your domain **https://agriebookhub.in/**

## Prerequisites

- VPS with root/sudo access
- Domain: agriebookhub.in pointed to your VPS IP
- Node.js 18+ installed
- Git installed

## Step 1: Connect to Your VPS

```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

## Step 2: Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

## Step 3: Clone the Repository

```bash
# Create directory
sudo mkdir -p /var/www
cd /var/www

# Clone repository
sudo git clone https://github.com/Uebook/agrieubook.git agribook
cd agribook

# Set permissions
sudo chown -R $USER:$USER /var/www/agribook
```

## Step 4: Install Dependencies

```bash
# Install root dependencies (proxy server)
npm install

# Install admin panel dependencies
cd admin
npm install
cd ..
```

## Step 5: Configure Environment Variables

```bash
cd admin
nano .env.local
```

Add your configuration:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://isndoxsyjbdzibhkrisj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://agriebookhub.in
```

Save and exit (Ctrl+X, then Y, then Enter)

## Step 6: Build the Admin Panel

```bash
cd /var/www/agribook/admin
npm run build
cd ..
```

## Step 7: Create PM2 Ecosystem File

```bash
cd /var/www/agribook
nano ecosystem.config.js
```

Add this configuration:
```javascript
module.exports = {
  apps: [
    {
      name: 'agribook-admin',
      cwd: '/var/www/agribook/admin',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'agribook-proxy',
      cwd: '/var/www/agribook',
      script: './server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
```

## Step 8: Start Applications with PM2

```bash
cd /var/www/agribook
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Follow the instructions from the output
```

## Step 9: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/agriebookhub.in
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name agriebookhub.in www.agriebookhub.in;

    # Increase buffer sizes for large requests
    client_max_body_size 100M;
    client_body_buffer_size 128k;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/agriebookhub.in /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 10: Setup SSL Certificate

```bash
sudo certbot --nginx -d agriebookhub.in -d www.agriebookhub.in
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

## Step 11: Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Step 12: Verify Deployment

Visit your domain:
- **Website**: https://agriebookhub.in
- **Admin Panel**: https://agriebookhub.in/admin

## Managing Your Application

### View Application Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs
pm2 logs agribook-admin
pm2 logs agribook-proxy
```

### Restart Applications
```bash
pm2 restart all
# or individually
pm2 restart agribook-admin
pm2 restart agribook-proxy
```

### Stop Applications
```bash
pm2 stop all
```

### Monitor Resources
```bash
pm2 monit
```

## Updating Your Application

When you push new code to GitHub:

```bash
cd /var/www/agribook

# Pull latest changes
git pull origin main

# Update dependencies if needed
npm install
cd admin && npm install && cd ..

# Rebuild admin panel
cd admin && npm run build && cd ..

# Restart applications
pm2 restart all
```

## Troubleshooting

### Check if services are running
```bash
pm2 status
sudo systemctl status nginx
```

### Check ports
```bash
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### View Nginx logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### Check SSL certificate
```bash
sudo certbot certificates
```

### Renew SSL certificate (automatic, but can be done manually)
```bash
sudo certbot renew --dry-run
```

## Architecture

```
Internet
    ↓
Nginx (Port 80/443) - agriebookhub.in
    ↓
Proxy Server (Port 3000)
    ├── / → Static Website
    └── /admin/* → Next.js Admin Panel (Port 3001)
```

## Important Notes

1. **DNS Configuration**: Ensure your domain's A record points to your VPS IP
2. **SSL Auto-Renewal**: Certbot automatically renews certificates
3. **Backups**: Regularly backup your Supabase database
4. **Monitoring**: Use PM2 to monitor application health
5. **Security**: Keep your system and packages updated

## Support Commands

```bash
# Check DNS resolution
nslookup agriebookhub.in

# Test Nginx configuration
sudo nginx -t

# Reload Nginx without downtime
sudo systemctl reload nginx

# View system resources
htop

# Check disk space
df -h
```

## Security Checklist

- [x] SSL certificate installed
- [x] Firewall configured
- [x] PM2 running with auto-restart
- [ ] Change default admin password
- [ ] Setup regular backups
- [ ] Configure monitoring/alerts
- [ ] Review Nginx security headers

## Next Steps

1. Login to admin panel: https://agriebookhub.in/admin
2. Change default admin password
3. Configure your content
4. Test all functionality
5. Setup monitoring and backups

For issues or questions, check the logs first:
```bash
pm2 logs
sudo tail -f /var/log/nginx/error.log
```
