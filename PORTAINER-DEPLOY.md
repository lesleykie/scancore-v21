# Deploy ScanCore with Portainer

## Quick Deploy

1. **In Portainer, go to Stacks → Add Stack**

2. **Choose "Repository" and enter:**
   - Repository URL: `https://github.com/your-username/scancore-inventory`
   - Compose path: `docker-compose.yml`

3. **Set Environment Variables:**
   \`\`\`
   POSTGRES_PASSWORD=your-secure-db-password-here
   NEXTAUTH_SECRET=your-very-long-random-secret-key-here
   APP_PORT=8088
   DB_PORT=5433
   ADMINER_PORT=8081
   DEBUG_MODE=true
   NEXTAUTH_URL=http://localhost:8088
   \`\`\`

4. **Deploy the stack**

5. **Verify deployment:**
   - Check debug page: `http://your-server:8088/debug`
   - Access installer: `http://your-server:8088/install`

## Data Storage

All persistent data is stored in `./docker-data/scancore/`:
- `database/` - PostgreSQL data
- `app/` - Application data and configuration  
- `uploads/` - Module uploads and temporary files
- `modules/` - Installed plugin modules
- `themes/` - Theme files

## Access Points

- **Application**: http://your-server:8088
- **Installer**: http://your-server:8088/install (first run only)
- **Debug Page**: http://your-server:8088/debug
- **Database Admin**: http://your-server:8081
- **System Management**: http://your-server:8088/admin/system

## Verification Steps

1. **Check containers are healthy** in Portainer
2. **Visit debug page** to verify all systems
3. **Complete installer** if first run
4. **Test database admin** access

## Troubleshooting

- **Storage issues**: Check debug page for directory status
- **Database issues**: Check Adminer connection
- **Container issues**: View logs in Portainer
