# Docker Guide for DFCommerce

## What is Docker?

Docker is a containerization platform that packages your entire application (code + dependencies + runtime) into a **container** that runs consistently everywhere.

**Simple Analogy:** Docker is like shipping a sealed box with everything your app needs inside. No matter where it's opened, it works the same way.

---

## 🐳 Why Docker for DFCommerce?

### Problems Without Docker
```
Developer A (Mac):           Developer B (Windows):       Production (Linux):
├── Python 3.11             ├── Python 3.10              ├── Python 3.9
├── FastAPI v0.95           ├── FastAPI v0.90            ├── FastAPI v0.88
├── SQLite 3.40             ├── SQLite 3.35              ├── SQLite 3.30
└── Works! ✓                └── Broken! ✗                └── Broken! ✗

Result: "Works on my machine" problem
```

### Solution With Docker
```
Docker Container (Sealed Box):
├── Python 3.11 ✓
├── FastAPI v0.95 ✓
├── SQLite 3.40 ✓
├── All dependencies ✓
└── Your code ✓

Works everywhere - Mac, Windows, Linux, Cloud ✓
```

---

## 📁 Docker Files in Your Project

### 1. **Dockerfile**
Blueprint for building the Docker image.

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**What Each Line Does:**

| Line | Purpose |
|------|---------|
| `FROM python:3.11-slim` | Start with Python 3.11 lightweight image |
| `WORKDIR /app` | Create `/app` directory inside container |
| `RUN apt-get update...` | Install system packages (gcc compiler) |
| `COPY requirements.txt .` | Copy Python dependencies list |
| `RUN pip install...` | Install all Python packages |
| `COPY . .` | Copy entire project code |
| `EXPOSE 8000` | Document that app runs on port 8000 |
| `CMD ["uvicorn"...]` | Start FastAPI server when container runs |

### 2. **docker-compose.yml**
Configuration to run Docker containers with proper setup.

```yaml
version: '3.8'

services:
  dfcommerce:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./test.db
      - SECRET_KEY=docker-secret-key-change-in-production
      - ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=30
    volumes:
      - ./test.db:/app/test.db
    command: >
      sh -c "python seed.py && uvicorn main:app --host 0.0.0.0 --port 8000"
```

**Configuration Breakdown:**

| Setting | Purpose |
|---------|---------|
| `build: .` | Build image from Dockerfile in current directory |
| `ports: - "8000:8000"` | Map localhost:8000 → container:8000 |
| `environment:` | Pass environment variables to app |
| `volumes:` | Persist database across container restarts |
| `command:` | Run seed.py first, then start FastAPI |

---

## 🚀 Quick Start

### Step 1: Start Docker Container
```bash
docker-compose up
```

**Output:**
```
Creating dfcommerce_1 ... done
Attaching to dfcommerce_1
dfcommerce_1  | INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Open Browser
```
http://localhost:8000
```

### Step 3: Stop (When Done)
```bash
# Press Ctrl+C in terminal
# OR in another terminal:
docker-compose down
```

---

## 📚 Common Docker Commands

### Build & Run

```bash
# Build image and start container (recommended)
docker-compose up --build

# Start container (uses existing image)
docker-compose up

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# Stop and remove data
docker-compose down -v
```

### View Status

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f dfcommerce

# View specific number of lines
docker-compose logs --tail=50
```

### Execute Commands

```bash
# Run command in container
docker-compose exec dfcommerce python seed.py

# Access Python shell
docker-compose exec dfcommerce python

# Access container terminal
docker-compose exec dfcommerce bash
# or
docker-compose exec dfcommerce sh

# Run a custom command
docker-compose exec dfcommerce sqlite3 test.db "SELECT * FROM users;"
```

### Clean Up

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove everything (careful!)
docker system prune
```

---

## 🔄 Development Workflow

### Local Development with Docker

**Terminal 1: Start Docker**
```bash
docker-compose up
```

**Terminal 2: Make changes to code**
```bash
# Edit files in VS Code
# Changes reflect in running container automatically
```

**Terminal 3: Run commands**
```bash
# Seed database
docker-compose exec dfcommerce python seed.py

# Run migrations
docker-compose exec dfcommerce alembic upgrade head

# Query database
docker-compose exec dfcommerce sqlite3 test.db
```

### Rebuild After Dependency Changes

If you modify `requirements.txt`:

```bash
# Stop current container
docker-compose down

# Rebuild image with new dependencies
docker-compose up --build
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Error:** `bind: address already in use`

**Solution:**
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port in docker-compose.yml
ports:
  - "8001:8000"   # localhost:8001 → container:8000
```

### Container Won't Start

**Error:** `docker-compose up` fails

**Solution:**
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose down
docker-compose up --build

# Full reset
docker-compose down -v
docker-compose up --build
```

### Database Lock Error

**Error:** `database is locked`

**Solution:**
```bash
# Stop all containers
docker-compose down

# Remove database
rm test.db

# Start fresh
docker-compose up
```

### Need to Debug

```bash
# Access container shell
docker-compose exec dfcommerce sh

# Once inside, run commands:
ls                      # List files
python --version        # Check Python version
pip list               # See installed packages
sqlite3 test.db        # Access database
```

---

## 📦 Image Layers (How Docker Works)

Docker builds images in layers, each one cached:

