# ScanCore Inventory Management System

A modular inventory management system with barcode scanning capabilities, built with Next.js and Docker.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (for updates)

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone <your-repo-url>
   cd scancore-inventory
   \`\`\`

2. **Start the application:**
   \`\`\`bash
   chmod +x scripts/start.sh
   ./scripts/start.sh
   \`\`\`

3. **Access the installer:**
   - Open your browser to `http://localhost:8080/install`
   - Follow the setup wizard

### Default Ports
- **Application**: http://localhost:8080
- **Database Admin**: http://localhost:8081
- **Database**: localhost:5433

### Management Scripts

- **Start**: `./scripts/start.sh`
- **Stop**: `./scripts/stop.sh`
- **Update**: `./scripts/update.sh`

### Configuration

The application uses a `.env` file for configuration. On first run, this is automatically created from `.env.example` with secure random passwords.

### Data Storage

All persistent data is stored in `./docker-data/scancore/`:
- `database/` - PostgreSQL data
- `uploads/` - Module uploads and temporary files
- `config/` - Application configuration
- `modules/` - Installed modules
- `themes/` - Theme files

### Features

- **Barcode Scanning**: Camera-based scanning from desktop and mobile
- **Product Database**: Integration with multiple product APIs
- **Inventory Management**: Track quantities, locations, and expiration dates
- **Modular Architecture**: Plugin system for extending functionality
- **Multi-Group Support**: Organize by location, category, or custom groups
- **Alert System**: Email notifications for low stock and expiring items

### Administration

- **Database Management**: Access Adminer at http://localhost:8081
- **Module Management**: Upload and configure modules through the web interface
- **User Management**: Create and manage user accounts and permissions
- **API Configuration**: Configure product lookup services
- **Email Settings**: Set up SMTP or other email providers

### Development

For development mode:
\`\`\`bash
npm install
npm run dev
\`\`\`

### Support

- Check the debug pages at `/debug` (when DEBUG_MODE=true)
- View logs: `docker-compose logs -f`
- Database access via Adminer or direct connection

## License

[Your License Here]
\`\`\`

</QuickEdit>

Now the Docker setup properly uses the `.env` file, and users can easily start the system with the provided scripts. The `.env` file will be automatically created with secure random passwords on first run.

Should I continue with the installer UI pages next?
