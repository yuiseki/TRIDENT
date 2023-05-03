import { NextApiRequest } from "next";

export const getRequestQueryString = (
  req: NextApiRequest
): string | undefined => {
  let query = undefined;
  const { query: queryInQuery } = req.query;
  if (queryInQuery !== undefined) {
    return queryInQuery as string;
  }
  const { query: queryInBody } = req.body;
  if (queryInBody !== undefined) {
    return queryInBody;
  }
  if (query === undefined) {
    return undefined;
  }
};
