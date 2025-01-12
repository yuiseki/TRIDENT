/**
 * @jest-environment node
 */

import { POST } from "./route";

describe("POST /api/ai/surface", () => {
  it("response something", async () => {
    const requestObj = {
      json: async () => ({
        query: "台東区のラーメン屋を教えて",
        pastMessages: undefined,
      }),
    } as any;

    const res = await POST(requestObj);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.surface.length).toBeGreaterThanOrEqual(1);
  });
});
