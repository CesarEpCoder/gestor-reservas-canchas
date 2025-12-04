/**
 * MÓDULO DE API
 * Funciones reutilizables para comunicarse con el backend
 */

const API_URL = 'http://localhost:5000/api';

/**
 * Obtener el token del localStorage
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Obtener headers con autenticación
 */
function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

/**
 * Petición GET
 */
async function fetchGET(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('Error en GET:', error);
    throw error;
  }
}

/**
 * Petición POST
 */
async function fetchPOST(endpoint, body) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('Error en POST:', error);
    throw error;
  }
}

/**
 * Petición PUT
 */
async function fetchPUT(endpoint, body) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('Error en PUT:', error);
    throw error;
  }
}

/**
 * Petición DELETE
 */
async function fetchDELETE(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('Error en DELETE:', error);
    throw error;
  }
}

/**
 * Petición POST con FormData (para imágenes)
 */
async function fetchPOSTFormData(endpoint, formData) {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('Error en POST FormData:', error);
    throw error;
  }
}

/**
 * Petición PUT con FormData (para imágenes)
 */
async function fetchPUTFormData(endpoint, formData) {
  try {
    const token = getToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('Error en PUT FormData:', error);
    throw error;
  }
}