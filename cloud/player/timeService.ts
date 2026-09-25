export function getServerTime() {
  const serverTimeMs = Date.now();

  return {
    code: 0,
    message: "get server time success",
    data: {
      serverTimeMs,
      iso: new Date(serverTimeMs).toISOString()
    }
  };
}
