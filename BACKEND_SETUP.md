# Backend Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** installed and running locally OR MongoDB Atlas account
3. **Git** for version control

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# backend/.env
MONGODB_URI=mongodb://localhost:27017/real-estate-db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

### MongoDB Options:

**Option A: Local MongoDB**

```
MONGODB_URI=mongodb://localhost:27017/real-estate-db
```

**Option B: MongoDB Atlas (Cloud)**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/real-estate-db
```

## Step 3: Start the Backend Server

```bash
cd backend
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:

```
Server is running on port 5000
Accessible at: http://192.168.1.4:5000
MongoDB Connected: ...
```

## Step 4: Test the Backend

### Health Check

```bash
curl http://192.168.1.4:5000/
```

Expected response:

```json
{ "message": "Real Estate Backend API is running!" }
```

### Register a Seller

```bash
curl -X POST http://192.168.1.4:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "seller@example.com",
    "password": "password123",
    "role": "seller"
  }'
```

### Login

```bash
curl -X POST http://192.168.1.4:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seller@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response!

### Create a Property

```bash
curl -X POST http://192.168.1.4:5000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Beautiful 3BR House",
    "description": "Spacious house with modern amenities",
    "price": 500000,
    "location": {
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "images": ["https://via.placeholder.com/400x300"],
    "bedrooms": 3,
    "bathrooms": 2,
    "area": 1500,
    "propertyType": "house",
    "features": ["Pool", "Garage"],
    "yearBuilt": 2020
  }'
```

### Get My Properties

```bash
curl -X GET http://192.168.1.4:5000/api/properties/my-properties \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Step 5: Configure Frontend

Update `utils/api.js` with your IP address:

```javascript
const API_CONFIG = {
  development: {
    baseUrl: "http://YOUR_COMPUTER_IP:5000/api", // Replace with your IP
  },
};
```

To find your IP:

- **Windows**: `ipconfig` (look for IPv4 Address)
- **Mac/Linux**: `ifconfig` or `ip addr`

## Step 6: Test from Mobile App

1. Make sure your phone and computer are on the **same WiFi network**
2. Start the backend server: `cd backend && npm start`
3. Start the Expo app: `npm start`
4. Open the app on your phone
5. Register as a seller
6. Try adding a property!

## Common Issues & Solutions

### Issue: Cannot connect to backend

**Solution**:

- Ensure backend is running
- Check that IP address in `utils/api.js` matches your computer's IP
- Phone and computer must be on same WiFi
- Disable firewall temporarily for testing

### Issue: MongoDB connection error

**Solution**:

- If using local MongoDB, ensure MongoDB service is running
- Check MongoDB URI in .env file
- For Atlas, check your network access settings

### Issue: "Not authorized" error

**Solution**:

- User must be registered with role "seller" or "agent"
- Check that JWT token is being sent correctly
- Token might have expired - try logging in again

### Issue: Validation errors

**Solution**:

- All required fields must be filled
- Price, bedrooms, bathrooms, area must be positive numbers
- Images array should contain at least one URL

## API Endpoints Summary

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Properties (Seller)

- `POST /api/properties` - Create property
- `GET /api/properties/my-properties` - Get seller's properties
- `GET /api/properties/:id` - Get single property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/stats` - Get property statistics
- `GET /api/properties/inquiries` - Get all inquiries

### Properties (Buyer)

- `GET /api/properties/all` - Get all properties with filters
- `POST /api/properties/:id/inquiries` - Add inquiry to property

## Database Structure

### Collections:

1. **users** - Stores user accounts (buyers, sellers, agents)
2. **properties** - Stores all property listings

### Relationships:

- Each property has a `sellerId` that references a user
- Properties can have multiple inquiries embedded
- Users can favorite multiple properties

## Next Steps

1. ✅ Backend is set up and running
2. ✅ Frontend can create properties
3. ✅ Properties are stored in MongoDB
4. ✅ Sellers can view their properties

Now you can:

- View properties in "My Properties" screen
- Edit properties
- Delete properties
- Get property statistics
- Receive inquiries from buyers

For detailed API documentation, see `backend/API_DOCUMENTATION.md`
