# Ledgerly

Ledgerly is a personal accounting application designed to help users efficiently manage their finances. It enables you to track expenses and income, organize them by month, calculate savings or losses, and manage multiple bank accounts or cash holdings. The application supports user authentication (login and registration) to ensure your data is secure and private.

## Features

- **Register Expenses:** Log your daily expenses with details and categorize them by account.
- **Register Income:** Record all sources of income, linked to specific accounts.
- **Monthly Grouping:** View all transactions grouped by month for better tracking.
- **Monthly Savings/Loss Calculation:** Automatically calculate your savings or losses for each month.
- **Annual Savings/Loss Calculation:** Get a summary of your financial performance for the year.
- **Multiple Accounts Support:** Manage several bank accounts or cash holdings; each transaction is linked to an account.
- **Account Balances:** Instantly see the balance of each account and your total net worth.
- **User Authentication:** Secure login and registration system for multiple users.

## Running the Project

1. First, configure the environment variables in the `.env` file.

   ```bash
   cp .env.example .env
   ```

2. Build Docker images once:
   ```bash
   make build
   ```

3. Start in **development mode**:
   ```bash
   make dev
   ```

   Follow development logs:
   ```bash
   make logs-dev
   ```

   Access the application at `http://localhost:4200`.

   *Note: The development mode uses a source-code bind mount plus dedicated container volumes for `node_modules`, so you get hot reload without leaking host dependencies into the container.*

   For LSP support, you should install node modules locally:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

4. Start in **production mode**:
   ```bash
   make prod
   ```

   Follow production logs:
   ```bash
   make logs-prod
   ```

   Access the application at `http://localhost`.

5. Stop both environments:
   ```bash
   make down
   ```

6. Bump synchronized app version (client + server):
   ```bash
   make version patch
   make version minor
   make version major
   ```

## Testing

Run the full test suite:

```bash
make test
```

Useful focused targets:

```bash
make test-back
make test-front
make test-integration
make test-watch
```

You can also run test commands directly:

```bash
cd server && npm run test
cd server && npm run test:unit
cd server && npm run test:integration
cd server && npm run test:functional

cd client && npm run test
```

## Architecture & Deployment

### Single Build, Two Modes

Ledgerly keeps the browser API contract fixed to `/api` and reuses the same built images for both environments:

- **Development Mode:** Angular dev server runs with a proxy so `/api` on `http://localhost:4200` forwards to the backend container
- **Production Mode:** Nginx is the single public entrypoint and proxies `/api` to the backend while serving the SPA with index.html fallback
- **Build Once:** The client and server images are tagged consistently so the same images are reused in dev and prod

### Nginx Routing Configuration

The Nginx proxy (`nginx.conf`) implements proper SPA (Single Page Application) routing:

```
/api/*              → Backend API (Express server on port 5000)
/*.{js,css,png,...} → Static assets from client
/*                  → Client app with fallback to index.html (enables SPA routing)
```

This ensures that routes like `/accounts`, `/transactions`, `/settings` are handled by Angular's router rather than creating 404 errors.

### Environment Variables

- **Development (`.env`):**
  - `CLIENT_URL=http://localhost:4200` - Angular dev server
   - `SERVER_PROXY_TARGET=http://server:5000` - Backend target used by the Angular proxy inside Docker
  - `DOMAIN=http://localhost` - Not used in dev

- **Production (`.env`):**
  - `DOMAIN=http://localhost` - Single domain for both client and API
  - `MONGO_USERNAME` and `MONGO_PASSWORD` - Database credentials
  - `JWT_SECRET` - Authentication secret

### Data Directories

Local MongoDB bind-mount directories are standardized with hyphen names:

- `data-dev/` for development
- `data-prod/` for production

These directories are ignored by git, together with the legacy `data/` path, to avoid committing database files.

## Contributing

Feel free to open issues or submit pull requests for new features or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
