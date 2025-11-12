# Property Management API Documentation

## Base URL

```
http://192.168.1.4:5000/api
```

## Authentication

All property endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication Endpoints

#### 1. Register User

- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "seller"
}
```

- **Response**: Returns user object and JWT token

#### 2. Login User

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

- **Response**: Returns user object and JWT token

---

### Property Endpoints (Seller)

#### 1. Create Property

- **URL**: `/properties`
- **Method**: `POST`
- **Auth Required**: Yes (Seller/Agent only)
- **Body**:

```json
{
  "title": "Beautiful 3BR House with Garden",
  "description": "Spacious house with modern amenities",
  "price": 500000,
  "location": {
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "bedrooms": 3,
  "bathrooms": 2,
  "area": 1500,
  "propertyType": "house",
  "features": ["Pool", "Garage", "Garden"],
  "yearBuilt": 2020,
  "status": "active"
}
```

- **Response**:

```json
{
  "message": "Property created successfully",
  "property": {
    /* property object */
  }
}
```

#### 2. Get My Properties

- **URL**: `/properties/my-properties`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `status` (optional): Filter by status (active, sold, pending, draft)
  - `sortBy` (optional): Field to sort by (default: createdAt)
  - `order` (optional): asc or desc (default: desc)
- **Example**: `/properties/my-properties?status=active&sortBy=price&order=asc`
- **Response**:

```json
{
  "count": 5,
  "properties": [
    /* array of properties */
  ]
}
```

#### 3. Get Single Property

- **URL**: `/properties/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Property object

#### 4. Update Property

- **URL**: `/properties/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Owner only)
- **Body**: Same as create property (any fields to update)
- **Response**:

```json
{
  "message": "Property updated successfully",
  "property": {
    /* updated property object */
  }
}
```

#### 5. Delete Property

- **URL**: `/properties/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (Owner only)
- **Response**:

```json
{
  "message": "Property deleted successfully"
}
```

#### 6. Get Property Statistics

- **URL**: `/properties/stats`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:

```json
{
  "totalProperties": 10,
  "activeProperties": 7,
  "soldProperties": 2,
  "pendingProperties": 1,
  "totalValue": 5000000,
  "totalViews": 150,
  "totalInquiries": 25
}
```

#### 7. Get My Inquiries

- **URL**: `/properties/inquiries`
- **Method**: `GET`
- **Auth Required**: Yes (Seller)
- **Response**:

```json
{
  "count": 5,
  "inquiries": [
    {
      "propertyId": "...",
      "propertyTitle": "Beautiful 3BR House",
      "userId": {
        /* user object */
      },
      "message": "I'm interested in this property",
      "contactInfo": {
        "email": "buyer@example.com",
        "phone": "123-456-7890"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "status": "pending"
    }
  ]
}
```

---

### Property Endpoints (Buyer/Public)

#### 1. Get All Properties (with filters)

- **URL**: `/properties/all`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `city` (optional): Filter by city
  - `state` (optional): Filter by state
  - `propertyType` (optional): house, apartment, condo, townhouse, land, commercial
  - `minPrice` (optional): Minimum price
  - `maxPrice` (optional): Maximum price
  - `minBedrooms` (optional): Minimum bedrooms
  - `maxBedrooms` (optional): Maximum bedrooms
  - `minArea` (optional): Minimum area in sq ft
  - `maxArea` (optional): Maximum area in sq ft
  - `sortBy` (optional): Field to sort by (default: createdAt)
  - `order` (optional): asc or desc (default: desc)
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Results per page (default: 20)
- **Example**: `/properties/all?city=New York&propertyType=house&minPrice=400000&maxPrice=600000&page=1`
- **Response**:

```json
{
  "properties": [
    /* array of properties */
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 3,
    "limit": 20
  }
}
```

#### 2. Add Inquiry to Property

- **URL**: `/properties/:id/inquiries`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:

```json
{
  "message": "I'm interested in this property. Can we schedule a viewing?",
  "contactInfo": {
    "email": "buyer@example.com",
    "phone": "123-456-7890"
  }
}
```

- **Response**:

```json
{
  "message": "Inquiry submitted successfully",
  "inquiry": {
    /* inquiry object */
  }
}
```

---

## Property Model Schema

```javascript
{
  title: String (required),
  description: String (required),
  price: Number (required),
  location: {
    address: String (required),
    city: String (required),
    state: String (required),
    zipCode: String (required),
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  images: [String] (required),
  bedrooms: Number (required),
  bathrooms: Number (required),
  area: Number (required),
  propertyType: String (required) [house, apartment, condo, townhouse, land, commercial],
  status: String [active, sold, pending, draft] (default: active),
  sellerId: ObjectId (ref: User, required),
  features: [String],
  yearBuilt: Number,
  views: Number (default: 0),
  favorites: [ObjectId] (ref: User),
  inquiries: [{
    userId: ObjectId (ref: User),
    message: String,
    contactInfo: {
      email: String,
      phone: String
    },
    createdAt: Date,
    status: String [pending, responded, closed]
  }],
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Virtual Properties

- `propertyAge`: Calculated from yearBuilt
- `pricePerSqFt`: Calculated from price / area

---

## User Model Schema

```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String [buyer, agent, seller] (default: buyer),
  phone: String,
  profileImage: String,
  isVerified: Boolean (default: false),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Virtual Properties

- `fullName`: Combines firstName and lastName

---

## Error Responses

All error responses follow this format:

```json
{
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

Common status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

---

## Frontend Integration Examples

### Creating a Property

```javascript
import { propertyAPI } from "@/utils/api";

const createProperty = async () => {
  try {
    const propertyData = {
      title: "Beautiful House",
      description: "Great location",
      price: 500000,
      location: {
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
      },
      images: ["url1", "url2"],
      bedrooms: 3,
      bathrooms: 2,
      area: 1500,
      propertyType: "house",
      features: ["Pool", "Garage"],
      yearBuilt: 2020,
    };

    const result = await propertyAPI.createProperty(propertyData, userToken);
    console.log("Property created:", result);
  } catch (error) {
    console.error("Error:", error);
  }
};
```

### Getting Properties with Filters

```javascript
const getProperties = async () => {
  try {
    const filters = {
      city: "New York",
      propertyType: "house",
      minPrice: 400000,
      maxPrice: 600000,
      page: 1,
    };

    const result = await propertyAPI.getAllProperties(userToken, filters);
    console.log("Properties:", result.properties);
    console.log("Total pages:", result.pagination.pages);
  } catch (error) {
    console.error("Error:", error);
  }
};
```

---

## Testing the API

### Using curl:

```bash
# Register
curl -X POST http://192.168.1.4:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@test.com","password":"password123","role":"seller"}'

# Login
curl -X POST http://192.168.1.4:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"password123"}'

# Create Property (replace TOKEN with your JWT)
curl -X POST http://192.168.1.4:5000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Test Property","description":"Test","price":500000,"location":{"address":"123 St","city":"NYC","state":"NY","zipCode":"10001"},"images":["url"],"bedrooms":3,"bathrooms":2,"area":1500,"propertyType":"house"}'

# Get My Properties
curl -X GET http://192.168.1.4:5000/api/properties/my-properties \
  -H "Authorization: Bearer TOKEN"
```
