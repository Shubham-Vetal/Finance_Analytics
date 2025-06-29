
Financial Analytics Dashboard

Project Overview
The Financial Analytics Dashboard is a full-stack web application designed to empower financial analysts with robust tools for tracking, analyzing, and reporting on company transactions. It provides an intuitive interface for dynamic data visualization, advanced filtering, and configurable CSV export functionality, enabling users to gain actionable insights from their financial data.


Objective
To develop a comprehensive financial application that offers:
* An interactive dashboard for visualizing financial trends.
* A powerful transaction listing with search, sort, and filter capabilities.
* Reliable error handling through user-friendly alert chips.
* A flexible CSV export system for customizable data downloads.


Use Case
Financial analysts can leverage this dashboard to:
* Track and Analyze: Monitor company income and expenses over various periods.
* Visualize: Understand financial trends through dynamic charts (e.g., Revenue vs. Expenses, category breakdowns).
* Interact: Efficiently find specific transactions using advanced search, sort, and filter options.
* Generate Reports: Export customized transaction data to CSV for further analysis or reporting.

User Flow
1. Authentication: Users securely log in using a JWT-based authentication system.
2. Dashboard Access: Upon successful login, users are directed to an interactive dashboard displaying key financial analytics and a detailed transaction table.
3. Data Interaction: Users can dynamically filter, search, and sort transactions within the table to pinpoint specific data points.
4. Report Generation: Users configure desired columns for CSV export via a dedicated modal.
5. File Download: Once the report is generated on the server, the CSV file automatically downloads to the user's browser.


Core Features
1. Authentication & Security
* JWT-based System: Secure user login and logout.
* Secure API Endpoints: All critical backend routes are protected with token validation.

2. Financial Dashboard
* Visualizations:
    * Revenue vs. Expenses trends over configurable periods (Monthly, Quarterly, Annually).
    * Summary metrics (Balance, Revenue, Expenses, Savings).
* Transaction Table:
    * Paginated display for efficient browsing of large datasets.
    * Responsive design for various screen sizes.
* Filtering: Multi-field filtering by Date, Amount, Category, Status, and User.
* Sorting: Column-based sorting with clear visual indicators for ascending/descending order.
* Search: Real-time search functionality across all relevant transaction fields.


3. CSV Export System
* Column Configuration: An intuitive interface allows users to select precisely which transaction fields they want to include in the exported CSV.
* Auto-download: Generated CSV reports automatically trigger a file download in the user’s browser.

Technical Stack
This application is built as a full-stack solution leveraging modern web technologies.

Frontend
* Framework: React.js with TypeScript
* State Management: React Context API (or other preferred native/library solutions for specific state needs)
* Charts: Custom SVG-based charts for dynamic data visualization (or Chart.js/Recharts if integrated later).
* UI/Styling: Tailwind CSS
* Icons: Lucide React

Backend
* Server: Node.js with Express.js
* Language: TypeScript
* Database: MongoDB (for storing transaction and user data)
* Authentication: JSON Web Tokens (JWT)
* File Processing: CSV generation libraries


Deliverables
The project delivers the following components:
1. Frontend Application:
    * A secure login interface with JWT handling.
    * An interactive dashboard featuring dynamic charts and a detailed transaction table.
    * Robust advanced filtering and real-time search capabilities.
    * A configurable CSV export modal for user-defined reports
* 
1. Backend Application:
    * Well-structured RESTful APIs with proper authentication middleware.
    * Seamless MongoDB integration with optimized queries for data retrieval.
    * Server-side CSV generation with support for configurable columns.
* 
1. Documentation:
    * This README.md file, including setup instructions and usage examples.
    * (Future) API Documentation: Detailed endpoint specifications.
    * Proper CSV formatting with headers for generated reports.
* 
Getting Started (Local Development Setup)
Follow these steps to set up and run the Financial Analytics Dashboard on your local machine.


Prerequisites
* Node.js: v18.x or higher (recommended)
* npm: v9.x or higher (comes with Node.js) or Yarn
* MongoDB: A running MongoDB instance (local or cloud-hosted like MongoDB Atlas).
* Git: For cloning the repository.

