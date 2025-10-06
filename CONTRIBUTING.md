# Contributing to PlantKit

Thank you for your interest in contributing to PlantKit! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please be considerate and professional in all interactions.

## Getting Started

### Prerequisites

- **Node.js** (LTS version recommended)
- **npm** (comes with Node.js)
- **Git**

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/plantkit.git
cd plantkit
```

1. Add the upstream repository:

```bash
git remote add upstream https://github.com/localgod/plantkit.git
```

## Development Environment

### Local Setup

1. **Install dependencies:**

```bash
npm install
```

1. **Build the project:**

```bash
npm run build
```

1. **Run tests:**

```bash
npm test
```

### Using Gitpod (Recommended)

PlantKit includes a pre-configured development environment using Gitpod:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/localgod/plantkit)

The Gitpod environment includes:

- Node.js LTS
- All project dependencies
- Pre-configured dev container

## Development Workflow

### Available Scripts

- **`npm run build`** - Compile TypeScript to JavaScript
- **`npm run dev`** - Watch mode for development
- **`npm test`** - Run tests with Vitest
- **`npm run test:coverage`** - Run tests with coverage report
- **`npm run lint`** - Lint source code with ESLint
- **`npm run lint:fix`** - Auto-fix linting issues
- **`npm run mdlint`** - Lint markdown files

### Making Changes

1. **Create a feature branch:**

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:

- `feature/add-new-element-type`
- `fix/diagram-rendering-bug`
- `docs/improve-api-documentation`

1. **Make your changes:**
   - Write clean, readable code
   - Follow existing code style and patterns
   - Add tests for new functionality
   - Update documentation as needed

1. **Test your changes:**

```bash
npm run lint
npm run mdlint
npm test
npm run build
```

1. **Commit your changes:**

```bash
git add .
git commit -m "feat: add support for new ArchiMate element type"
```

### Commit Message Guidelines

We follow conventional commit format:

- **`feat:`** - New feature
- **`fix:`** - Bug fix
- **`docs:`** - Documentation changes
- **`test:`** - Adding or updating tests
- **`refactor:`** - Code refactoring
- **`chore:`** - Maintenance tasks
- **`style:`** - Code style changes (formatting, etc.)

Examples:

```typescript
feat: add support for ArchiMate 3.2 elements
fix: correct relationship direction in ElementGraph
docs: update API reference for Diagram class
test: add coverage for edge cases in PlantKit.toValidElementName
```

## Coding Standards

### TypeScript

- Use **TypeScript** for all source code
- Enable strict type checking
- Provide type definitions for all public APIs
- Use meaningful variable and function names

### Code Style

- **Indentation:** 4 spaces (configured in project)
- **Quotes:** Single quotes for strings
- **Semicolons:** Not required (project uses ASI)
- **Line length:** Keep reasonable (ESLint configured)
- Follow existing patterns in the codebase

### File Organization

```bash
src/
├── archimate/          # ArchiMate-specific implementations
├── Diagram.mts         # Diagram generation
├── Element.mts         # Element tree structures
├── ElementGraph.mts    # Relationship graphs
├── PlantKit.mts        # Utility functions
└── index.mts           # Public API exports

tests/
├── *.test.mts          # Test files mirror src/ structure
```

### Documentation

- Add JSDoc comments for public APIs
- Document complex logic with inline comments
- Update README.md for user-facing changes
- Include examples for new features

## Testing

### Writing Tests

- Use **Vitest** for testing
- Place tests in `tests/` directory
- Name test files: `*.test.mts`
- Follow existing test patterns

Example test structure:

```typescript
import { describe, expect, it, beforeEach } from 'vitest';
import { YourClass } from '../src/YourClass.mjs';

describe('YourClass', () => {
  let instance: YourClass;

  beforeEach(() => {
    instance = new YourClass();
  });

  it('should do something specific', () => {
    const result = instance.method();
    expect(result).toBe(expectedValue);
  });
});
```

### Test Coverage

- Aim for high test coverage (current coverage visible in PRs)
- Test edge cases and error conditions
- Include integration tests for complex features

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode during development
npm run dev  # In one terminal
npm test     # In another terminal
```

## Submitting Changes

### Pull Request Process

1. **Update your fork:**

```bash
git fetch upstream
git rebase upstream/main
```

1. **Push to your fork:**

```bash
git push origin feature/your-feature-name
```

1. **Create a Pull Request:**
   - Go to the [PlantKit repository](https://github.com/localgod/plantkit)
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template

### Pull Request Guidelines

- **Title:** Clear, descriptive title following commit conventions
- **Description:** Explain what changes you made and why
- **Link issues:** Reference related issues (e.g., "Fixes #123")
- **Tests:** Ensure all tests pass
- **Documentation:** Update docs if needed
- **Small PRs:** Keep changes focused and manageable

### PR Checklist

Before submitting, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint` and `npm run mdlint`)
- [ ] Build succeeds (`npm run build`)
- [ ] New tests added for new functionality
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow conventions
- [ ] Branch is up-to-date with main

### CI/CD

All pull requests automatically run:

- **Linting** - ESLint and markdownlint
- **Tests** - Full test suite with coverage
- **Build** - TypeScript compilation

PRs must pass all checks before merging.

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Description:** Clear description of the issue
2. **Steps to reproduce:** Minimal steps to reproduce the bug
3. **Expected behavior:** What you expected to happen
4. **Actual behavior:** What actually happened
5. **Environment:**
   - PlantKit version
   - Node.js version
   - Operating system
6. **Code sample:** Minimal code that demonstrates the issue

### Issue Template

```markdown
**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- PlantKit version: 1.0.4
- Node.js version: 22.20.0
- OS: Ubuntu 24.04

**Code Sample:**
\`\`\`typescript
// Minimal code to reproduce
\`\`\`
```

## Feature Requests

We welcome feature requests! Please:

1. **Search existing issues** to avoid duplicates
2. **Describe the feature** clearly
3. **Explain the use case** - why is this needed?
4. **Provide examples** - how would it work?
5. **Consider alternatives** - are there other solutions?

### Feature Request Template

```markdown
**Feature Description:**
Clear description of the proposed feature

**Use Case:**
Why is this feature needed? What problem does it solve?

**Proposed Solution:**
How should this feature work?

**Example Usage:**
\`\`\`typescript
// Example code showing how the feature would be used
\`\`\`

**Alternatives Considered:**
Other approaches you've considered
```

## Additional Resources

- **Documentation:** [README.md](README.md)
- **Examples:** [examples/](examples/)
- **Issue Tracker:** [GitHub Issues](https://github.com/localgod/plantkit/issues)
- **Discussions:** [GitHub Discussions](https://github.com/localgod/plantkit/discussions)

## Questions?

If you have questions about contributing:

1. Check existing [documentation](README.md)
2. Search [closed issues](https://github.com/localgod/plantkit/issues?q=is%3Aissue+is%3Aclosed)
3. Open a [discussion](https://github.com/localgod/plantkit/discussions)
4. Create an [issue](https://github.com/localgod/plantkit/issues/new)

## Recognition

Contributors are recognized in:

- Git commit history
- Release notes
- Project acknowledgments

Thank you for contributing to PlantKit! 🎉
