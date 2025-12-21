const API_BASE_URL =
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1` ||
  "https://rakib8080.sobhoy.com/api/v1";

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

// Authentication functions
export const login = async (email: string, password: string) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (
  fullName: string,
  email: string,
  password: string
) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password }),
  });
};

// Link functions
export const getMyLinks = async (token: string) => {
  return apiRequest("/links", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getLinkBySlug = async (slug: string, token: string) => {
  return apiRequest(`/links/slug/${slug}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const createLink = async (token: string, linkData: FormData) => {
  // For form data, we don't set Content-Type header as it will be set automatically
  const response = await fetch(`${API_BASE_URL}/links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: linkData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const deleteLink = async (token: string, linkId: string) => {
  return apiRequest(`/links/${linkId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getProfile = async (token: string) => {
  return apiRequest("/users/profile/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateProfile = async (token: string, profileData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/users/profile/update`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: profileData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const logout = async (token: string) => {
  return apiRequest("/auth/logout", {
    method: "POST",
    body: JSON.stringify({
      refreshToken:
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("refreshToken="))
          ?.split("=")[1] || "",
    }),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