1. Clone the Repository
First, clone the project repository to your local machine:


git clone https://github.com/Shubham-Vetal/Finance_Analytics.git
cd Finance_Analytics

2. Backend Setup
Navigate to the backend directory (adjust if your backend is in the root or a different sub-directory).
cd backend # Or adjust to your backend directory name, e.g., 'cd server'

Install backend dependencies:
npm install # or yarn install

Create a .env file in your backend directory and add the following environment variables. Replace placeholder values with your actual configuration:
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here # e.g., mongodb://localhost:27017/finance_db
JWT_SECRET=a_very_secret_key_for_jwt_signing # Generate a strong, random string

Build the TypeScript code and start the backend server:
npm run build # Compiles TypeScript to JavaScript in 'dist' folder
npm start     # Starts the Node.js server (e.g., 'node dist/server.js')

The backend server should now be running, typically on http://localhost:5000.
3. Frontend Setup
Open a new terminal window and navigate to the frontend directory (adjust if your frontend is in the root or a different sub-directory).
cd ../frontend # Or adjust to your frontend directory name, e.g., 'cd client'

Install frontend dependencies:
npm install # or yarn install

Create a .env file in your frontend directory and add the following environment variables:
REACT_APP_BACKEND_URL=http://localhost:5000/api # Adjust if your backend API path is different

Start the frontend development server:
npm start # or yarn start

The frontend application should now open in your browser, typically at http://localhost:3000.

API Documentation
This section provides a summary of the backend API endpoints. All endpoints are hosted on the backend server (e.g., http://localhost:5000).

Authentication & User Management
HTTP Method	Endpoint URL	Description	Authentication Required
POST	/auth/register	Registers a new user.	No
POST	/auth/login	Authenticates a user and issues a JWT token.	No
GET	/auth/me	Retrieves the currently authenticated user's profile.	No*
PUT	/auth/update	Updates the authenticated user's profile.	Yes
PUT	/auth/change-password	Allows authenticated users to change their password.	Yes
POST	/auth/logout	Logs out the authenticated user (invalidates token).	Yes
*Note: While /auth/me is not explicitly protected by isAuthenticated in the provided route definition, it typically returns sensitive user data and should generally be secured. Please review your backend's controller for this endpoint.


Transaction Management
HTTP Method	Endpoint URL	Description	Authentication Required
POST	/api/transactions/auth/createtransaction	Creates a new transaction.	Yes
GET	/api/transactions/auth/gettransactions	Retrieves all transactions for the authenticated user.	Yes
PUT	/api/transactions/auth/:id	Updates a specific transaction by ID.	Yes
DELETE	/api/transactions/auth/:id	Deletes a specific transaction by ID.	Yes
GET	/api/transactions/auth/summary	Retrieves a summary of income and expenses for the authenticated user.	Yes
GET	/api/transactions/auth/breakdown	Retrieves a category-wise breakdown of transactions for the authenticated user.	Yes


User Configuration
HTTP Method	Endpoint URL	Description  Authentication Required
POST	/api/user-config/auth/user-config/save	Saves or updates user-specific configuration settings.	Yes
GET	/api/user-config/auth/user-config/get	Retrieves user-specific configuration settings.	Yes
For specific details on request/response schemas, validation rules, and business logic for each API, please refer directly to the JSDoc/TSDoc comments within the controller files (e.g., src/controllers/transactionController.ts, src/controllers/authentication.ts, src/controllers/userConfigController.ts).


Sample Data
(Mention if you have provided sample data files or instructions to load data into MongoDB. If you have a seed.js script, mention how to run it.)


Contributing
We welcome contributions! If you'd like to contribute, please follow these steps:
1. Fork the repository.
2. Create a new branch (git checkout -b feature/your-feature-name).
3. Make your changes.
4. Commit your changes (git commit -m 'feat: Add new feature X').
5. Push to the branch (git push origin feature/your-feature-name).
6. Open a Pull Request.
7. 
License
This project is licensed under the MIT License - see the LICENSE file for details.


Contact
For any questions or feedback, feel free to reach out:
* Shubham Vetal: [Your GitHub Profile Link here, e.g., https://github.com/Shubham-Vetal]

