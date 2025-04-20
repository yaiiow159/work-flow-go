# WorkFlowGo

A modern interview management and workflow application built with Vue 3, TypeScript, and Naive UI.

## Features

- **User Authentication**: Login, registration, and token-based authentication
- **Interview Management**: Create, view, edit, and manage interviews
- **Document Management**: Upload and organize documents
- **Calendar View**: Schedule and visualize interviews on a calendar
- **User Profile**: Manage user information and settings
- **Theme Customization**: 
  - Dark/Light mode toggle with system preference detection
  - Custom primary color selection
  - Compact mode for dense UI layouts
- **Display Preferences**: Choose between calendar or list as default view
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend Framework**: Vue 3 with Composition API and `<script setup>` syntax
- **Type Safety**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **UI Components**: Naive UI
- **Icons**: PrimeIcons
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Data Visualization**: Chart.js with Vue-ChartJS
- **Date Handling**: date-fns

## Project Structure

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

## Recent Improvements

- **Enhanced Theme System**: 
  - Customizable primary color with real-time preview
  - Persistent theme settings using localStorage
  - Automatic color variant generation for hover and pressed states
- **Improved Error Handling**: 
  - Centralized error handling system
  - Console-based error logging for debugging
- **User Experience Enhancements**:
  - Redesigned password change form with improved validation
  - Compact mode option for dense UI layouts
  - Default view preference (calendar/list)
- **Performance Optimizations**:
  - Reduced unnecessary re-renders
  - Improved component structure

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

## API Endpoints

The application connects to the following API endpoints:

- Development: http://localhost:8081/api
- Production: https://work-flow-go-server.onrender.com/api

## Learn More

- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Guide](https://vuejs.org/guide/typescript/overview.html)
- [Vite Documentation](https://vitejs.dev/)
- [Pinia State Management](https://pinia.vuejs.org/)
- [Naive UI Components](https://www.naiveui.com/)
