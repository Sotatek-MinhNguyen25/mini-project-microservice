export const createRpcParams = (
  statusCode: number,
  message: string,
  error: string,
) => {
  return {
    statusCode,
    message,
    error,
  };
};
