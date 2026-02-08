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

2. Build the Docker images with:
   ```
   docker compose build
   ```
3. To run the project in **development mode** (with automatic reload on changes), use:
   ```bash
   docker compose up
   ```

   Access the application at `http://localhost:4200`.

   *Note: The development mode uses a volume mount for the source code, allowing you to see changes without rebuilding the Docker image.*

   For LSP support, you should install node modules locally:
   ```bash
    cd client && npm install
    cd ../server && npm install
    ```

4. To run the project in **production mode**, use the production compose file:
   ```bash
   docker compose -f docker-compose.prod.yml up
   ```

   Access the application at `http://localhost`.

## Contributing

Feel free to open issues or submit pull requests for new features or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

