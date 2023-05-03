export const isQueryStringDanger = (queryString: string): boolean => {
  if (
    queryString.toLowerCase().includes("ignore") ||
    queryString.toLowerCase().includes("instruction")
  ) {
    return true;
  } else {
    return false;
  }
};
