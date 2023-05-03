import { NextApiRequest } from "next";

export const getRequestParamAsString = (
  req: NextApiRequest,
  paramName: string
): string | undefined => {
  let query = undefined;
  const queryInQuery = req.query[paramName];
  if (queryInQuery !== undefined) {
    return queryInQuery as string;
  }
  const queryInBody = req.body[paramName];
  if (queryInBody !== undefined) {
    return queryInBody;
  }
  if (query === undefined) {
    return undefined;
  }
};
