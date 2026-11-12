# Contributing to Tradigoo

Thank you for your interest in contributing to Tradigoo! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Tradigoo_Live.git
cd Tradigoo_Live

# 3. Add upstream remote
git remote add upstream https://github.com/Simarjot846/Tradigoo_Live.git

# 4. Install dependencies
npm install
cd pathway-backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cd ..

# 5. Create a branch for your feature
git checkout -b feature/your-feature-name
```

## 🔄 Development Workflow

### 1. Sync with Upstream

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 3. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test

# Test manually
npm run dev
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

- Go to GitHub and create a Pull Request
- Fill out the PR template
- Link related issues
- Request review

## 💻 Coding Standards

### TypeScript/JavaScript

```typescript
// ✅ Good
export function calculateTrustScore(user: User): number {
  const baseScore = 500;
  const successBonus = user.successfulOrders * 10;
  const disputePenalty = user.disputes * 50;
  
  return baseScore + successBonus - disputePenalty;
}

// ❌ Bad
export function calc(u: any) {
  return 500 + u.orders * 10 - u.disputes * 50;
}
```

**Rules:**
- Use TypeScript for type safety
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public functions
- Avoid `any` type
- Use async/await over promises

### React Components

```typescript
// ✅ Good
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{product.description}</p>
      </CardContent>
    </Card>
  );
}

// ❌ Bad
export function ProductCard(props: any) {
  return <div>{props.product.name}</div>;
}
```

**Rules:**
- Use functional components
- Define prop types with interfaces
- Use descriptive component names
- Keep components small and focused
- Extract reusable logic to hooks

### Python (Pathway Backend)

```python
# ✅ Good
async def fetch_live_weather(city: str) -> WeatherData:
    """
    Fetch current weather data for a city.
    
    Args:
        city: Name of the city
        
    Returns:
        WeatherData object with temperature and conditions
    """
    response = await http_client.get(f"{API_URL}?q={city}")
    return WeatherData.from_json(response.json())

# ❌ Bad
async def get_weather(c):
    r = await http_client.get(f"{API_URL}?q={c}")
    return r.json()
```

**Rules:**
- Use type hints
- Add docstrings for functions
- Follow PEP 8 style guide
- Use async/await for I/O operations
- Handle errors gracefully

### CSS/Tailwind

```tsx
// ✅ Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
</div>

// ❌ Bad
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out border border-gray-200">
  <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Title</h2>
</div>
```

**Rules:**
- Use Tailwind utility classes
- Keep class names readable
- Extract repeated patterns to components
- Use semantic HTML elements
- Ensure accessibility (ARIA labels, keyboard navigation)

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(dashboard): add live weather widget"

# Bug fix
git commit -m "fix(auth): resolve token expiration issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(api): simplify error handling logic"
```

### Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Limit first line to 72 characters
- Reference issues in footer (`Fixes #123`)

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No console errors
- [ ] Responsive design tested

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added
- [ ] Documentation updated
```

### Review Process

1. Maintainer reviews code
2. Feedback provided (if needed)
3. You make requested changes
4. Maintainer approves
5. PR merged to main

## 🧪 Testing

### Unit Tests

```typescript
// Example test
import { calculateTrustScore } from './trust-score';

describe('calculateTrustScore', () => {
  it('should calculate correct score for successful orders', () => {
    const user = {
      successfulOrders: 10,
      disputes: 0,
      lateDeliveries: 0,
      qualityRating: 4.5
    };
    
    expect(calculateTrustScore(user)).toBe(609);
  });
});
```

### Integration Tests

```typescript
// Example E2E test
import { test, expect } from '@playwright/test';

test('user can place order', async ({ page }) => {
  await page.goto('/marketplace');
  await page.click('text=Organic Wheat');
  await page.fill('input[name="quantity"]', '100');
  await page.click('button:has-text("Place Order")');
  
  await expect(page).toHaveURL(/\/order\/confirm/);
});
```

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Pathway Documentation](https://pathway.com/developers/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Best Practices](https://react.dev/learn)

## 🤔 Questions?

- Open an issue for bugs
- Start a discussion for questions
- Join our community chat

## 🙏 Thank You!

Your contributions make Tradigoo better for everyone. We appreciate your time and effort!

---

**Happy Coding! 🚀**
