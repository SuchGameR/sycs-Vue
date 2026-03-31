# SYCS Frontend with Backend

This template should help get you started developing with Vue 3 in Vite, including a Node.js + Express backend with PostgreSQL support.

## Project Structure

- `frontend/` - Vue.js frontend application
  - `src/pages/` - Page components (Home, About, etc.)
  - `src/components/` - Reusable components
  - `src/router/` - Vue Router configuration
  - `src/stores/` - Pinia stores
- `backend/` - Node.js + Express backend with PostgreSQL
- `database/` - Database migrations and seeds
- `configs/` - Configuration files (ESLint, Prettier, etc.)
- `env/` - Environment variables
- `plugins/` - Custom plugins

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Running the Application

### Frontend

```sh
npm run dev
```

### Backend

```sh
npm run server:dev
```

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

## Backend Setup

This project includes a Node.js + Express backend with PostgreSQL support.

### Prerequisites

- Node.js (see package.json engines)
- PostgreSQL database

### Environment Configuration

1. Copy `env/.env` and update the database settings:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_database_name
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3000
   ```

2. Create a PostgreSQL database and update the credentials.

### Running the Backend

```sh
npm run server:dev  # Development with nodemon
npm run server      # Production
```

The backend will run on `http://localhost:3000`.

### API Endpoints

- `GET /api/test` - Test PostgreSQL connection

## Deployment

This project can be deployed to GitHub Pages automatically via GitHub Actions.

### GitHub Pages Deployment

1. Push to the `main` branch.
2. GitHub Actions will build and deploy to GitHub Pages.
3. Access the site at `https://<username>.github.io/<repo-name>/`

### Manual Deployment

```sh
npm run build-only
# Then deploy ./frontend/dist to your hosting service
```

## Git Usage

```sh
git add .
git commit -m "Initial commit"
git remote add origin <repository-url>
git push -u origin main
```

```sh
npm run lint
```
