import { request } from './api';

export const createRoom = async ({ name, isPrivate, password }) => {
  return request(
    {
      url: '/room/create',
      method: 'post',
      data: {
        name,
        isPrivate,
        password,
      },
    },
    {
      requiresAuth: true,
    }
  );
};

export const joinRoom = async ({ code, password }) => {
  return request(
    {
      url: '/room/join',
      method: 'post',
      data: {
        code,
        password,
      },
    },
    {
      requiresAuth: true,
    }
  );
};

export const getRoomByCode = async (code) => {
  return request(
    {
      url: '/room/showroom',
      method: 'get',
      params: { code },
    },
    {
      requiresAuth: true,
    }
  );
};

export const leaveRoom = async (code) => {
  return request(
    {
      url: '/room/leave',
      method: 'post',
      data: { code },
    },
    {
      requiresAuth: true,
    }
  );
};
