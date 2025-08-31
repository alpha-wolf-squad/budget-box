# BudgetBox 💰

A modern, full-stack personal finance management application that helps users track their income and expenses, plan budgets, and gain insights into their financial health.

## 🎯 User Story

**As a user, I want to manage my personal finances effectively so that I can make informed financial decisions.**

### What You Can Do with BudgetBox:

1. **Sign Up & Sign In Securely**
   - Create an account using Clerk authentication
   - Secure login with modern authentication standards

2. **Track Income Streams**
   - Add multiple income sources (salary, freelance, investments, etc.)
   - Set recurring income patterns (weekly, monthly, yearly)
   - View total income calculations in real-time

3. **Manage Expenses**
   - Record various expense categories
   - Set recurring expense patterns
   - Track spending patterns over time

4. **Monitor Financial Health**
   - View real-time budget summaries
   - See your net income/expense balance
   - Get visual feedback on your financial status (green for positive, red for negative)

5. **Plan and Review**
   - Switch between different budget views:
     - **Planned Budget**: Set up your anticipated income and expenses
     - **Tracked Expenses**: Monitor actual spending
     - **Transaction Review**: Analyze your financial patterns

6. **Account Management**
   - Update account settings
   - Manage personal preferences
   - Secure profile management

### User Journey:
1. **Welcome**: Land on the homepage and sign up/sign in
2. **Dashboard**: Access your personalized budget overview
3. **Budget Management**: Add, edit, or delete income and expense entries
4. **Financial Insights**: Review your financial summary and net balance
5. **Planning**: Use different tabs to plan future budgets and review past transactions

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern UI library for building interactive interfaces
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - React component library for professional UI design
- **Clerk** - Authentication and user management
- **Axios** - HTTP client for API communication
- **React Router DOM** - Client-side routing
- **Emotion** - CSS-in-JS styling solution

### Backend
- **Django 5.2** - Python web framework
- **Django REST Framework** - Powerful toolkit for building Web APIs
- **PostgreSQL** - Robust relational database
- **Clerk Backend API** - Server-side authentication integration
- **Python-JOSE** - JWT token handling
- **CORS Headers** - Cross-origin resource sharing support

### Third-Party Integrations
- **Plaid API** - Bank account and transaction integration
- **OpenAI API** - AI-powered financial insights (optional)

### Development Tools
- **ESLint** - JavaScript/React code linting
- **Autoprefixer & PostCSS** - CSS processing
- **Python-dotenv** - Environment variable management

## 🚀 Local Development Setup

### Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://postgresql.org/)
- **Git** - [Download here](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/alpha-wolf-squad/budget-box.git
cd budget-box
```

### 2. Backend Setup (Django)

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### 2.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### 2.4 Database Setup
1. Create a PostgreSQL database named `budgetbox`
2. Create a `.env` file in `backend/budgetbox/budgetbox_project/` with:

```env
SECRET_KEY=your-django-secret-key-here
DEBUG=True
DB_NAME=budgetbox
DB_USER=your-postgres-username
DB_PASSWORD=your-postgres-password
DB_HOST=localhost
DB_PORT=5432

# Clerk Authentication
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_ISSUER=your-clerk-issuer-url
CLERK_JWKS_URL=your-clerk-jwks-url

# Optional: Plaid Integration
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENV=sandbox
PLAID_PRODUCTS=auth,transactions
PLAID_COUNTRY_CODES=US,CA
```

#### 2.5 Run Database Migrations
```bash
cd budgetbox
python manage.py makemigrations
python manage.py migrate
```

#### 2.6 Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

#### 2.7 Start Backend Server
```bash
python manage.py runserver
```
The backend will run on `http://localhost:8000`

### 3. Frontend Setup (React)

#### 3.1 Navigate to Frontend Directory
```bash
cd frontend  # from project root
```

#### 3.2 Install Node Dependencies
```bash
npm install
```

#### 3.3 Environment Configuration
Create a `.env` file in the `frontend/` directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
VITE_API_BASE_URL=http://localhost:8000
```

#### 3.4 Start Frontend Development Server
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

### 4. Environment Configuration Details

#### 4.1 Clerk Authentication Setup
1. Create an account at [Clerk.dev](https://clerk.dev)
2. Create a new application
3. Get your publishable key and secret key from the dashboard
4. Add the keys to your environment files

#### 4.2 PostgreSQL Database Setup
1. Install PostgreSQL on your system
2. Create a new database: `createdb budgetbox`
3. Create a user with appropriate permissions
4. Update the `.env` file with your database credentials

### 5. Verification

Once both servers are running:

1. Visit `http://localhost:5173` in your browser
2. You should see the BudgetBox homepage
3. Try signing up/signing in with Clerk authentication
4. Test adding income and expense entries
5. Verify the backend API at `http://localhost:8000/admin` (if superuser created)

### 6. Common Issues & Troubleshooting

#### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env` file
- Check if the database `budgetbox` exists

#### Authentication Issues
- Verify Clerk keys are correctly set
- Ensure CORS is properly configured
- Check that frontend and backend URLs match

#### Port Conflicts
- Frontend default: `5173`
- Backend default: `8000`
- Change ports in `vite.config.js` or Django settings if needed

## 📝 Additional Commands

### Frontend
```bash
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Backend
```bash
python manage.py test          # Run tests
python manage.py collectstatic # Collect static files
python manage.py shell         # Django shell
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
