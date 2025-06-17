# VeriMail - Email Domain Verification Service

VeriMail is a comprehensive email domain verification service that helps you validate email configurations including SPF, DKIM, DMARC records, and mail server connectivity.

## 🌐 Live Application

- **Production URL**: [https://verimail.codeprephub.com/](https://verimail.codeprephub.com/)
- **API Documentation**: [https://verimail.codeprephub.com/api-docs](https://verimail.codeprephub.com/api-docs)

## 🚀 Features

- **Email Domain Verification**: Comprehensive checks for email configurations
- **SPF Record Validation**: Verify Sender Policy Framework records
- **DKIM Signature Validation**: Check DomainKeys Identified Mail setup
- **DMARC Policy Validation**: Validate Domain-based Message Authentication
- **Mail Server Connectivity**: Test mail server responsiveness

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation
- React Hook Form with Zod validation
- Axios for API communication
- Sonner for toast notifications

**Backend:**
- Node.js with Express.js
- TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication
- Zod for sSchema validation
- Python scripts for email verification
- Swagger/OpenAPI documentation

**Infrastructure:**
- Docker & Docker Compose
- Nginx for Proxy
- GitHub Actions for CI/CD

### Project Structure

```
mail-checker/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   └── api/            # API client
│   └── public/             # Static assets
├── backend/                # Node.js backend
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── lib/            # Shared libraries
│   │   ├── middlewares/    # Express middlewares
│   │   ├── scripts/        # Python scripts
│   │   └── utils/          # Utilities
│   └── prisma/             # Database schema
├── docker-compose.yml      # Docker configuration
├── nginx-vps.conf          # Nginx configuration
└── .github/workflows/      # CI/CD workflows
```

### System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Nginx        │    │    Backend      │
│   (React)       │◄──►│  Reverse Proxy   │◄──►│   (Node.js)     │
│   Port: 8080    │    │   Port: 80/443   │    │   Port: 3000    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                │                        ▼
                                │              ┌─────────────────┐
                                │              │   PostgreSQL    │
                                │              │   Database      │
                                │              └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐     ┌─────────────────┐
                       │  Static Assets  │     │  Python Scripts │
                       │   (Frontend)    │     │  (Email Checks) │
                       └─────────────────┘     └─────────────────┘
```

## 📖 API Documentation

### Authentication Endpoints

```
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Domain Check Endpoints

```
POST /api/v1/check            # Full domain check
POST /api/v1/check/mail-echo  # Mail echo test
GET  /api/v1/check/history    # Check history
```

### Swagger Documentation

Access interactive API documentation at:
- Development: `http://localhost:3000/api-docs`
- Production: `https://verimail.codeprephub.com/api-docs/`

## 🛠️ Development Setup

### Quick Start (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/felixrowen/mail-checker.git
cd mail-checker

# 2. Start everything with Docker
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Open browser to http://localhost:5173
```

### Manual Development Setup

**1. Clone & Environment**
```bash
git clone https://github.com/felixrowen/mail-checker.git
cd mail-checker

# Setup environment
cp env.template .env
# Edit .env with your database URL:
# DATABASE_URL="postgresql://verimail:password@localhost:5432/verimail"
# JWT_SECRET="your-secret-token"
```

**2. Database**
```bash
# Start PostgreSQL with Docker
docker run -d --name verimail-db \
  -e POSTGRES_DB=verimail \
  -e POSTGRES_USER=verimail \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15-alpine
```

**3. Backend**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
pip install -r requirements.txt
npm run dev  # Runs on http://localhost:3000
```

**4. Frontend** (New Terminal)
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

**5. Test Application**
- Open `http://localhost:5173`
- Register account & Login with your newly created account
- API docs at `http://localhost:3000/api-docs`
