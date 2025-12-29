export const setCookie = (
  key: string,
  value: string | undefined,
  expireDays = 30,
) => {
  if (typeof value === "undefined") {
    // Set the expiration time to yesterday (expire immediately)
    const expiredDate = new Date(0).toUTCString(); // 1970-01-01T00:00:00Z

    document.cookie = `${key}=; expires=${expiredDate}; path=/;`;
  } else {
    const expires = new Date(
      Date.now() + expireDays * 24 * 60 * 60 * 1000,
    ).toUTCString();

    document.cookie = `${key}=${value};expires=${expires};path=/;`;
  }
};
