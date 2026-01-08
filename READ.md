# Workforce Analytics Dashboard

A comprehensive workforce analytics platform that tracks employee contributions, activities, and calculates impact metrics to identify high-performing team members and "Silent Architects" - employees with high impact but lower visible activity.

## Features

- **Dashboard Analytics**: Real-time metrics including impact scores, activity scores, and team comparisons
- **Employee Analytics**: Detailed breakdown of individual employee contributions and performance
- **Silent Architect Detection**: Identifies employees with high impact but low visible activity
- **Team Metrics**: Team-specific performance tracking with customizable metric weights
- **Activity Logs**: Comprehensive tracking of employee activities and contributions
- **AI-Powered Summaries**: Generate AI insights for employee performance analysis
- **Contributors View**: Visual leaderboard and scatter plot analysis

## Tech Stack

### Backend
- **Framework**: Django 6.0.1
- **API**: Django REST Framework
- **Database**: PostgreSQL (with SQLite fallback)
- **Python**: 3.9+

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18
- **Charts**: Recharts 3.6.0
- **Routing**: React Router DOM 7.12.0

## Project Structure

```
Hacktide/
├── ServerSundaram_101A/
│   ├── SS-Backend/          # Django REST API
│   │   ├── myproject/       # Django project settings
│   │   ├── workforce/       # Main app with models, views, services
│   │   ├── manage.py
│   │   └── db.sqlite3
│   │
│   └── SS-Frontend/         # React + Vite application
│       ├── src/
│       │   ├── components/  # Reusable React components
│       │   ├── pages/       # Page components (Dashboard, Login, etc.)
│       │   ├── services/    # API service layer
│       │   ├── layouts/     # Layout components
│       │   └── utils/       # Utility functions
│       ├── package.json
│       └── vite.config.js
└── README.md
```

## Prerequisites

- **Python**: 3.9 or higher
- **Node.js**: 18.x or higher
- **npm** or **yarn**: For frontend dependencies
- **PostgreSQL**: For production (optional, SQLite can be used for development)

## Installation & Setup

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd ServerSundaram_101A/SS-Backend
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
   pip install django djangorestframework django-cors-headers python-dotenv faker
   ```

4. **Set up environment variables** (create a `.env` file in `SS-Backend/`):
   ```env
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

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
   cd ServerSundaram_101A/SS-Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## Authentication

### Default Login Credentials

- **Username**: `manager1`
- **Password**: `manager123`

These credentials are configured for the manager role with staff access.

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

## API Endpoints

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

### AI Features
- `POST /api/v1/ai/employee-summary/<employee_id>/` - Generate AI summary for employee

### Data Management
- `POST /api/v1/seed` - Seed database with sample data

## Usage

1. **Start the backend server** (port 8000)
2. **Start the frontend server** (port 5173)
3. **Navigate to** `http://localhost:5173`
4. **Login** with the credentials above
5. **Explore** the dashboard, contributors, activity logs, and metrics pages

## Key Metrics

### Impact Score
Calculated based on weighted contributions:
- Code Reviews
- Bug Fixes
- Architecture Contributions
- Feature Delivery
- (Weights vary by team type)

### Activity Score
Based on total activity count including:
- Code Reviews
- Design Reviews
- Mentoring Sessions
- Tech Talks
- RFC Reviews

### Silent Architect
An employee is identified as a "Silent Architect" when:
- Impact Score ≥ 65
- Activity Score ≤ 60 (thresholds vary by team)

## Team-Specific Configurations

Different teams have different metric weights:

- **Engineering**: Code Review (25%), Bug Fix (25%), Architecture (25%), Feature Delivery (25%)
- **Product**: Feature Definition (35%), Roadmap Delivery (30%), Stakeholder Alignment (20%), Arch Decisions (15%)
- **Design**: UX Improvement (40%), Visual Delivery (30%), Design System (20%), Accessibility (10%)
- **Marketing**: Campaign Impact (35%), Lead Influence (30%), Conversion Lift (20%), Brand Assets (15%)

## Development

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
cd ServerSundaram_101A/SS-Backend
python manage.py test

# Frontend
cd ServerSundaram_101A/SS-Frontend
npm run lint
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the frontend URL is added to `CORS_ALLOWED_ORIGINS` in `myproject/settings.py`.

### Database Connection Issues
- Ensure PostgreSQL is running (if using PostgreSQL)
- Check `.env` file has correct database credentials
- Try using SQLite for development by modifying `settings.py`

### Port Conflicts
- Backend default port: 8000 (change with `python manage.py runserver <port>`)
- Frontend default port: 5173 (change in `vite.config.js`)

## License

This project is proprietary software developed for workforce analytics.

## Support

For issues or questions, please contact the development team.
