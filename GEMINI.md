# Synapticz Task Timer - Project Context

## Project Overview
**Synapticz Task Timer** is a modern React-based task management and timing application. It leverages **React 19** and **Vite 8** for a fast development experience and efficient production builds. While **Tailwind CSS** and **PostCSS** are included in the project's configuration, the current implementation primarily uses standard CSS with modern features like nesting.

- **Frontend Framework:** React 19 (Functional components, Hooks)
- **Build Tool:** Vite 8
- **Styling:** CSS Nesting, PostCSS, Tailwind CSS (configured but not yet active)
- **Linting:** ESLint

## Architecture
The project follows a standard Vite + React structure:
- `src/main.jsx`: Entry point that initializes the React application.
- `src/App.jsx`: Main application component containing the core layout and state.
- `src/assets/`: Directory for static assets like images and SVG logos.
- `public/`: Contains static assets like `favicon.svg` and `icons.svg` (used via SVG `<use>` tags).
- `index.html`: The main HTML template.

## Building and Running
The following commands are available via `npm`:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with HMR. |
| `npm run build` | Builds the application for production (output in `dist/`). |
| `npm run lint` | Runs ESLint to check for code quality issues. |
| `npm run preview` | Locally previews the production build. |

## Development Conventions
- **Components:** Prefer functional components and hooks.
- **State Management:** Currently uses local `useState` for simple state tracking.
- **Styling:** 
    - Custom CSS variables are defined in `src/index.css` for theming (supporting light/dark modes).
    - Component-specific styles are located in `src/App.css` using CSS nesting.
- **Icons:** Icons are managed in a central `public/icons.svg` sprite and referenced using the `<use>` tag in JSX.
- **Strict Mode:** The application is wrapped in `<StrictMode>` to highlight potential problems.

## TODOs / Future Improvements
- [ ] Configure `content` in `tailwind.config.js` to enable Tailwind utility classes.
- [ ] Add `@tailwind` directives to `src/index.css` if utility-first styling is desired.
- [ ] Implement core task timing and management features.
- [ ] Add unit and integration tests.
