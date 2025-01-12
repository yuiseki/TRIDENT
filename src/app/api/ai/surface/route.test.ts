/**
 * @jest-environment node
 */

import { POST } from "./route";

describe("POST /api/ai/surface", () => {
  it("ユーザー一覧情報を取得する", async () => {
    const res = await POST(new Request("/api/ai/surface", { method: "POST" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.length).toBe(1);
  });
});
