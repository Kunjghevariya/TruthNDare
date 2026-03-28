export const normalizeError = (error, fallbackMessage = 'Something went wrong. Please try again.') => {
  if (!error) {
    return new Error(fallbackMessage);
  }

  if (error instanceof Error) {
    return error;
  }

  const apiMessage = error?.message || error?.response?.data?.message || error?.data?.message;

  return new Error(apiMessage || fallbackMessage);
};