```
Layer 1: FROM python:3.11-slim          (500MB)
         ↓ (cached if unchanged)
Layer 2: RUN apt-get install gcc        (50MB)
         ↓ (cached if unchanged)
Layer 3: COPY requirements.txt .        (1KB)
         ↓ (rebuilt if requirements.txt changed)
Layer 4: RUN pip install                (200MB)
         ↓ (rebuilt if Layer 3 changed)
Layer 5: COPY . .                       (varies)
         ↓
Layer 6: CMD ["uvicorn"...]             (no size)
         ↓
Final Image: ~750MB (sum of layers)
```

**Why this matters:**
- If you only change your code (Layer 5), Docker only rebuilds that layer
- Dependencies (Layer 4) are cached from before
- Rebuilding is fast! ⚡

---

## 💾 Volumes & Data Persistence

### Volume in docker-compose.yml
```yaml
volumes:
  - ./test.db:/app/test.db
```

**What this means:**
```
Your Computer              Container
./test.db ←———————————→ /app/test.db
(outside)                (inside)
```

### Data Persistence Example
```bash
# Start container
docker-compose up

# Add data through app (e.g., create user)

# Stop container
docker-compose down

# Start again
docker-compose up

# Data still there! ✓
```

---

## 🔐 Environment Variables

### In docker-compose.yml
```yaml
environment:
  - DATABASE_URL=sqlite:///./test.db
  - SECRET_KEY=docker-secret-key-change-in-production
  - ALGORITHM=HS256
  - ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### For Production (Better)
Create `.env` file:
```bash
SECRET_KEY=your-real-secret-key-here
DATABASE_URL=postgresql://user:pass@host/dbname
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Then in `docker-compose.yml`:
```yaml
env_file:
  - .env
```

**Important:** Add `.env` to `.gitignore`!

---

## 🌐 Ports & Networking

### Current Setup
```yaml
ports:
  - "8000:8000"
```

Means: `localhost:8000` (outside) → `0.0.0.0:8000` (inside container)

### Access Points
```
From your computer:  http://localhost:8000
From Docker network: http://dfcommerce:8000
From other machines: http://<your-ip>:8000
```

### Adding More Services

If you need a database container:
```yaml
version: '3.8'

services:
  dfcommerce:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/dfcommerce

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dfcommerce
    ports:
      - "5432:5432"
```

---

## 🚢 Deployment

### Push to Docker Hub

1. **Create Docker Hub account** → https://hub.docker.com

2. **Login**
```bash
docker login
# Enter username and password
```

3. **Tag image**
```bash
docker tag dfcommerce:latest yourusername/dfcommerce:latest
```

4. **Push**
```bash
docker push yourusername/dfcommerce:latest
```

### Deploy to Cloud

**AWS:**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker tag dfcommerce:latest <account>.dkr.ecr.us-east-1.amazonaws.com/dfcommerce:latest

docker push <account>.dkr.ecr.us-east-1.amazonaws.com/dfcommerce:latest
```

**Google Cloud Run:**
```bash
gcloud auth configure-docker

docker tag dfcommerce:latest gcr.io/PROJECT_ID/dfcommerce:latest

docker push gcr.io/PROJECT_ID/dfcommerce:latest

gcloud run deploy dfcommerce \
  --image gcr.io/PROJECT_ID/dfcommerce:latest \
  --platform managed \
  --region us-central1
```

---

## 📊 Docker vs Traditional Deployment

### Traditional (No Docker)
```
Production Server:
1. SSH into server
2. Install Python 3.11
3. Install system packages
4. Clone repo
5. Create venv
6. pip install requirements
7. Configure .env
8. Run uvicorn
9. Hope it works! (usually doesn't)
```

### With Docker
```
Production Server:
1. docker pull myimage:latest
2. docker run myimage:latest
3. Done! ✓
```

---

## ✅ Checklist: Ready for Docker

- ✓ Dockerfile exists
- ✓ docker-compose.yml exists
- ✓ requirements.txt has all dependencies
- ✓ .env not in .gitignore (remove if present)
- ✓ Code runs locally first (`python main.py`)
- ✓ Tests pass

---

## 🎯 Next Steps

1. **Test locally with Docker**
   ```bash
   docker-compose up
   ```

2. **Verify everything works**
   - Visit http://localhost:8000
   - Test sign in
   - Add products to cart
   - Create orders

3. **Push to registry**
   ```bash
   docker build -t yourusername/dfcommerce:1.0 .
   docker push yourusername/dfcommerce:1.0
   ```

4. **Deploy to cloud**
   - AWS, Google Cloud, Azure, Heroku, etc.

---

## 📚 Resources

- [Docker Official Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)

---

## 💡 Pro Tips

1. **Always test locally with Docker before deploying**
2. **Use `.dockerignore` to exclude unnecessary files** (like `.git`, `__pycache__`)
3. **Keep images small** - use `python:3.11-slim` not `python:3.11`
4. **Never put secrets in Dockerfile** - use environment variables
5. **Use multi-stage builds for production** - reduces image size
6. **Monitor logs** - `docker-compose logs -f` is your friend
7. **Health checks** - add them for production deployments

---

## Summary

| Concept | Purpose |
|---------|---------|
| **Dockerfile** | Build instructions for image |
| **Image** | Packaged app (binary) |
| **Container** | Running instance of image |
| **docker-compose** | Run containers with config |
| **Volumes** | Persist data |
| **Ports** | Expose services |
| **Environment** | Configuration variables |

**Remember:** Docker ensures your app runs the same everywhere! 🚀
