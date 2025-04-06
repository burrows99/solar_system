# Solar System Visualization

![Screenshot](src/assets/react.svg)

3D interactive solar system visualization built with React Three Fiber.

## 🐳 Container Setup

### Prerequisites
- Docker installed ([Install Guide](https://docs.docker.com/get-docker/))
- Docker Compose (usually included with Docker Desktop)

### 🚀 Quick Start
1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/solar_system.git
   cd solar_system
   ```

2. **Build container**
   ```bash
   docker-compose build
   ```

3. **Run container**
   ```bash
   docker-compose up -d
   ```

4. **Access application**
   ```
   http://localhost:80
   ```

### 🛠️ Common Commands
**Stop container**
```bash
docker-compose down
```

**Rebuild after changes**
```bash
docker-compose up --build
```

**View logs**
```bash
docker-compose logs -f
```

## Development
```bash
npm install
npm run dev
```

## Features
- Real-scale planetary motion
- Interactive orbital controls
- Dynamic space effects
- Pause/Resume simulation
