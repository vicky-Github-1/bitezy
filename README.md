# Bitezy

**Your Cravings. Delivered.**

Bitezy is a responsive, full-stack single-restaurant food ordering application. It contains a public customer menu, cart and checkout flow, customer profile and order tracking, plus a protected owner dashboard for food and order management.

The project uses separate frontend and backend applications.

## Features

### Customer

- Browse food without logging in
- Search food and filter by category
- Add, increase, decrease and remove cart items
- Persistent cart using browser `localStorage`
- Delivery address with browser location detection
- Saved profile and checkout details
- Customer registration and login
- Google OAuth login for customers
- Razorpay Test Mode checkout
- View paid orders in responsive order cards
- Track order status and payment status

### Owner

- Register using a private owner PIN
- Automatically open the owner dashboard after login
- View order, pending order, completed order and revenue statistics
- Add, edit, view and delete food items
- View customer orders
- Update order status

### Order statuses

`PLACED`, `ACCEPTED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`

## Technology stack

### Frontend

- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React

### Backend

- Java 17
- Spring Boot 3
- Spring Web
- Spring Security
- Spring Data JPA
- Hibernate
- MySQL 8
- Maven
- JWT
- Razorpay Java SDK
- Google Identity OAuth verification

## Project structure

```text
foodhub/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- pages/
|   |   |-- api.js
|   |   |-- utils.js
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- .env.example
|   `-- package.json
|-- backend/
|   |-- src/main/java/com/bitezy/
|   |   |-- config/
|   |   |-- controller/
|   |   |-- dto/
|   |   |-- entity/
|   |   |-- exception/
|   |   |-- repository/
|   |   |-- security/
|   |   `-- service/
|   |-- src/main/resources/application.properties
|   |-- .env.example
|   `-- pom.xml
`-- README.md
```

## Requirements

Install:

- Java JDK 17 or newer
- Apache Maven 3.9 or newer
- Node.js 20 or newer
- npm
- MySQL 8

Verify them in PowerShell:

```powershell
java -version
mvn -v
node -v
npm -v
mysql --version
```

## 1. Database setup

Start the MySQL service and open MySQL:

```powershell
mysql -u root -p
```

Create the database:

```sql
CREATE DATABASE IF NOT EXISTS bitezy_db;
```

Tables are automatically created or updated by Hibernate because the backend uses:

```properties
spring.jpa.hibernate.ddl-auto=update
```

Required tables:

- `users`
- `products`
- `orders`
- `order_items`

The application automatically adds sample food products if the products table is empty.

## 2. Backend configuration

Open the backend directory:

```powershell
cd C:\Users\shubh\OneDrive\Desktop\foodhub\backend
```

Copy the environment template:

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env`:

```dotenv
DB_URL=jdbc:mysql://localhost:3306/bitezy_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=use-a-long-random-secret-with-at-least-32-characters
OWNER_SECRET_PIN=choose-a-private-owner-pin
CORS_ALLOWED_ORIGIN=http://localhost:5173
PAYMENT_MOCK=false
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
GOOGLE_CLIENT_ID=your_google_oauth_web_client_id.apps.googleusercontent.com
```

Configuration notes:

- `DB_PASSWORD` must match the password configured for your MySQL root or application user.
- `OWNER_SECRET_PIN` is required for owner registration. Never expose this value or add it to frontend code.
- `JWT_SECRET` should be a long random secret.
- Set `PAYMENT_MOCK=true` only for local development without Razorpay. Mock payments must not be used in production.
- Set `PAYMENT_MOCK=false` and provide test credentials to open Razorpay Checkout.
- The backend loads `backend/.env` through `spring.config.import=optional:file:.env`.

## 3. Run the backend

From the backend directory:

```powershell
cd C:\Users\shubh\OneDrive\Desktop\foodhub\backend
mvn spring-boot:run
```

Alternative Maven commands:

```powershell
mvn clean compile
mvn clean package
java -jar target/bitezy-backend-1.0.0.jar
```

The backend runs at:

```text
http://localhost:8080
```

Check that products load:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/products"
```

## 4. Frontend configuration

Open a second terminal:

