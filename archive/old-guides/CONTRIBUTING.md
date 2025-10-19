# Contributing to OnChainArbitrage

Thank you for your interest in contributing to this project! Here are some guidelines to help you get started.

## 🎯 How to Contribute

### Reporting Bugs
- Use the GitHub issue tracker
- Describe the bug in detail
- Include steps to reproduce
- Mention your environment (OS, Node version, etc.)

### Suggesting Enhancements
- Open an issue with the "enhancement" label
- Clearly describe the feature
- Explain why it would be useful

### Pull Requests
1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run linting (`npm run lint`)
6. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
7. Push to the branch (`git push origin feature/AmazingFeature`)
8. Open a Pull Request

## 🧪 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/OnChainArbitrage.git

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env

# Run tests
npm test

# Compile contracts
npm run compile
```

## 📋 Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `npm run lint:fix` before committing
- Use meaningful variable and function names
- Add comments for complex logic

## ✅ Testing Requirements

- Write tests for all new features
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage
- Test on forked mainnet when possible

## 🔒 Security

- Never commit private keys or sensitive data
- Use `.env.example` for environment templates
- Report security vulnerabilities privately
- Follow smart contract best practices

## 📝 Commit Messages

Use clear and descriptive commit messages:
- `feat: add new arbitrage strategy`
- `fix: correct gas estimation bug`
- `docs: update README with examples`
- `test: add tests for price oracle`
- `refactor: simplify DEX interaction logic`

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!
