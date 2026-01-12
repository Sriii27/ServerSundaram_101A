# ImpactLens - Workforce Analytics Dashboard

<div align="center">

![ImpactLens](https://img.shields.io/badge/ImpactLens-Workforce%20Analytics-blue)
![Hacktide](https://img.shields.io/badge/Hacktide-24%20Hour%20Hackathon-orange)
![Django](https://img.shields.io/badge/Django-6.0-green)
![React](https://img.shields.io/badge/React-19.2-blue)

**A comprehensive workforce analytics platform built in 24 hours for Hacktide Hackathon**

*Identifying hidden high-performers and Silent Architects in your organization*

</div>

---

## 🎯 Overview

**ImpactLens** is a real-time workforce analytics dashboard designed to identify and highlight high-impact contributors, especially "Silent Architects" - employees who deliver exceptional value with lower visible activity. Built during the **Hacktide 24-hour hackathon**, this platform provides actionable insights into team performance, contribution patterns, and employee impact metrics.

### Key Highlights

- 🚀 **Built in 24 hours** for Hacktide Hackathon
- 📊 **Real-time analytics** with live data visualization
- 🎯 **Silent Architect Detection** - Identifies high-impact, low-activity contributors
- 🔄 **Team-specific metrics** with customizable weights
- 📈 **Interactive dashboards** with scatter plots, matrices, and disparity analysis
- 🤖 **AI-powered insights** for employee performance summaries

---

## ✨ Features

### 📊 Dashboard Analytics
- **Real-time KPI Cards**: Team Impact, Activity, Silent Architects count, and Total Workforce
- **Impact vs Activity Scatter Plot**: Visual representation of employee performance across four quadrants
- **Top Contributors Leaderboard**: Ranked list of highest impact performers
- **Team Filtering**: Filter analytics by specific teams or view organization-wide metrics

### 👥 Contributors View
- **Comprehensive Employee Table**: Searchable and filterable list of all contributors
- **Performance Metrics**: Impact and Activity scores for each employee
- **Role-based Filtering**: Filter by team, role, or search by name
- **Export Capabilities**: Download reports and employee data

### 📝 Activity Logs
- **Live Activity Feed**: Real-time tracking of employee activities
- **Activity Categories**: Code Reviews, Mentoring, Design Reviews, Standups, and more
- **Department-wide Tracking**: Monitor activity across all departments
- **Timestamp Tracking**: See when activities occurred

### 📈 Contribution Matrix
- **Detailed Breakdown**: Contribution counts by type (Refactor, Optimization, Feature, Architecture, Bug Fix)
- **Heatmap Visualization**: Color-coded matrix showing contribution intensity
- **Lines of Code Tracking**: Total contributions and code changes per employee
- **Team Comparison**: Compare contributions across different teams

### 📉 Disparity Analysis
- **Gap Analysis**: Identify employees with high impact but low perceived activity
- **Scatter Plot Visualization**: Four-quadrant analysis (Silent Architects, High Performers, Low Engagement, Visible Activity)
- **Disparity Metrics**: Average gap, high disparity count, and percentage analysis
- **Multiple View Modes**: Scatter Plot, Gap Analysis, and Side-by-Side comparisons

### ⚙️ Metrics Configuration
- **Team-Specific Weights**: Customizable impact weights for different team types
- **Silent Architect Thresholds**: Configurable thresholds per team
- **Backend-Driven Verification**: Single source of truth for all calculations
- **Live Configuration**: View and understand how metrics are calculated

---

## 🖼️ Screenshots

### Dashboard View
The main dashboard provides a comprehensive overview of workforce performance with:
- **KPI Cards** showing Team Impact (9.25), Team Activity (78.51), Silent Architects (1), and Total Workforce (127)
- **Impact vs Activity Scatter Plot** with quadrant analysis identifying Silent Architects in the top-left quadrant
- **Top Contributors Leaderboard** featuring employees ranked by impact score
- **Team Filter Dropdown** for viewing specific team metrics

![Dashboard](dashboard-screenshot.png)

### Contributors Page
A detailed table view of all employees with:
- **Searchable employee list** with names, roles, and teams
- **Impact and Activity scores** highlighted for easy identification
- **Filter options** by team and sort by performance metrics
- **Action buttons** for generating reports and exporting data

![Contributors](contributors-screenshot.png)

### Activity Logs
Real-time activity tracking showing:
- **Live feed** of employee activities across departments
- **Activity categories** including Code Reviews, Mentoring, Design Reviews, and Standups
- **Timestamp information** showing when activities occurred
- **Activity counts** per category for each employee

![Activity Logs](activity-logs-screenshot.png)

### Contribution Matrix
A heatmap-style matrix displaying:
- **Contribution breakdown** by type (Refactor, Optimization, Feature, Architecture, Bug Fix)
- **Visual heatmap** with color intensity representing contribution volume
- **Total contributions** and lines of code per employee
- **Team-based filtering** to compare contributions across teams

![Contribution Matrix](contribution-matrix-screenshot.png)

### Disparity Analysis
Advanced analytics for identifying performance gaps:
- **Summary metrics** showing Silent Architects count (1), Average Disparity (-69.3), High Disparity (1), and Total Employees (127)
- **Interactive scatter plot** with quadrant labels and threshold lines
- **Color-coded data points** by team (Engineering, Product, Design, Marketing)
- **Multiple view modes** for different analysis perspectives

![Disparity Analysis](disparity-analysis-screenshot.png)

### Metrics Configuration
Team-specific metric configuration showing:
- **Team profiles** for Engineering, Product, Design, and Marketing
- **Impact weights** breakdown (e.g., Engineering: Code Review 25%, Bug Fix 25%, Architecture 25%, Feature Delivery 25%)
- **Silent Architect thresholds** (Min Impact: 65, Max Activity: 60 for Engineering)
- **Backend verification** ensuring single source of truth for calculations

![Metrics Configuration](metrics-configuration-screenshot.png)

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 6.0.1
- **API**: Django REST Framework
- **Database**: PostgreSQL (with SQLite fallback for development)
- **Python**: 3.9+
- **Additional**: django-cors-headers, python-dotenv, faker

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18
- **Charts**: Recharts 3.6.0
- **Routing**: React Router DOM 7.12.0
- **Icons**: Lucide React

---

## 📁 Project Structure

```
ServerSundaram_101A/
├── SS-Backend/              # Django REST API
│   ├── myproject/          # Django project settings
│   │   ├── settings.py     # CORS, database, app config
│   │   └── urls.py         # Main URL routing
│   ├── workforce/          # Main application
│   │   ├── models.py       # Employee, Team, Activity, Contribution models
│   │   ├── views.py        # API endpoints and business logic
│   │   ├── urls.py         # API route definitions
│   │   ├── services/       # AI and analytics services
│   │   │   ├── ai.py       # AI summary generation
│   │   │   └── employee_analytics.py
│   │   └── management/     # Custom management commands
│   ├── manage.py
│   └── requirements.txt
│
└── SS-Frontend/            # React + Vite application
    ├── src/
    │   ├── components/     # Reusable React components
    │   │   ├── KpiCard.jsx
    │   │   ├── ImpactActivityScatter.jsx
    │   │   ├── TeamSelector.jsx
    │   │   └── EmployeeDrawer.jsx
    │   ├── pages/          # Page components
    │   │   ├── Dashboard.jsx
    │   │   ├── Contributors.jsx
    │   │   ├── ActivityLogs.jsx
    │   │   ├── ContributionMatrix.jsx
    │   │   ├── DisparityAnalysis.jsx
    │   │   └── AboutMetrics.jsx
    │   ├── services/       # API service layer
    │   │   └── api.js      # All API calls
    │   ├── hooks/          # Custom React hooks
    │   │   └── useDashboardMetrics.js
    │   └── utils/          # Utility functions
    │       └── metrics/
    │           └── disparity.js
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Python**: 3.9 or higher
- **Node.js**: 18.x or higher
- **npm** or **yarn**: For frontend dependencies
- **PostgreSQL**: For production (optional, SQLite can be used for development)

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd SS-Backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows
   python -m venv env
   env\Scripts\activate

   # Linux/Mac
   python3 -m venv env
   source env/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables** (create a `.env` file in `SS-Backend/`):
   ```env
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=localhost
   DB_PORT=5432
   ```
   > **Note**: For development, you can use SQLite by modifying `settings.py` to use SQLite instead of PostgreSQL.

5. **Run migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create a superuser** (for admin access):
   ```bash
   python manage.py createsuperuser
   ```
   When prompted, use:
   - **Username**: `manager1`
   - **Password**: `manager123`
   - **Email**: (optional)

7. **Seed sample data** (optional):
   ```bash
   python manage.py seed_data
   ```
   Or use the API endpoint: `POST /api/v1/seed`

8. **Start the development server**:
   ```bash
   python manage.py runserver
   ```
   The backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd SS-Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API URL** (optional):
   Create a `.env` file in `SS-Frontend/`:
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```
   > **Note**: The frontend defaults to `http://127.0.0.1:8000` if no environment variable is set.

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

---

## 🔐 Authentication

### Default Login Credentials

- **Username**: `manager1`
- **Password**: `manager123`

These credentials are configured for the manager role with staff access. After logging in, you'll have full access to all dashboard features and analytics.

### Login API Endpoint

**POST** `/api/v1/auth/login/`

Request Body:
```json
{
  "username": "manager1",
  "password": "manager123"
}
```

Response:
```json
{
  "message": "Login successful",
  "username": "manager1",
  "role": "manager"
}
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/login/` - User login

### Dashboard
- `GET /api/v1/dashboard/summary?team=<team_name>` - Get dashboard summary metrics
- `GET /api/v1/dashboard/scatter?team=<team_name>` - Get employee scatter plot data
- `GET /api/v1/dashboard/leaderboard?team=<team_name>&limit=<n>` - Get top performers

### Teams
- `GET /api/v1/teams` - Get list of all teams

### Employees
- `GET /api/v1/employees/<id>/breakdown` - Get detailed employee breakdown
- `GET /api/v1/employees/raw` - Get raw employee data

### Metrics
- `GET /api/v1/metrics/distribution` - Get score distribution histogram
- `GET /api/v1/metrics/weights` - Get metric weighting configuration
- `GET /api/v1/config/metrics` - Get team-specific metric configurations
- `GET /api/v1/config/thresholds` - Get Silent Architect thresholds

### Raw Data
- `GET /api/v1/contributions/raw` - Get all contributions
- `GET /api/v1/activities/raw` - Get all activities
- `GET /api/v1/issues/raw` - Get all issues

### Contribution Matrix
- `GET /api/v1/contributions/matrix?team=<team_name>` - Get contribution matrix data

### AI Features
- `POST /api/v1/ai/employee-summary/<employee_id>/` - Generate AI summary for employee

### Data Management
- `POST /api/v1/seed` - Seed database with sample data

---

## 📊 Key Metrics Explained

### Impact Score
Calculated based on weighted contributions that vary by team type:

**Engineering Team:**
- Code Review: 25%
- Bug Fix: 25%
- Architecture: 25%
- Feature Delivery: 25%

**Product Team:**
- Feature Definition: 35%
- Roadmap Delivery: 30%
- Stakeholder Alignment: 20%
- Arch Decisions: 15%

**Design Team:**
- UX Improvement: 40%
- Visual Delivery: 30%
- Design System: 20%
- Accessibility: 10%

**Marketing Team:**
- Campaign Impact: 35%
- Lead Influence: 30%
- Conversion Lift: 20%
- Brand Assets: 15%

### Activity Score
Based on total activity count including:
- Code Reviews
- Design Reviews
- Mentoring Sessions
- Tech Talks
- RFC Reviews

### Silent Architect
An employee is identified as a "Silent Architect" when:
- **Impact Score** ≥ 65 (varies by team)
- **Activity Score** ≤ 60 (varies by team)

These thresholds are team-specific and can be configured in the Metrics page.

---

## 🎮 Usage

1. **Start the backend server** (port 8000)
   ```bash
   cd SS-Backend
   python manage.py runserver
   ```

2. **Start the frontend server** (port 5173)
   ```bash
   cd SS-Frontend
   npm run dev
   ```

3. **Navigate to** `http://localhost:5173`

4. **Login** with credentials:
   - Username: `manager1`
   - Password: `manager123`

5. **Explore the dashboard**:
   - View real-time metrics on the Dashboard
   - Browse Contributors and filter by team
   - Check Activity Logs for recent actions
   - Analyze Contribution Matrix for detailed breakdowns
   - Review Disparity Analysis to find Silent Architects
   - Configure Metrics for team-specific settings

---

## 🏆 Hacktide 24-Hour Hackathon

This project was built during the **Hacktide 24-hour hackathon**, demonstrating rapid development capabilities with:

- ✅ Full-stack application (Django + React)
- ✅ Real-time analytics and data visualization
- ✅ RESTful API with comprehensive endpoints
- ✅ Modern UI/UX with Tailwind CSS
- ✅ AI-powered features
- ✅ Team-specific metric configurations
- ✅ Silent Architect detection algorithm

### Challenges Overcome

- **API Integration**: Fixed API URL configuration and CORS issues
- **Data Consistency**: Resolved field name mismatches between frontend and backend
- **Real-time Calculations**: Implemented efficient bulk queries to avoid N+1 problems
- **Team-Specific Logic**: Created flexible metric weighting system for different team types

---

## 🐛 Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the frontend URL is added to `CORS_ALLOWED_ORIGINS` in `SS-Backend/myproject/settings.py`. The default configuration includes:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5174`

### Database Connection Issues
- Ensure PostgreSQL is running (if using PostgreSQL)
- Check `.env` file has correct database credentials
- Try using SQLite for development by modifying `settings.py`

### Port Conflicts
- Backend default port: 8000 (change with `python manage.py runserver <port>`)
- Frontend default port: 5173 (change in `vite.config.js`)

### API Connection Issues
- Verify backend is running on `http://127.0.0.1:8000`
- Check browser console for API errors
- Ensure CORS is properly configured
- Verify API URL in frontend `.env` file or use default fallback

---

## 🧪 Development

### Backend Development
- API is built with Django REST Framework
- Models are defined in `workforce/models.py`
- Views/API endpoints in `workforce/views.py`
- Services for AI and analytics in `workforce/services/`

### Frontend Development
- Components are in `src/components/`
- Pages are in `src/pages/`
- API service layer in `src/services/api.js`
- Styling uses Tailwind CSS with utility classes

### Running Tests
```bash
# Backend
cd SS-Backend
python manage.py test

# Frontend
cd SS-Frontend
npm run lint
```

---

## 📝 License

This project is proprietary software developed for workforce analytics during the Hacktide 24-hour hackathon.

---

## 👥 Contributors

Built with ❤️ during Hacktide 24-Hour Hackathon

---

## 📞 Support

For issues or questions, please contact the development team or open an issue in the repository.

---

<div align="center">

**Built in 24 hours for Hacktide Hackathon** ⚡

*Identifying Silent Architects, One Dashboard at a Time*

</div>
