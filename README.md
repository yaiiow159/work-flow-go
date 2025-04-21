# 🚀 WorkFlowGo

<div align="center">
  
  ![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![Naive UI](https://img.shields.io/badge/Naive_UI-18A058?style=for-the-badge&logo=vue.js&logoColor=white)
  
  <p>A modern interview management and workflow application built with Vue 3, TypeScript, and Naive UI.</p>
  
  [Features](#features) • 
  [Tech Stack](#tech-stack) • 
  [Project Structure](#project-structure) • 
  [Development](#development) • 
  [Learn More](#learn-more)
  
</div>

## ✨ Features

<table>
  <tr>
    <td>
      <h3>🔐 User Authentication</h3>
      <p>Login, registration, and token-based authentication</p>
    </td>
    <td>
      <h3>📅 Interview Management</h3>
      <p>Create, view, edit, and manage interviews</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>📄 Document Management</h3>
      <p>Upload and organize documents</p>
    </td>
    <td>
      <h3>📆 Calendar View</h3>
      <p>Schedule and visualize interviews on a calendar</p>
    </td>
  </tr>
  <tr>
    <td>
      <h3>👤 User Profile</h3>
      <p>Manage user information and settings</p>
    </td>
    <td>
      <h3>🎨 Theme Customization</h3>
      <p>Dark/Light mode, custom colors, compact mode</p>
    </td>
  </tr>
</table>

## 🛠️ Tech Stack

<table>
  <tr>
    <th>Category</th>
    <th>Technologies</th>
  </tr>
  <tr>
    <td>Frontend Framework</td>
    <td>Vue 3 with Composition API and <code>&lt;script setup&gt;</code> syntax</td>
  </tr>
  <tr>
    <td>Type Safety</td>
    <td>TypeScript</td>
  </tr>
  <tr>
    <td>Build Tool</td>
    <td>Vite</td>
  </tr>
  <tr>
    <td>State Management</td>
    <td>Pinia</td>
  </tr>
  <tr>
    <td>UI Components</td>
    <td>Naive UI</td>
  </tr>
  <tr>
    <td>Icons</td>
    <td>PrimeIcons</td>
  </tr>
  <tr>
    <td>Routing</td>
    <td>Vue Router</td>
  </tr>
  <tr>
    <td>HTTP Client</td>
    <td>Axios</td>
  </tr>
  <tr>
    <td>Data Visualization</td>
    <td>Chart.js with Vue-ChartJS</td>
  </tr>
  <tr>
    <td>Date Handling</td>
    <td>date-fns</td>
  </tr>
</table>

## 📁 Project Structure

```
src/
├── assets/          # Static assets like images and fonts
├── components/      # Reusable Vue components
│   ├── layout/      # Layout components (TopBar, MainLayout, etc.)
│   ├── notifications/ # Notification components
│   └── user/        # User-related components (ChangePasswordForm, etc.)
├── router/          # Vue Router configuration
├── services/        # API services and Axios configuration
├── stores/          # Pinia state management stores
│   ├── auth.ts      # Authentication state management
│   ├── theme.ts     # Theme and appearance settings
│   └── ...          # Other stores
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
│   ├── errorHandler.ts # Centralized error handling
│   └── ...          # Other utilities
├── views/           # Page components
└── App.vue          # Root component
```

## 🚀 Recent Improvements

<details>
<summary><b>Enhanced Theme System</b></summary>
<ul>
  <li>Customizable primary color with real-time preview</li>
  <li>Persistent theme settings using localStorage</li>
  <li>Automatic color variant generation for hover and pressed states</li>
</ul>
</details>

<details>
<summary><b>Improved Error Handling</b></summary>
<ul>
  <li>Centralized error handling system</li>
  <li>Console-based error logging for debugging</li>
</ul>
</details>

<details>
<summary><b>User Experience Enhancements</b></summary>
<ul>
  <li>Redesigned password change form with improved validation</li>
  <li>Compact mode option for dense UI layouts</li>
  <li>Default view preference (calendar/list)</li>
</ul>
</details>

<details>
<summary><b>Performance Optimizations</b></summary>
<ul>
  <li>Reduced unnecessary re-renders</li>
  <li>Improved component structure</li>
</ul>
</details>

## 💻 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Modes

The application supports different environment configurations:

```bash
# Development mode
npm run dev:dev

# Production mode
npm run dev:prod

# Build for development
npm run build:dev

# Build for production
npm run build:prod
```

### API Endpoints

The application connects to the following API endpoints:

- **Development**: `http://localhost:8081/api`
- **Production**: `https://work-flow-go-server.onrender.com/api`

## 📚 Learn More

<div align="center">
  
  [![Vue 3](https://img.shields.io/badge/Vue_3-Documentation-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Guide-3178C6?style=flat-square&logo=typescript)](https://vuejs.org/guide/typescript/overview.html)
  [![Vite](https://img.shields.io/badge/Vite-Documentation-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
  [![Pinia](https://img.shields.io/badge/Pinia-State_Management-FFDD56?style=flat-square&logo=vue.js)](https://pinia.vuejs.org/)
  [![Naive UI](https://img.shields.io/badge/Naive_UI-Components-18A058?style=flat-square&logo=vue.js)](https://www.naiveui.com/)
  
</div>

---

<div align="center">
  <sub>Built with ❤️ by the WorkFlowGo Team</sub>
</div>
