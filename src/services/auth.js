import { request } from './api';

export const loginUser = async ({ email, password }) => {
  return request({
    url: '/users/login',
    method: 'post',
    data: { email, password },
  });
};

export const registerUser = async ({ username, email, password }) => {
  return request({
    url: '/users/register',
    method: 'post',
    data: { username, email, password },
  });
};

export const createGuestUser = async ({ username }) => {
  return request({
    url: '/users/guest',
    method: 'post',
    data: { username },
  });
};

export const logoutUser = async (refreshToken) => {
  return request(
    {
      url: '/users/logout',
      method: 'post',
      data: { refreshToken },
    },
    {
      requiresAuth: true,
      retryOnAuthFailure: false,
    }
  );
};
