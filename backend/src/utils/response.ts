export const successResponse = <T>(data: T, statusCode = 200) => {
  return {
    success: true,
    data,
  };
};

export const errorResponse = (error: unknown, statusCode = 500) => {
  return {
    success: false,
    error,
  };
};
