// Frontend JavaScript - API bilan aloqa va UI boshqaruvi
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://totp-backend.onrender.com/api';

// Store authentication token in localStorage
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

/**
 * Show alert message
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', or 'info'
 */
function showAlert(message, type = 'info') {
  const alertDiv = document.getElementById('alert');
  if (!alertDiv) return;

  alertDiv.textContent = message;
  alertDiv.className = `alert alert-${type} show`;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    alertDiv.classList.remove('show');
  }, 5000);
}

/**
 * Make API request
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} data - Request body
 * @returns {Promise<object>} Response data
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add authorization token if available
  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Add request body for POST/PUT requests
  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Register new user
 */
async function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validate inputs
  if (!username || !email || !password || !confirmPassword) {
    showAlert('All fields are required', 'error');
    return;
  }

  if (password.length < 6) {
    showAlert('Password must be at least 6 characters', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showAlert('Passwords do not match', 'error');
    return;
  }

  try {
    const response = await apiRequest('/auth/register', 'POST', {
      username,
      email,
      password,
      confirmPassword,
    });

    showAlert('Registration successful! Redirecting to login...', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

/**
 * Login - Step 1: Verify username and password
 */
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showAlert('Username and password are required', 'error');
    return;
  }

  try {
    const response = await apiRequest('/auth/login', 'POST', {
      username,
      password,
    });

    if (response.requiresTOTP) {
      // TOTP is enabled, show TOTP verification form
      localStorage.setItem('tempUserId', response.userId);
      localStorage.setItem('tempUsername', response.username);
      showAlert('Please enter your 2FA code', 'info');
      document.getElementById('passwordForm').style.display = 'none';
      document.getElementById('totpForm').style.display = 'block';
    } else {
      // TOTP is not enabled, login successful
      authToken = response.token;
      currentUser = response.user;
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      showAlert('Login successful!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    }
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

/**
 * Login - Step 2: Verify TOTP code
 */
async function handleVerifyTOTP(event) {
  event.preventDefault();

  const userId = localStorage.getItem('tempUserId');
  const totpCode = document.getElementById('totpCode').value.trim();

  if (!totpCode) {
    showAlert('TOTP code is required', 'error');
    return;
  }

  if (!/^\d{6}$/.test(totpCode)) {
    showAlert('TOTP code must be 6 digits', 'error');
    return;
  }

  try {
    const response = await apiRequest('/auth/verify-totp', 'POST', {
      userId: parseInt(userId),
      totpCode,
    });

    authToken = response.token;
    currentUser = response.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.removeItem('tempUserId');
    localStorage.removeItem('tempUsername');

    showAlert('2FA verification successful!', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

/**
 * Setup 2FA - Generate secret and QR code
 */
async function handleSetup2FA(event) {
  event.preventDefault();

  try {
    const response = await apiRequest('/auth/setup-2fa', 'POST');

    // Display secret and QR code
    document.getElementById('secretKey').textContent = response.secret;
    document.getElementById('qrCodeImage').src = response.qrCode;
    document.getElementById('setupForm').style.display = 'none';
    document.getElementById('confirmForm').style.display = 'block';

    showAlert('Scan the QR code with Google Authenticator', 'info');
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

/**
 * Confirm 2FA - Save secret and enable TOTP
 */
async function handleConfirm2FA(event) {
  event.preventDefault();

  const secret = document.getElementById('secretKey').textContent;
  const totpCode = document.getElementById('confirmTotpCode').value.trim();

  if (!totpCode) {
    showAlert('TOTP code is required', 'error');
    return;
  }

  if (!/^\d{6}$/.test(totpCode)) {
    showAlert('TOTP code must be 6 digits', 'error');
    return;
  }

  try {
    const response = await apiRequest('/auth/confirm-2fa', 'POST', {
      secret,
      totpCode,
    });

    showAlert('2FA enabled successfully!', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

/**
 * Disable 2FA
 */
async function handleDisable2FA() {
  if (!confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) {
    return;
  }

  try {
    const response = await apiRequest('/auth/disable-2fa', 'POST');
    showAlert('2FA disabled successfully', 'success');
    setTimeout(() => {
      location.reload();
    }, 1500);
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

/**
 * Load user profile
 */
async function loadProfile() {
  try {
    const response = await apiRequest('/user/profile', 'GET');
    const user = response.user;

    document.getElementById('displayUsername').textContent = user.username;
    document.getElementById('displayEmail').textContent = user.email;
    document.getElementById('displayCreatedAt').textContent = new Date(
      user.created_at
    ).toLocaleDateString();

    // Load 2FA status
    loadTOTPStatus();
  } catch (error) {
    showAlert(error.message, 'error');
    logout();
  }
}

/**
 * Load TOTP status
 */
async function loadTOTPStatus() {
  try {
    const response = await apiRequest('/user/2fa-status', 'GET');
    const totpEnabled = response.totp_enabled;

    const statusBadge = document.getElementById('totpStatusBadge');
    const setupBtn = document.getElementById('setupBtn');
    const disableBtn = document.getElementById('disableBtn');

    if (totpEnabled) {
      statusBadge.textContent = 'Enabled';
      statusBadge.className = 'status-badge enabled';
      setupBtn.style.display = 'none';
      disableBtn.style.display = 'block';
    } else {
      statusBadge.textContent = 'Disabled';
      statusBadge.className = 'status-badge disabled';
      setupBtn.style.display = 'block';
      disableBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading TOTP status:', error);
  }
}

/**
 * Logout user
 */
function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  const text = element.textContent;

  navigator.clipboard.writeText(text).then(() => {
    showAlert('Copied to clipboard!', 'success');
  });
}

/**
 * Check if user is authenticated
 */
function checkAuth() {
  if (!authToken) {
    window.location.href = 'index.html';
  }
}

/**
 * Initialize page based on current location
 */
function initPage() {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  if (page === 'dashboard.html') {
    checkAuth();
    loadProfile();
  }

  if (page === 'setup-2fa.html') {
    checkAuth();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initPage);
