# Contributing to DUBME

Thank you for your interest in contributing to DUBME! We welcome contributions from developers, designers, and enthusiasts of all levels.

## Code of Conduct

### Our Commitment

We are committed to providing a welcoming and inspiring community for all. Please read and adhere to our Code of Conduct:

- **Be Respectful:** Treat all community members with respect and kindness
- **Be Inclusive:** Welcome people of all backgrounds and experiences
- **Be Collaborative:** Work together to solve problems and improve the project
- **Be Professional:** Keep discussions focused on the project and professional
- **Report Issues:** Use appropriate channels to report violations of this code

Violations of the Code of Conduct may result in removal from the project and community.

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Git** with Git LFS installed (`git lfs install`)
- **Node.js 18+** (for frontend development)
- **Go 1.21+** (for backend development)
- **Python 3.11+** (for Flask server development)
- **Docker & Docker Compose** (for containerized development)
- **MongoDB** (for local database testing)
- **Basic understanding of:**
  - React/TypeScript
  - Go programming
  - REST API design
  - Git/GitHub workflow

### Development Setup

1. **Fork the repository**

   ```bash
   # Visit https://github.com/Antonio-Caiazzo/DUBME and click "Fork"
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/DUBME.git
   cd DUBME
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/Antonio-Caiazzo/DUBME.git
   git fetch upstream
   ```

4. **Create development branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

5. **Setup environment**

   ```bash
   # Copy example env file
   cp .env.example .env

   # Edit .env with your local configuration
   # For development: DEV_MODE=true
   ```

6. **Install dependencies**

   ```bash
   # Frontend
   cd frontend
   npm install
   cd ..

   # Backend dependencies are managed by Go modules
   # TTS dependencies
   cd generator/tts
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cd ../../
   ```

7. **Start Docker services** (in separate terminal)

   ```bash
   docker-compose up -d
   ```

8. **Run development servers** (each in separate terminal)

   ```bash
   # Frontend
   cd frontend
   npm run dev

   # Backend
   cd backend
   go run main.go

   # Flask server
   cd generator
   source .venv/bin/activate
   python server.py
   ```

9. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Flask Server: http://localhost:7001

---

## Types of Contributions

### 🐛 Bug Reports

Found a bug? Please report it!

1. **Search existing issues** first (it may already be reported)
2. **Create a new issue** with:
   - **Title:** Clear, concise description
   - **Description:** What happened vs. what should happen
   - **Steps to reproduce:** Detailed reproduction steps
   - **Environment:** OS, Node/Go version, Python version
   - **Screenshots:** If applicable
   - **Error logs:** Full error messages or stack traces

**Example:**

```markdown
**Title:** Video generation fails with non-ASCII characters

**Description:**
When generating a video with text containing special characters (é, ñ, etc.),
the Flask server returns a 500 error.

**Steps to reproduce:**

1. Navigate to Generate Video page
2. Enter text: "Café naïveté"
3. Click "Generate"
4. Server returns error

**Expected:** Video generates successfully
**Actual:** HTTP 500 error

**Environment:** macOS 14.0, Python 3.11, Node 18.x
```

### ✨ Feature Requests

Want a new feature?

1. **Describe the feature:** What problem does it solve?
2. **Provide examples:** How would users interact with it?
3. **Suggest implementation:** Any ideas how to build it?

**Example:**

```markdown
**Title:** Support for RTL languages (Arabic, Hebrew)

**Description:**
Add support for right-to-left languages in the UI and video generation.

**Use case:**
Users in Middle East and North Africa regions need RTL UI support.

**Proposed implementation:**

1. Add RTL detection based on language
2. Update CSS for RTL layout (flex-direction, text-align)
3. Support RTL in TTS engine
```

### 🔧 Code Contributions

Contributing code? Great! Follow these guidelines:

#### Before You Start

1. **Check issue tracker:** Look for existing issues or PRs addressing this
2. **Discuss major changes:** Open an issue first for large features
3. **Understand the architecture:** Read ARCHITECTURE.md
4. **Follow the coding standards:** See below

#### Coding Standards

**Frontend (TypeScript/React)**

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  email: string;
  name: string;
}

const UserCard: React.FC<{ user: UserProfile }> = ({ user }) => {
  return <div>{user.name}</div>;
};

// ❌ Avoid
const UserCard = (props) => {
  return <div>{props.user.name}</div>;
};
```

**Backend (Go)**

```go
// ✅ Good
func (h *ProjectHandler) GetProject(c *fiber.Ctx) error {
    id := c.Params("id")
    project, err := h.db.FindProjectByID(id)
    if err != nil {
        return fiber.NewError(fiber.StatusNotFound, "project not found")
    }
    return c.JSON(project)
}

// ❌ Avoid
func GetProject(c *fiber.Ctx) error {
    id := c.Params("id")
    project := h.db.FindProject(id)
    return c.JSON(project)
}
```

**Python (Flask)**

```python
# ✅ Good
def generate_video(text: str, voice_gender: str) -> str:
    """Generate video from text using TTS and avatar model."""
    audio_path = generate_tts(text, voice_gender)
    video_path = generate_video_from_audio(audio_path)
    return video_path

# ❌ Avoid
def gen(t, v):
    a = tts(t, v)
    return vid(a)
```

#### General Principles

- **Single Responsibility:** Each function/component does one thing
- **DRY:** Don't Repeat Yourself
- **KISS:** Keep It Simple, Stupid
- **Error Handling:** Always handle errors gracefully
- **Type Safety:** Use TypeScript and Go typing
- **Comments:** Explain WHY, not WHAT
- **Testing:** Write tests for new features

#### Commit Guidelines

Write clear, descriptive commit messages:

```bash
# ✅ Good
git commit -m "feat: Add RTL language support

