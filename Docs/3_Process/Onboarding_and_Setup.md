## Development Environment Setup Guide

### **Quick Setup for New Developers**

```bash
# 1. Install required services
brew install postgresql@15 node@18

# 2. Start PostgreSQL
brew services start postgresql@15

# 3. Create development database
createdb vibelab_dev

# 4. Clone and setup project
git clone [repository]
cd vibe-lab
npm install

# 5. Configure environment
cp .env.example .env
# Edit DATABASE_URL to: postgresql://[username]@localhost:5432/vibelab_dev

# 6. Setup database
npx prisma migrate dev
npx prisma generate

# 7. Verify setup
npm run dev
```

### **Service Dependencies**

#### **Required Services**
| Service | Version | Purpose | Installation |
|---------|---------|---------|--------------|
| PostgreSQL | 15+ | Primary database | `brew install postgresql@15` |
| Node.js | 18+ | Runtime environment | `brew install node@18` |
| Git | Latest | Version control | Built into macOS |

#### **Optional Services** 
| Service | Purpose | Installation |
|---------|---------|--------------|
| Docker | Alternative database setup | `brew install docker` |
| VS Code | Recommended IDE | Download from website |

### **Environment Variables**

#### **Required Configuration**
```env
# Database
DATABASE_URL="postgresql://[username]@localhost:5432/vibelab_dev"

# API Keys (get from respective services)
ANTHROPIC_API_KEY="your_anthropic_key"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

#### **Optional Configuration**
```env
# Development
NODE_ENV="development"
LOG_LEVEL="debug"

# Feature Flags
ENABLE_MAGIC_MCP="true"
ENABLE_DUAL_CLAUDE="true"
```