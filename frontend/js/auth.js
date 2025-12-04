/**
 * MÓDULO DE AUTENTICACIÓN
 * Manejo de tokens, login, logout y verificación de sesión
 */

/**
 * Guardar token en localStorage
 */
function saveToken(token) {
  localStorage.setItem('token', token);
}

/**
 * Guardar datos del usuario en localStorage
 */
function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Obtener datos del usuario desde localStorage
 */
function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Obtener token desde localStorage
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Verificar si hay sesión activa
 */
function isLoggedIn() {
  return !!getToken();
}

/**
 * Cerrar sesión
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/auth/login.html';
}

/**
 * Redirigir según el rol del usuario
 */
function redirectToDashboard() {
  const user = getUser();
  
  if (!user) {
    window.location.href = '/auth/login.html';
    return;
  }

  switch(user.rol) {
    case 'superadmin':
      window.location.href = '/superadmin/dashboard.html';
      break;
    case 'admin':
      window.location.href = '/admin/dashboard.html';
      break;
    case 'user':
      window.location.href = '/user/reservas.html';
      break;
    default:
      window.location.href = '/auth/login.html';
  }
}

/**
 * Verificar que el usuario tenga el rol requerido
 */
function requireRole(allowedRoles) {
  const user = getUser();
  
  if (!user || !isLoggedIn()) {
    window.location.href = '/auth/login.html';
    return false;
  }

  if (!allowedRoles.includes(user.rol)) {
    alert('No tienes permiso para acceder a esta página');
    redirectToDashboard();
    return false;
  }

  return true;
}

/**
 * Decodificar token JWT (sin verificar firma)
 */
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
}