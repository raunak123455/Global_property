// Configuration for different environments
const API_CONFIG = {
  development: {
    // Use your computer's IP address here
    // This should match the network your phone and computer are on
    baseUrl: "http://192.168.1.4:5000/api",
  },
  production: {
    // Production API URL - deployed on Render
    baseUrl: "https://global-property.onrender.com/api",
  },
};

// Get the appropriate base URL based on environment
const getBaseURL = () => {
  const env = process.env.NODE_ENV || "development";
  return API_CONFIG[env]?.baseUrl || API_CONFIG.development.baseUrl;
};

const API_BASE_URL = getBaseURL();

console.log("API Base URL:", API_BASE_URL);

// Helper function to make API requests
const apiRequest = async (
  endpoint,
  method = "GET",
  data = null,
  token = null
) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Add authorization header if token is provided
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(
      `Making ${method} request to: ${url}`,
      data ? { body: data } : ""
    );
    const response = await fetch(url, options);

    // Handle case where there's no response body
    let result;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      result = await response.json();
    } else {
      result = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(
        result.message ||
          `HTTP Error: ${response.status} ${response.statusText}`
      );
    }

    console.log("API Response:", result);
    return result;
  } catch (error) {
    console.error("API Request Error:", error);

    // Provide more specific error messages
    if (
      error.name === "TypeError" &&
      error.message === "Network request failed"
    ) {
      throw new Error(
        "Unable to connect to the server. Please make sure:\n1. The backend server is running on your computer\n2. You are using the correct IP address\n3. Your phone and computer are on the same Wi-Fi network"
      );
    }

    throw new Error(error.message || "Network error occurred");
  }
};

// Authentication API functions
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    return apiRequest("/auth/register", "POST", userData);
  },

  // Login user
  login: async (credentials) => {
    return apiRequest("/auth/login", "POST", credentials);
  },
};

// Property API functions
export const propertyAPI = {
  // Create a new property
  createProperty: async (propertyData, token) => {
    return apiRequest("/properties", "POST", propertyData, token);
  },

  // Get seller's properties
  getMyProperties: async (token, queryParams = {}) => {
    const params = new URLSearchParams(queryParams).toString();
    const endpoint = params
      ? `/properties/my-properties?${params}`
      : "/properties/my-properties";
    return apiRequest(endpoint, "GET", null, token);
  },

  // Get all properties (for buyers/public with filters)
  getAllProperties: async (token, queryParams = {}) => {
    const params = new URLSearchParams(queryParams).toString();
    const endpoint = params ? `/properties/all?${params}` : "/properties/all";
    return apiRequest(endpoint, "GET", null, token);
  },

  // Get single property
  getProperty: async (propertyId, token) => {
    return apiRequest(`/properties/${propertyId}`, "GET", null, token);
  },

  // Update property
  updateProperty: async (propertyId, propertyData, token) => {
    return apiRequest(`/properties/${propertyId}`, "PUT", propertyData, token);
  },

  // Delete property
  deleteProperty: async (propertyId, token) => {
    return apiRequest(`/properties/${propertyId}`, "DELETE", null, token);
  },

  // Get property statistics
  getPropertyStats: async (token) => {
    return apiRequest("/properties/stats", "GET", null, token);
  },

  // Add inquiry to a property
  addInquiry: async (propertyId, inquiryData, token) => {
    return apiRequest(
      `/properties/${propertyId}/inquiries`,
      "POST",
      inquiryData,
      token
    );
  },

  // Get all inquiries for seller's properties
  getMyInquiries: async (token) => {
    return apiRequest("/properties/inquiries", "GET", null, token);
  },

  // Submit legal documents for a property
  submitLegalDocuments: async (propertyId, documents, token) => {
    return apiRequest(
      `/properties/${propertyId}/legal-documents`,
      "POST",
      { documents },
      token
    );
  },

  // Get legal documents for a property
  getLegalDocuments: async (propertyId, token) => {
    return apiRequest(
      `/properties/${propertyId}/legal-documents`,
      "GET",
      null,
      token
    );
  },

  // Update notary status for legal documents (notaries/admins only)
  updateNotaryStatus: async (propertyId, notaryStatus, notes, token) => {
    return apiRequest(
      `/properties/${propertyId}/legal-documents/notary-status`,
      "PUT",
      { notaryStatus, notes },
      token
    );
  },

  // Get all properties with submitted legal documents (notaries/admins only)
  getPropertiesWithLegalDocuments: async (token) => {
    return apiRequest(
      "/properties/legal-documents/submitted",
      "GET",
      null,
      token
    );
  },
};

// KYC API functions
export const kycAPI = {
  // Submit KYC for verification
  submitKyc: async (kycData, token) => {
    return apiRequest("/kyc/submit", "POST", kycData, token);
  },

  // Get KYC status
  getKycStatus: async (token) => {
    return apiRequest("/kyc/status", "GET", null, token);
  },

  // Admin: Approve KYC
  approveKyc: async (userId, token) => {
    return apiRequest(`/kyc/approve/${userId}`, "PUT", null, token);
  },

  // Admin: Reject KYC
  rejectKyc: async (userId, reason, token) => {
    return apiRequest(`/kyc/reject/${userId}`, "PUT", { reason }, token);
  },
};

export default authAPI;
