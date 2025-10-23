# BTC ShopFlow Monorepo

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat&logo=vue.js" alt="Vue 3.x" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Micro--Frontend-qiankun-FF6B6B?style=flat" alt="Micro Frontend" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="License" />
</div>


---

An enterprise-grade supply chain management system based on micro-frontend architecture, built with qiankun micro-frontend framework.

## 📋 Project Overview

BTC ShopFlow is a comprehensive supply chain management solution that includes the following core modules:

- **Main App** - System management and micro-frontend container
- **Logistics App** - Logistics management module
- **Production App** - Production planning and management
- **Quality App** - Quality control and inspection
- **Engineering App** - Engineering design and management

## 🏗️ Technical Architecture

### Core Technology Stack

- **Frontend Framework**: Vue 3 + TypeScript
- **Micro Frontend**: qiankun
- **Build Tools**: Vite + Turbo
- **UI Components**: Element Plus + Custom Component Library
- **Styling**: SCSS + UnoCSS
- **Package Manager**: pnpm
- **Code Standards**: ESLint + Prettier + Commitlint

### Project Structure

```
btc-shopflow-monorepo/
├── apps/                          # Applications
│   ├── main-app/                  # Main App (Micro-frontend Container)
│   ├── logistics-app/             # Logistics App
│   ├── production-app/            # Production App
│   ├── quality-app/               # Quality App
│   ├── engineering-app/           # Engineering App
│   └── docs-site/                 # Documentation Site
├── packages/                      # Shared Packages
│   ├── shared-components/         # Shared Component Library
│   ├── shared-core/              # Core Functionality Library
│   ├── shared-utils/             # Utility Functions Library
│   ├── vite-plugin/              # Vite Plugins
│   └── proxy/                    # Proxy Configuration
├── configs/                       # Configuration Files
└── implementation-docs/           # Implementation Documentation
```

## 🚀 Quick Start

### Environment Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install all sub-project dependencies
pnpm install --recursive
```

### Development Mode

```bash
# Start main app development server
pnpm dev:main

# Start all app development servers
pnpm dev:all

# Start specific app
pnpm --filter logistics-app dev
pnpm --filter production-app dev
```

### Build Project

```bash
# Build all applications
pnpm build

# Build specific application
pnpm --filter main-app build
```

## 📦 Package Description

### Shared Packages

- **@btc/shared-components**: General component library, including tables, forms, CRUD components
- **@btc/shared-core**: Core functionality library, including CRUD logic, service management
- **@btc/shared-utils**: Utility functions library, including common utility functions
- **@btc/vite-plugin**: Custom Vite plugins, supporting SVG processing and virtual modules

### Application Packages

- **main-app**: Main application, serving as micro-frontend container and system management
- **logistics-app**: Logistics management application
- **production-app**: Production management application
- **quality-app**: Quality management application
- **engineering-app**: Engineering management application

## 🔧 Development Guide

### Code Standards

The project uses ESLint + Prettier for code formatting and Commitlint for commit message standardization.

```bash
# Code linting
pnpm lint

# Code formatting
pnpm format

# Type checking
pnpm type-check
```

### Commit Standards

Using Conventional Commits standard:

```bash
feat: new feature
fix: bug fix
docs: documentation update
style: code formatting
refactor: refactoring
test: test related
chore: build process or auxiliary tool changes
```

### Component Development

All custom components use the `btc-` prefix and follow these standards:

- Component file naming: `btc-component-name.vue`
- Component registration name: `BtcComponentName`
- Each component needs to provide corresponding README documentation

## 🌐 Micro-Frontend Architecture

### qiankun Configuration

The project uses qiankun to implement micro-frontend architecture:

- **Main App**: Responsible for route management and sub-application loading
- **Sub Apps**: Independent business modules for development and deployment
- **Communication**: Inter-application communication through props and global state management

### Sub-Application Development

Each sub-application is an independent Vue 3 project that supports:

- Independent development and debugging
- Independent build and deployment
- Data communication with the main application
- Shared components and utility libraries

## 📚 Documentation

- [Architecture Design Document](./docs/cool-admin-vue-架构设计文档.md)
- [Implementation Documentation](./implementation-docs/)
- [Component Documentation](./apps/docs-site/)

## 🤝 Contributing Guide

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- Project Maintainer: BTC Team
- Email: support@btc-shopflow.com
- Project Repository: https://github.com/BellisGit/btc-shopflow-monorepo

---

**Note**: This is an enterprise-level project. Please make sure to read the relevant architecture documentation and development guides before development.
