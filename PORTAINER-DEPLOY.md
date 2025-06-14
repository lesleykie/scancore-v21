# Deploy ScanCore with Portainer

## Quick Deploy

1. **In Portainer, go to Stacks → Add Stack**

2. **Choose "Repository" and enter:**
   - Repository URL: `https://github.com/[YOUR-USERNAME]/[YOUR-REPO-NAME]`
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
   DATA_PATH=./docker-data/scancorev20
   \`\`\`

4. **Deploy the stack**

5. **Verify deployment:**
   - Check debug page: `http://your-server:8088/debug`
   - Access installer: `http://your-server:8088/install`

## Data Storage

All persistent data is stored in `${DATA_PATH}` (default: `./docker-data/scancorev20/`):
- `database/` - PostgreSQL data
- `app/` - Application data and configuration  
- `uploads/` - Module uploads and temporary files
- `modules/` - Installed plugin modules
- `themes/` - Theme files

## Version Management

To run multiple versions or upgrade:

**For testing v21:**
\`\`\`
DATA_PATH=./docker-data/scancorev21
APP_PORT=8089
DB_PORT=5434
ADMINER_PORT=8082
\`\`\`

**For production upgrade:**
1. Stop current version
2. Change `DATA_PATH=./docker-data/scancorev21`
3. Deploy new version
4. Migrate data if needed

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
