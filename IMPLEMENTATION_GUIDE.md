# Implementation Guide - Travel Insurance Quotation System

## Phase 1: Backend Development (Laravel)

### 1.1 Project Initialization
```bash
# Backend - Laravel 12 with PHP 8.4
composer create-project laravel/laravel:^12.0 backend
cd backend
composer require tymon/jwt-auth

# Frontend - React 19.2 with Vite
cd ../
npm create vite@latest frontend -- --template react
cd frontend
npm install axios
```

### 1.2 Key Configuration Files

**config/jwt.php**
```php
'ttl' => 60, // Token expires in 60 minutes
'refresh_ttl' => 20160, // Refresh token expires in 2 weeks
'algo' => 'HS256',
```

**config/cors.php**
```php
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 1.3 Database Schema

**Users Migration** (Default Laravel + JWT)
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->timestamps();
});
```

### 1.4 Key Models

**User Model**
```php
class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable;
    
    public function getJWTIdentifier() { return $this->getKey(); }
    public function getJWTCustomClaims() { return []; }
}
```

### 1.5 Core Services

**PricingService**
```php
class PricingService
{
    const FIXED_RATE = 3;
    const AGE_LOADS = [
        [18, 30, 0.6],
        [31, 40, 0.7],
        [41, 50, 0.8],
        [51, 60, 0.9],
        [61, 70, 1.0],
    ];
    
    public function calculateQuotation(array $ages, string $startDate, string $endDate): float
    {
        $tripLength = $this->calculateTripLength($startDate, $endDate);
        $total = 0;
        
        foreach ($ages as $age) {
            $ageLoad = $this->getAgeLoad($age);
            $total += self::FIXED_RATE * $ageLoad * $tripLength;
        }
        
        return round($total, 2);
    }
}
```

### 1.6 API Routes Structure
```php
// routes/api.php
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
});

Route::middleware('auth:api')->group(function () {
    Route::post('quotation', [QuotationController::class, 'calculate']);
});
```

### 1.7 Request Validation
```php
class QuotationRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'age' => 'required|string|regex:/^(\d{1,2})(,\d{1,2})*$/',
            'currency_id' => 'required|in:EUR,GBP,USD',
            'start_date' => 'required|date_format:Y-m-d|after_or_equal:today',
            'end_date' => 'required|date_format:Y-m-d|after:start_date',
        ];
    }
}
```

## Phase 2: Frontend Development (React)

### 2.1 Project Structure
```
frontend/src/
├── components/
│   ├── auth/
│   │   └── LoginForm.jsx
│   ├── quotation/
│   │   ├── QuotationForm.jsx
│   │   ├── AgeInput.jsx
│   │   └── Results.jsx
│   └── layout/
│       ├── Header.jsx
│       └── ErrorBoundary.jsx
├── services/
│   ├── authService.js
│   ├── apiService.js
│   └── quotationService.js
├── hooks/
│   ├── useAuth.js
│   └── useApi.js
├── utils/
│   ├── validation.js
│   └── constants.js
└── App.js
```

### 2.2 Key Services

**API Service**
```javascript
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.token = localStorage.getItem('jwt_token');
    }
    
    async request(method, endpoint, data = null) {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { Authorization: `Bearer ${this.token}` })
            },
            ...(data && { body: JSON.stringify(data) })
        };
        
        const response = await fetch(`${this.baseURL}${endpoint}`, config);
        return this.handleResponse(response);
    }
}
```

**Authentication Service**
```javascript
class AuthService {
    async login(email, password) {
        const response = await apiService.request('POST', '/auth/login', { email, password });
        
        if (response.access_token) {
            localStorage.setItem('jwt_token', response.access_token);
            apiService.setToken(response.access_token);
        }
        
        return response;
    }
}
```

### 2.3 Component Examples

**QuotationForm.jsx**
```jsx
const QuotationForm = () => {
    const [formData, setFormData] = useState({
        ages: '',
        currency_id: 'EUR',
        start_date: '',
        end_date: ''
    });
    
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    const validateForm = () => {
        const newErrors = {};
        
        // Age validation
        if (!formData.ages.match(/^(\d{1,2})(,\d{1,2})*$/)) {
            newErrors.ages = 'Please enter ages separated by commas (e.g., 28,35)';
        }
        
        // Date validation
        if (new Date(formData.start_date) <= new Date()) {
            newErrors.start_date = 'Start date must be in the future';
        }
        
        return newErrors;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Implementation
    };
};
```

## Phase 3: Integration & Testing

### 3.1 CORS Configuration
- Configure Laravel CORS for React dev server
- Set up proper headers and credentials handling
- Test preflight requests

### 3.2 Error Handling Strategy
```php
// Backend - Global Exception Handler
public function render($request, Throwable $exception)
{
    if ($request->expectsJson()) {
        return response()->json([
            'error' => $exception->getMessage(),
            'status' => $this->getStatusCode($exception)
        ], $this->getStatusCode($exception));
    }
}
```

```javascript
// Frontend - Global Error Handler
const handleApiError = (error) => {
    if (error.response?.status === 401) {
        authService.logout();
        window.location.href = '/login';
    }
    
    return {
        message: error.response?.data?.error || 'An unexpected error occurred',
        status: error.response?.status || 500
    };
};
```

### 3.3 Testing Checklist

**Backend Tests:**
- [ ] Authentication endpoint tests
- [ ] Quotation calculation tests
- [ ] Validation tests
- [ ] JWT middleware tests

**Frontend Tests:**
- [ ] Component rendering tests
- [ ] Form validation tests
- [ ] API integration tests
- [ ] Error handling tests

**Integration Tests:**
- [ ] Complete user flow test
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness

## Phase 4: Local Environment Finalization

### 4.1 Environment Configuration
```bash
# Backend .env
APP_URL=http://localhost:8000
JWT_SECRET=your-secret-key
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Frontend .env
VITE_API_URL=http://localhost:8000/api
```

### 4.2 Local Optimization Checklist
- Use `docker compose up --build -d` for iterative local development.
- Keep dependency folders as Docker named volumes for faster restarts.
- Use health checks to gate frontend startup on backend readiness.
- Prefer `php artisan optimize:clear` over config caching in active development.

## Implementation Timeline

1. **Hour 1**: Backend setup and authentication (Tasks 1-5)
2. **Hour 1**: Quotation logic and API (Tasks 6-9)
3. **Hour 2**: Frontend setup and auth (Tasks 10-12)
4. **Hour 2**: Quotation form and integration (Tasks 13-17)
5. **Hour 2**: Testing and refinement (Tasks 18-19)

This guide provides the focused technical specifications needed to implement the travel insurance quotation system within the 1-2 hour timeframe efficiently and correctly.