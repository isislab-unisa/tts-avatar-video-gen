# DUBME - Cloud-Native 3D Avatar Multimedia Authoring Platform

<div align="center">

[![License: MIT with TTS Exception](https://img.shields.io/badge/License-MIT%20%2B%20TTS%20Exception-blue.svg)](./LICENSE) [![Next.js](https://img.shields.io/badge/Frontend-Next.js-black.svg?logo=next.js)](https://nextjs.org/) [![Go Fiber](https://img.shields.io/badge/Backend-Go%20Fiber-00ADD8.svg?logo=go)](https://gofiber.io/) [![Python](https://img.shields.io/badge/TTS-Python-3776ab.svg?logo=python)](https://www.python.org/) [![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg?logo=mongodb)](https://www.mongodb.com/) [![MinIO](https://img.shields.io/badge/Storage-MinIO-C72C48.svg?logo=minio)](https://min.io/)

**A Full-Stack Platform for Creating Video Content Using 3D Avatars with TTS and Lip-Sync**

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing) • [License](#️-license--important-notice)

</div>

---

## 🎯 Overview

DUBME is an **open-source, cloud-native platform** designed for creating professional multimedia content with 3D avatars. Users can generate personalized video presentations by combining:

- **Text Input** → Converted to natural-sounding speech
- **3D Avatar Model** → Animated with generated audio
- **Video Output** → Professional MP4 video file

You can also manage projects and folders in one environment.

Perfect for:

- E-learning content creation
- Marketing videos
- Training materials
- Accessibility applications
- Custom avatar presentations

---

## ✨ Features

### 🔐 **Authentication & Authorization**

- Email/Password registration and login
- OAuth 2.0 integration (Google, GitHub)
- JWT-based token authentication
- Email verification and password recovery

### 🎨 **Content Management**

- **Project Management:** Create, organize, and manage projects
- **Directory Structure:** Hierarchical organization of content
- **Batch Operations:** Rename, move, and delete items

### 🗣️ **Video Generation**

- **Text-to-Speech (TTS):** Convert text to natural audio
- **3D Avatar Animation:** Lip-sync animation with avatar model
- **Video Output:** Direct MP4 download and preview

### 🌍 **Internationalization (i18n)**

- Supports 4 languages: English (EN), Spanish (ES), French (FR), Italian (IT)
- Language switching on the fly
- Localized UI and error messages

### 💾 **Storage Management**

- **MinIO S3-Compatible Storage:** Scalable file storage
- **MongoDB:** Persistent data storage

### 🔒 **Security**

- JWT token-based API authentication
- CORS protection
- Rate limiting
- Secure OAuth flows
- Environment variable-based configuration

### 🌙 **UI/UX**

- Dark mode and light mode support
- Responsive design (mobile, tablet, desktop)
- Accessible components (WCAG 2.1)
- Intuitive dashboard
- Real-time notifications

---

## 🏗️ Architecture

DUBME uses a **three-tier containerized architecture**:

```
┌─────────────────────┐
│   Frontend Layer    │  Next.js + TypeScript
│  (UI Components,    │  Better Auth, next-intl
│  OAuth, JWT Auth)   │  shadcn/ui + Aceternity
└──────────┬──────────┘
           │ REST API + JWT
┌──────────▼──────────┐
│   Backend Layer     │  Go + Fiber Framework
│  (API Server,       │  Request Handlers
│  JWT Validation)    │  Email Service
│                     │
└──────────┬──────────┘
           │ HTTP Requests
           ├──────────────────┬──────────────────┐
           │                  │                  │
    ┌──────▼─────┐   ┌────────▼──────┐   ┌──────▼────────┐
    │   MongoDB  │   │     MinIO     │   │ Flask Server  │
    │ (Database) │   │ (S3 Storage)  │   │ (Python 7001) │
    └────────────┘   └───────────────┘   │ - TTS Engine  │
                                         │ - Video Gen   │
                                         └───────────────┘
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (v20+)
- **Python 3.11+** (for Flask server)
- **Node.js 18+** (for local frontend development)
- **Git** with Git LFS

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Antonio-Caiazzo/DUBME.git
cd DUBME
```

### 2️⃣ Setup Git LFS (for large files)

Large media files and Unity binaries are tracked with Git LFS:

```bash
# Install Git LFS (if not already installed)
brew install git-lfs  # macOS
# or visit https://git-lfs.github.com for other platforms

# Initialize Git LFS in the repository
git lfs install
git lfs pull
```

### 3️⃣ Configure Environment Variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

See [Environment Variables](#-environment-variables) section below.

### 4️⃣ Start Docker Services (MongoDB, MinIO, Backend, Frontend)

```bash
docker-compose up -d
```

### 5️⃣ Start Python Flask Server

In a separate terminal:

```bash
cd generator
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r tts/requirements.txt
python server.py
```

The Flask server will start on `http://localhost:7001`.

### 6️⃣ Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **MinIO Console:** http://localhost:9090 (credentials: minioadmin/minioadmin)
- **MongoDB:** mongodb://localhost:27017

### 7️⃣ Development Mode (Optional)

For development without authentication:

```bash
# Already enabled in .env.example with DEV_MODE=true
# This bypasses login and uses a test user automatically
```

---

## 📋 Environment Variables

### Frontend Configuration

```env
# Better Auth Setup
BETTER_AUTH_SECRET=your_better_auth_secret_here
  # Purpose: Secret key for Better Auth encryption
  # Generate: openssl rand -base64 32

BETTER_AUTH_URL=http://localhost:3000
  # Purpose: URL where Better Auth callbacks are handled
  # Format: http://domain.com (no trailing slash)

NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
  # Purpose: Public URL for frontend auth client (can be exposed to browser)
  # Must be same as BETTER_AUTH_URL

EMAIL_VERIFICATION_CALLBACK_URL=http://localhost:3000/email-verified
  # Purpose: URL user is redirected to after email verification
  # Format: Full URL to verification success page

MONGODB_URI=mongodb://localhost:27017/dubme
  # Purpose: MongoDB connection string (used by Better Auth for user storage)
  # Format: mongodb://host:port/database or connection string with auth

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
  # Get from: https://console.cloud.google.com

GOOGLE_CLIENT_SECRET=your_google_client_secret
  # Get from: https://console.cloud.google.com

GITHUB_CLIENT_ID=your_github_client_id
  # Get from: https://github.com/settings/developers

GITHUB_CLIENT_SECRET=your_github_client_secret
  # Get from: https://github.com/settings/developers

# Email Configuration (Optional - for email verification)
GMAIL_USER=your_email@gmail.com
  # Purpose: Gmail account for sending verification emails
  # Note: Use app-specific password, not main password

GMAIL_PASS=your_app_password
  # Generate: https://support.google.com/accounts/answer/185833

# Backend API URLs
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:4000
  # Purpose: Backend API URL exposed to browser
  # Format: http://domain:port (no trailing slash)

BACKEND_API_URL=http://localhost:4000
  # Purpose: Backend API URL for server-side requests (Next.js middleware)
  # Can differ from public URL in production

API_JWT_SECRET=your_jwt_secret_here
  # Purpose: Secret for JWT token validation
  # Must match backend JWT_SECRET
  # Generate: openssl rand -base64 32
```

### Backend Configuration (Go + Fiber)

```env
# Server Port
PORT=4000
  # Purpose: Internal port where Go API server listens
  # In Docker: internal port (exposed via docker-compose)

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
  # Purpose: MongoDB connection endpoint
  # In Docker: Use mongodb://mongo:27017 (service name)

MONGO_DB=dubme
  # Purpose: Database name for projects, directories, metadata
  # Convention: lowercase, no spaces

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://frontend:3000
  # Purpose: Allowed origins for cross-origin requests
  # In Docker: Use http://frontend:3000 (service name)
  # Comma-separated list of allowed URLs

# JWT Secret
API_JWT_SECRET=your_jwt_secret_here
  # Purpose: Secret for JWT token validation
  # Must match NEXT API_JWT_SECRET
  # Generate: openssl rand -base64 32

# Test Video Asset (Temporary)
GENERATOR_TEST_MP4=assets/test.mp4
  # Purpose: Fallback video if Flask server is unavailable
  # Used for: Testing, development, error scenarios
  # File location: relative to backend/ directory

# Flask/Python Generator Service
GENERATOR_URL=http://generator:7001
  # Purpose: URL to reach Flask server
  # In Docker: http://generator:7001 (service name)
  # Locally: http://host.docker.internal:7001
  # Alternative: http://localhost:7001 (if Flask on same network)
```

### MinIO Configuration

```env
MINIO_ENDPOINT=localhost:9000
  # Purpose: MinIO server address
  # Format: host:port (no http://)
  # In Docker: Use minio:9000 (service name)

MINIO_ROOT_USER=minioadmin
  # Purpose: MinIO admin username
  # Default: minioadmin

MINIO_ROOT_PASSWORD=minioadmin
  # Purpose: MinIO admin password
  # Default: minioadmin
  # Change in production!

MINIO_BUCKET=dubme
  # Purpose: S3 bucket name for storing generated videos
  # Convention: lowercase, no special chars

MINIO_USE_SSL=false
  # Purpose: Whether to use HTTPS for MinIO
  # Default: false for local development
  # Set to: true in production

MINIO_PUBLIC_URL=http://localhost:9000
  # Purpose: Public URL for accessing files
  # Used for: Direct file links, CDN configuration
```

### Development Mode

```env
DEV_MODE=true
  # Purpose: Enable development mode (bypasses authentication)
  # Values: true or false
  # When true:
  #   - No login required
  #   - All API endpoints accessible
  #   - Auto-login with dev user
  # When false:
  #   - Normal authentication required
  #   - JWT validation enforced

DEV_USER_ID=dev-user-local
  # Purpose: User ID for development mode
  # Only used when DEV_MODE=true
  # Can be any identifier
```

### Difference: Development Mode vs Production Mode

| Aspect             | DEV_MODE=true | DEV_MODE=false |
| ------------------ | ------------- | -------------- |
| Authentication     | Bypassed      | Required       |
| Login Page         | Skipped       | Visible        |
| User Context       | Auto dev-user | From JWT token |
| Email Verification | Skipped       | Required       |
| API Access         | Unrestricted  | Token-based    |

**Use `DEV_MODE=true` only for local development. Always set `DEV_MODE=false` in production.**

---

## 📦 Installation Guide for Full Local Development (No Docker)

```bash
# Backend
cd backend
go build
./backend

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Generator (new terminal)
cd generator
python3 -m venv .venv
source .venv/bin/activate
pip install -r tts/requirements.txt
python server.py
```

---

## 🎮 Usage Guide

### Creating Your First Video

1. **Log In / Sign Up**

   - Use email or OAuth providers (Google, GitHub)
   - In dev mode, automatically logged in

2. **Create a Project**

   - Click "New Project"
   - Enter project name and description
   - Save

3. **Add Video Content**

   - Within project, click "Generate Video"
   - Enter text to convert to speech
   - Choose avatar
   - Click "Generate"
   - Wait for video generation

4. **Download or Preview**
   - Preview video in player
   - Download as MP4
   - Save to storage

---

## 🔧 Configuration & Customization

### Changing Languages

Supported languages: English, Spanish, French, Italian

**Frontend language files:** `/frontend/messages/`

```
messages/
├── en.json  (English)
├── es.json  (Spanish)
├── fr.json  (French)
└── it.json  (Italian)
```

Add new language:

1. Create `messages/[lang].json`
2. Update `frontend/i18n/request.ts`
3. Add language option in language switcher component

### Video Generator Avatar Model

The 3D avatar model is configured in:

- **macOS:** `/generator/TestMac.app/` (Unity binary)
- **Windows:** `/generator/stv-win/VideoGenerator.exe`

### Scaling Video Generation

For production workloads, Flask server can be:

- **Replicated:** Multiple Flask instances with load balancer
- **Dedicated Server:** Run Flask on separate machine/container
- **Kubernetes:** Deploy Flask as separate deployment

Update `GENERATOR_URL` to point to load balancer or service endpoint.

---

## 📚 API Documentation

### Authentication Endpoints

**POST** `/api/auth/register`

```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "User Name"
}
```

**POST** `/api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**POST** `/api/auth/logout`

- Requires: JWT token in Authorization header

### Project Endpoints

**GET** `/api/projects`

- Fetch all projects for authenticated user
- Headers: `Authorization: Bearer <JWT_TOKEN>`

**POST** `/api/projects`

```json
{
  "name": "My First Video",
  "description": "Project description"
}
```

**GET** `/api/projects/:id`

- Fetch specific project with metadata

**PUT** `/api/projects/:id`

```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**DELETE** `/api/projects/:id`

- Delete a project

### Video Generation Endpoints

**POST** `/api/generate`

```json
{
  "text": "Hello, I am an AI avatar",
  "avatar": "male",
  "title": "My First Video",
  "bgColor": "#ffffff"
}
```

**Response:**

- Returns: MP4 video stream
- Header: `X-Generator-Output` contains generated video path

**POST** `/api/generate/cleanup`

```json
{
  "path": "generated/my_video.mp4"
}
```

---

## 🧪 Testing

### Unit Tests

To Do

### Integration Tests

To Do

### System Tests

To Do

### Manual Testing

1. Start all services
2. Navigate to http://localhost:3000
3. Test workflow:
   - Sign up → Email verification → Create project → Generate video → Download

---

## 📖 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and components
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [LICENSE](./LICENSE) - Non-commercial license

---

## 🤝 Contributing

This is an **open-source project** welcoming contributions!

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Code of Conduct
- How to contribute
- Development setup
- Pull request process

---

## ⚖️ License & Important Notice

### 📋 Core License: MIT (Fully Open Source)

**All source code and project resources are released under the MIT License**, making DUBME fully open source and free for both personal and commercial use.

**✅ You CAN:**

- Use for personal, educational, and commercial projects
- Use for research and development
- Modify and fork the code
- Include in commercial products
- Use for for-profit business operations (⚠️ ATTENTION: not in this first release, read below)
- Share and distribute (with proper attribution)

**❌ You CANNOT:**

- Remove or modify license notices
- Claim original authorship
- Hold the authors liable

For full license details, see [LICENSE](./LICENSE) file.

---

### ⚠️ Important Exception: Coqui XXTS-v2 TTS Model

There is **one exception** to the MIT license:

**The Coqui XXTS-v2 Text-to-Speech (TTS) model** included in this project is distributed under the [Coqui Public Model License 1.0.0](https://coqui.ai/cpml.txt), which restricts usage to **non-commercial purposes only**.

This means:

- ✅ **Allowed:** Personal projects, education, non-commercial research, non-profits
- ❌ **NOT Allowed:** Commercial use, revenue-generating services, for-profit operations

**Anyone using the TTS model or its outputs must comply with the Coqui Public Model License.**

---

### 🚀 Future: Fully Open Source TTS

**We are actively working to replace the Coqui XXTS-v2 model with an alternative open-source TTS solution** that has no commercial restrictions. This effort aims to make DUBME completely open source under MIT license without exceptions.

**Expected timeline:** Upcoming releases will feature a fully unrestricted open-source TTS engine, eliminating this limitation.

---

## 📊 Project Status

- ✅ Core functionality: Stable
- ✅ Authentication: Implemented
- ✅ Video generation: Implemented
- 🚧 New avatars: In development
- 🚧 Linux support: Planned

---

## 📧 Support & Contact

- **Issues:** GitHub Issues (bug reports, feature requests)
- **Discussions:** GitHub Discussions (Q&A, ideas)
- **Email:** See repository profile

---

<div align="center">

**Made with ❤️ by the DUBME Community**

[Star us on GitHub](https://github.com/Antonio-Caiazzo/DUBME) • [Report an Issue](https://github.com/Antonio-Caiazzo/DUBME/issues) • [Contributing](./CONTRIBUTING.md)

</div>