- Add RTL detection based on language config
- Update CSS for RTL layouts
- Support RTL in TTS engine
- Add tests for RTL rendering"

# ❌ Avoid
git commit -m "fix stuff"
git commit -m "updates"
git commit -m "WIP"
```

**Commit message format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (formatting, semicolons, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `test:` Adding tests
- `chore:` Maintenance, dependencies

**Example:**

```
feat(auth): Add GitHub OAuth integration

- Add GitHub OAuth strategy to Better Auth config
- Create GitHubAuthButton component
- Add GitHub client ID/secret to .env.example
- Test OAuth flow on dev server

Closes #123
```

### 📚 Documentation

Documentation improvements are always welcome!

- **README updates:** New features, setup changes
- **API documentation:** Endpoint descriptions
- **Architecture docs:** System design, component descriptions
- **Tutorials:** How-to guides
- **Translations:** Help translate docs to other languages

---

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest upstream

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests** locally

   ```bash
   # Backend
   cd backend
   go test ./...

   # Frontend
   cd frontend
   npm test
   ```

3. **Lint your code**

   ```bash
   # Frontend
   cd frontend
   npm run lint
   ```

4. **Test your changes manually** with dev server

### Submitting the Pull Request

1. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a PR on GitHub**

   - Use the PR template (if available)
   - Reference related issues: `Closes #123`
   - Provide clear description of changes

3. **PR Title Format**

   ```
   [scope] description
   # Examples:
   # [frontend] Add RTL language support
   # [backend] Fix project deletion cascade
   # [docs] Update installation guide
   ```

4. **PR Description Template**

   ```markdown
   ## Description

   Brief description of what this PR does.

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Code refactoring

   ## Changes

   - Change 1
   - Change 2
   - Change 3

   ## Related Issues

   Closes #123

   ## Testing

   How did you test these changes?

   ## Screenshots (if applicable)

   Add screenshots or GIFs showing the changes.

   ## Checklist

   - [ ] Code follows project style guidelines
   - [ ] I have performed a self-review
   - [ ] I have commented my code (especially complex logic)
   - [ ] Tests pass locally
   - [ ] No new warnings generated
   - [ ] Documentation updated if needed
   ```

### Review Process

- **At least one maintainer review** is required
- **GitHub Actions** must pass (tests, linting)
- **Discussions may occur** - be responsive and open to feedback
- **Changes may be requested** - update your PR accordingly

---

## Testing

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Backend Tests

```bash
cd backend

# Run all tests
go test ./...

# Run specific test
go test ./handlers -run TestGenerate

# Run with coverage
go test -cover ./...
```

### Integration Testing

```bash
# Start dev servers first (Docker + all services)

# Run integration tests
npm run test:integration
```

### Manual Testing Checklist

Before submitting a PR, manually test:

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Error cases handled gracefully
- [ ] Responsive on mobile/tablet
- [ ] Dark mode works
- [ ] All languages display correctly
- [ ] Video generation completes
- [ ] File download works
- [ ] User authentication flow works

---

## Project Structure

```
DUBME/
├── frontend/              # Next.js frontend
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and helpers
│   ├── messages/         # i18n translations
│   └── package.json
│
├── backend/              # Go Fiber backend
│   ├── handlers/         # API endpoint handlers
│   ├── models/           # Data models
│   ├── db/               # Database connections
│   ├── storage/          # MinIO integration
│   └── main.go
│
├── generator/            # Flask Python server
│   ├── server.py         # Flask app
│   ├── tts/              # Text-to-Speech engine
│   ├── stv-win/          # Windows video generator
│   └── TestMac.app/      # macOS video generator
│
├── docker-compose.yml    # Container orchestration
├── README.md             # Project documentation
├── ARCHITECTURE.md       # Architecture documentation
└── CONTRIBUTING.md       # This file
```

---

## Common Issues & Solutions

### Git LFS Not Working

```bash
# Reinstall Git LFS
brew install git-lfs
git lfs install --force

# Re-pull files
git lfs pull
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :4000  # Backend
lsof -i :7001  # Flask

# Kill process
kill -9 <PID>
```

### Docker Issues

```bash
# Rebuild containers
docker-compose down
docker system prune -a
docker-compose up -d --build

# Check container logs
docker-compose logs -f <service>
```

### MongoDB Connection Error

```bash
# Verify MongoDB is running
docker-compose ps mongo

# Reset MongoDB
docker-compose down -v
docker-compose up -d mongo
```

---

## Communication

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** Q&A and ideas
- **Pull Request Comments:** Code review discussions
- **Email:** For security issues or sensitive topics

---

## Recognition

Contributors will be:

- Listed in the README's Acknowledgments section (if desired)
- Mentioned in release notes for significant contributions
- Added to CONTRIBUTORS.md file

---

## License Reminder

By contributing to DUBME, you agree that your contributions will be licensed under the same non-commercial license as the project.

**Important:** Your contributions must not violate any existing licenses or intellectual property rights.

---

## Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Go Fiber Documentation](https://docs.gofiber.io)
- [MongoDB Documentation](https://docs.mongodb.com)

---

## Questions?

Don't hesitate to ask! We're here to help:

- Open an issue with the `[question]` tag
- Check existing discussions
- Review ARCHITECTURE.md for system overview

Thank you for contributing to DUBME! 🎉
