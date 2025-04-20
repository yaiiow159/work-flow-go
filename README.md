# WorkFlowGo

A modern interview management and workflow application built with Vue 3, TypeScript, and Vite.

## Features

- **User Authentication**: Login, registration, and OAuth2 integration with Google
- **Interview Management**: Create, view, edit, and manage interviews
- **Document Management**: Upload and organize documents
- **Calendar View**: Schedule and visualize interviews on a calendar
- **User Profile**: Manage user information and settings
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend Framework**: Vue 3 with Composition API and `<script setup>` syntax
- **Type Safety**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **UI Components**: Naive UI
- **Styling**: TailwindCSS and SASS
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Data Visualization**: Chart.js with Vue-ChartJS
- **Date Handling**: date-fns

## Project Structure

```
src/
├── assets/          # Static assets like images and fonts
├── components/      # Reusable Vue components
│   ├── layout/      # Layout components (TopBar, etc.)
│   ├── notifications/ # Notification components
│   └── user/        # User-related components
├── router/          # Vue Router configuration
├── services/        # API services and Axios configuration
├── stores/          # Pinia state management stores
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── views/           # Page components
└── App.vue          # Root component
```

## Development

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

## Environment Modes

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

## Learn More

- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Guide](https://vuejs.org/guide/typescript/overview.html)
- [Vite Documentation](https://vitejs.dev/)
- [Pinia State Management](https://pinia.vuejs.org/)
- [Naive UI Components](https://www.naiveui.com/)
