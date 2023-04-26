export const nextPostJson = async (apiPath: string, object: any) => {
  return fetch(apiPath, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(object),
  });
};
