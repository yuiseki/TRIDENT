export const jsonFetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    console.error(res);
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }

  return res.headers.get("content-type")?.includes("json")
    ? res.json()
    : async () => {
        const text = await res.text();
        return JSON.parse(text);
      };
};
