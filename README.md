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

## Installation (Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ruizsamuel/ledgerly.git
   cd ledgerly
   ```

2. **Install Dependencies:**
  - Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

3. **Start MongoDB:**

  - You can start a MongoDB instance using Docker with:

  ```bash
  docker-compose up -d mongo
  ```

4. **Set Up Environment Variables:**

  - Make sure to define the following environment variables:

    - `MONGO_USERNAME`: MongoDB admin username
    - `MONGO_PASSWORD`: MongoDB admin password
    - `MONGO_PORT`: Port for MongoDB (default: 27017)
    - `MONGO_HOST`: Hostname for MongoDB service (default: mongo)
    - `JWT_SECRET`: Secret key for JWT authentication

5. **Start the Server:**
   - Navigate to the `server` directory:
     ```bash
     cd server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the server:
     ```bash
     npm run start
     ```
   - The server will be running at [http://localhost:5000](http://localhost:5000).

6. **Start the Client:**
   - Open a new terminal and navigate to the `client` directory:
     ```bash
     cd client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the client:
     ```bash
     npm run start
     ```
   - The client will be running at [http://localhost:4200](http://localhost:4200).

7. **Access the Application:**
   - Open [http://localhost:4200](http://localhost:4200) in your browser to use Ledgerly.

## Deployment

Deployment is designed to be simple and reproducible:

*Make sure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.*

1. **Edit the `.env` file** with your production settings.
2. **Run:**
   ```bash
   docker-compose up --build -d
   ```
   This will start Ledgerly in detached mode.

## Contributing

Feel free to open issues or submit pull requests for new features or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