```powershell
cd C:\Users\shubh\OneDrive\Desktop\foodhub\frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Edit `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_web_client_id.apps.googleusercontent.com
```

Open:

```text
http://localhost:5173
```

The browser geolocation feature requires permission and typically works on `localhost` or HTTPS.

## 5. Google OAuth setup

1. Open Google Cloud Console.
2. Create or select a project.
3. Configure the OAuth consent screen.
4. Create an OAuth 2.0 **Web application** client.
5. Add this authorized JavaScript origin:

```text
http://localhost:5173
```

6. Copy the Web Client ID into:
   - `backend/.env` as `GOOGLE_CLIENT_ID`
   - `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`

Google login is available only for customers. It cannot create or authenticate an owner account.

## 6. Razorpay setup

1. Create or sign in to a Razorpay account.
2. Open the test-mode dashboard.
3. Copy the test Key ID and test Key Secret.
4. Set `PAYMENT_MOCK=false`.
5. Add both values to `backend/.env`.
6. Restart the backend.

Payment flow:

1. The customer creates a draft order.
2. The backend calculates totals using database product prices.
3. The backend creates a Razorpay order.
4. Razorpay Checkout opens in the browser.
5. After payment, Razorpay returns signed payment details.
6. The backend verifies the signature.
7. The order is confirmed and becomes visible to the owner.
8. Repeated verification does not create a duplicate order.

For development, test cards and credentials must come from Razorpay Test Mode. Card details are entered only in Razorpay Checkout and are never stored by Bitezy.

## 7. Owner setup

1. Open `http://localhost:5173`.
2. Open Login.
3. Switch to Register.
4. Enter name, email and password.
5. Select **OWNER**.
6. Enter the same PIN configured in `OWNER_SECRET_PIN`.
7. After successful registration or login, Bitezy opens the owner dashboard.

Owner features are protected by JWT and backend role authorization.

## 8. Customer flow

1. Open `http://localhost:5173`.
2. Browse the public food menu.
3. Search or select a category.
4. Add products to the cart.
5. Open Checkout.
6. Register or login if authentication is required.
7. Enter or detect delivery details.
8. Complete Razorpay payment.
9. View the confirmed order on the Orders page.

Customers may browse and create a cart without an account, but checkout and order history require authentication.

## API overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/google` | Public |
| GET | `/api/products` | Public |
| GET | `/api/products/{id}` | Public |
| POST | `/api/owner/products` | Owner |
| PUT | `/api/owner/products/{id}` | Owner |
| DELETE | `/api/owner/products/{id}` | Owner |
| POST | `/api/orders` | Customer |
| GET | `/api/orders/my-orders` | Customer |
| GET | `/api/owner/orders` | Owner |
| GET | `/api/owner/orders/{id}` | Owner |
| PUT | `/api/owner/orders/{id}/status` | Owner |
| POST | `/api/payment/create-order` | Customer |
| POST | `/api/payment/verify` | Customer |

All protected requests must include:

```http
Authorization: Bearer <jwt-token>
```

## Frontend build and validation

```powershell
cd C:\Users\shubh\OneDrive\Desktop\foodhub\frontend
npm run dev
npm run build
npm run lint
```

`npm run build` creates production files in `frontend/dist`.

## Backend build and validation

```powershell
cd C:\Users\shubh\OneDrive\Desktop\foodhub\backend
mvn clean compile
mvn clean package
```

The packaged application is generated in `backend/target`.

## Troubleshooting

### Access denied for MySQL

- Confirm `DB_USERNAME` and `DB_PASSWORD`.
- Confirm MySQL is running.
- Create or grant the database user access to `bitezy_db`.

### Port already in use

Frontend:

```powershell
npm run dev -- --port 5174
```

Update `CORS_ALLOWED_ORIGIN` and `app.cors.allowed-origin` for a different frontend port.

Backend:

Set `PORT=8081` in the backend environment and update `VITE_API_URL`:

```dotenv
VITE_API_URL=http://localhost:8081/api
```

### Google button not visible

- Confirm `VITE_GOOGLE_CLIENT_ID` is set before starting Vite.
- Add `http://localhost:5173` to authorized JavaScript origins.
- Restart `npm run dev` after changing `.env`.

### Razorpay does not open

- Confirm `PAYMENT_MOCK=false`.
- Confirm Razorpay test credentials are set.
- Restart the backend after changing `.env`.
- Allow network access to `https://checkout.razorpay.com`.

### Location not detected

- Allow browser location permission.
- Use `localhost` or HTTPS.
- Check that device location services are enabled.

### 401 Unauthorized

- Login again to generate a fresh JWT.
- Confirm the token is stored under `bitezyAuth` in browser local storage.
- Restart the frontend if authorization headers are not being sent.

## Security

- Passwords are stored with BCrypt.
- JWT is required for protected endpoints.
- Owner endpoints require `ROLE_OWNER`.
- Customer endpoints require `ROLE_CUSTOMER`.
- Owner registration requires a server-side secret PIN.
- Backend verifies Razorpay signatures before confirming payment.
- Card details are not stored by Bitezy.
- Google OAuth authenticates customer accounts only.
- Mock payment must remain disabled in production.
- Do not commit real passwords, PINs, JWT secrets, Google credentials or Razorpay secrets.
- Rotate any credential that has already been committed or shared outside this project.
