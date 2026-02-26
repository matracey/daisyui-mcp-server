# Contributing

Thank you for your interest in contributing! Here are some guidelines to help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/<your-repo>.git
   cd <your-repo>
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feat/my-feature
   ```

## Development Workflow

### Build

```bash
npm run build
```

### Test

```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### Lint & Format

```bash
npm run lint          # Check for lint errors
npm run format        # Auto-format code
npm run format:check  # Check formatting
```

## Pull Request Guidelines

- Follow [conventional commits](https://www.conventionalcommits.org/) for commit messages (e.g. `feat:`, `fix:`, `chore:`, `docs:`, `test:`)
- Include tests for new functionality
- Ensure all tests pass and coverage remains above 90%
- Run `npm run lint` and `npm run format:check` before submitting
- Keep PRs focused — one feature or fix per PR

## Reporting Issues

- Use GitHub Issues for bugs and feature requests
- Include your Node.js version, OS, and AI tool when reporting bugs
- Provide steps to reproduce the issue

## Code of Conduct

Be respectful and constructive. We're all here to build something great together.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
