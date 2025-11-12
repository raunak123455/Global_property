/**
 * Test utility for KYC admin operations
 *
 * This file contains helper functions to test KYC approval/rejection
 * Use this with a tool like Postman or directly in your backend testing
 */

const API_BASE_URL = "http://192.168.1.6:5000/api";

// Example: Approve a user's KYC
const approveUserKyc = async (userId, adminToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/kyc/approve/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();
    console.log("KYC Approval Response:", data);
    return data;
  } catch (error) {
    console.error("Error approving KYC:", error);
    throw error;
  }
};

// Example: Reject a user's KYC
const rejectUserKyc = async (userId, reason, adminToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/kyc/reject/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();
    console.log("KYC Rejection Response:", data);
    return data;
  } catch (error) {
    console.error("Error rejecting KYC:", error);
    throw error;
  }
};

// Example: Get KYC status
const getKycStatus = async (userToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/kyc/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await response.json();
    console.log("KYC Status Response:", data);
    return data;
  } catch (error) {
    console.error("Error getting KYC status:", error);
    throw error;
  }
};

// Example usage:
// Replace with actual values from your database
const EXAMPLE_USER_ID = "your-user-id-here";
const EXAMPLE_TOKEN = "your-jwt-token-here";

// Uncomment to test:
// approveUserKyc(EXAMPLE_USER_ID, EXAMPLE_TOKEN);
// rejectUserKyc(EXAMPLE_USER_ID, "Documents not clear", EXAMPLE_TOKEN);
// getKycStatus(EXAMPLE_TOKEN);

module.exports = {
  approveUserKyc,
  rejectUserKyc,
  getKycStatus,
};
