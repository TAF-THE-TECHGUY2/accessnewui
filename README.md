# Access Properties Admin

Custom React admin dashboard for Access Properties built with Vite, Tailwind CSS, React Router, Axios, TanStack Table, Recharts, and Lucide icons.

## Scripts

### `npm start`

Starts the Vite development server on `http://localhost:3002`.

If you see webpack, `react-scripts`, or `react-refresh-webpack-plugin` errors, an old Create React App dev server is still running and needs to be stopped first.

### `npm run build`

Builds the production app into `dist/`.

### `npm run preview`

Serves the production build locally.

## Notes

- The admin routes live under `/admin/*`.
- The existing onboarding flow is still available at `/`.
- Mock API data is wired through `src/services/adminService.js`.
- The Axios Laravel API client lives in `src/services/api.js`.
