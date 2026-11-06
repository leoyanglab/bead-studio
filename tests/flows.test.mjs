import test from "node:test";
import assert from "node:assert/strict";
import worker from "../dist/server/worker.js";
import { openDatabase } from "../scripts/sqlite.mjs";
const design = { name: "接口测试", ids: ["jade", "green", "gold"], wrist: 16 };
function harness() {
  const DB = openDatabase(":memory:");
  const env = { DB, ORDERS_ENABLED: "true" };
  const call = (
    path,
    body,
    cookie = "",
    method = body ? "POST" : "GET",
    origin = "https://test.local",
  ) =>
    worker.fetch(
      new Request("https://test.local" + path, {
        method,
        headers: {
          "Content-Type": "application/json",
          Origin: origin,
          Cookie: cookie,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }),
      env,
    );
  return { DB, call };
}
async function register(call, email) {
  const r = await call("/api/auth/register", {
    email,
    name: "Test User",
    password: "strong-test-password-123",
  });
  assert.equal(r.status, 200);
  return {
    cookie: r.headers.get("set-cookie").split(";")[0],
    user: (await r.json()).user,
  };
}
test("SSR includes UI before JS; design states isolated and safely serialized", async () => {
  const { DB, call } = harness();
  const a = await register(call, "a@example.com");
  const r = await call(
    "/api/designs",
    { ...design, name: "</script><script>alert(1)</script>" },
    a.cookie,
  );
  const { id } = await r.json();
  const page = await call("/design/" + id);
  const html = await page.text();
  assert.match(html, /让灵感/);
  assert.match(html, /\\u003c\/script>/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  const home = await (await call("/")).text();
  assert.match(home, /苔间晨露/);
  assert.doesNotMatch(home, /alert\(1\)/);
  assert.equal(home.includes('"user":null'), true);
  DB.close();
});
test("auth, owner isolation, authoritative pricing, idempotency, payment and fulfillment", async () => {
  const { DB, call } = harness();
  const a = await register(call, "buyer@example.com");
  const b = await register(call, "other@example.com");
  assert.equal((await call("/api/orders")).status, 401);
  assert.equal((await call("/api/admin/orders", null, a.cookie)).status, 403);
  assert.equal(
    (
      await call("/api/auth/login", {
        email: "buyer@example.com",
        password: "wrong-password-123",
      })
    ).status,
    401,
  );
  const body = {
    design,
    quantity: 2,
    recipient: "Test",
    phone: "12345678900",
    address: "Test street, Example City",
    note: "test",
    idempotencyKey: "same-request-key-1234",
    total: 1,
  };
  const order = await call("/api/orders", body, a.cookie);
  assert.equal(order.status, 200);
  const { id } = await order.json();
  assert.equal(
    (await (await call("/api/orders", body, a.cookie)).json()).id,
    id,
  );
  const own = (await (await call("/api/orders", null, a.cookie)).json()).orders;
  assert.equal(own.length, 1);
  assert.equal(own[0].total, 6600);
  assert.equal(
    (await (await call("/api/orders", null, b.cookie)).json()).orders.length,
    0,
  );
  assert.equal(
    (await call("/api/orders/" + id, { action: "cancel" }, b.cookie, "PATCH"))
      .status,
    404,
  );
  assert.equal(
    (
      await call(
        "/api/orders/" + id,
        { action: "payment", paymentNote: "paid" },
        a.cookie,
        "PATCH",
      )
    ).status,
    409,
  );
  await DB.prepare("UPDATE users SET role='admin' WHERE id=?")
    .bind(b.user.id)
    .run();
  assert.equal(
    (
      await call(
        "/api/admin/orders/" + id,
        { status: "shipped", tracking: "123" },
        b.cookie,
        "PATCH",
      )
    ).status,
    409,
  );
  for (const status of ["awaiting_payment"])
    assert.equal(
      (await call("/api/admin/orders/" + id, { status }, b.cookie, "PATCH"))
        .status,
      200,
    );
  assert.equal(
    (
      await call(
        "/api/orders/" + id,
        { action: "payment", paymentNote: "Test payment proof" },
        a.cookie,
        "PATCH",
      )
    ).status,
    200,
  );
  for (const status of ["paid", "making", "shipped"])
    assert.equal(
      (
        await call(
          "/api/admin/orders/" + id,
          { status, tracking: "Test carrier 123" },
          b.cookie,
          "PATCH",
        )
      ).status,
      200,
    );
  assert.equal(
    (await call("/api/orders/" + id, { action: "received" }, a.cookie, "PATCH"))
      .status,
    200,
  );
  assert.equal(
    (await call("/api/orders/" + id, { action: "cancel" }, a.cookie, "PATCH"))
      .status,
    409,
  );
  assert.equal(
    (
      await call(
        "/api/auth/password",
        {
          currentPassword: "strong-test-password-123",
          password: "new-secure-password-123",
        },
        a.cookie,
      )
    ).status,
    200,
  );
  assert.equal((await call("/api/orders", null, a.cookie)).status, 401);
  DB.close();
});
test("validation, CSRF, catalog errors, cancellation and disabled orders", async () => {
  const { DB, call } = harness();
  const a = await register(call, "valid@example.com");
  assert.equal(
    (
      await call(
        "/api/orders",
        { design: { ...design, ids: ["unknown"] }, quantity: 1 },
        a.cookie,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "/api/designs",
        design,
        a.cookie,
        "POST",
        "https://evil.example",
      )
    ).status,
    403,
  );
  assert.equal((await call("/api/does-not-exist")).status, 404);
  assert.equal((await call("/design/does-not-exist")).status, 404);
  const r = await call(
    "/api/orders",
    {
      design,
      quantity: 1,
      recipient: "Test",
      phone: "1234567890",
      address: "Test street Example City",
      idempotencyKey: "cancel-test-12345",
    },
    a.cookie,
  );
  const { id } = await r.json();
  assert.equal(
    (await call("/api/orders/" + id, { action: "cancel" }, a.cookie, "PATCH"))
      .status,
    200,
  );
  const res = await worker.fetch(
    new Request("https://test.local/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: a.cookie },
      body: "{}",
    }),
    { DB, ORDERS_ENABLED: "false" },
  );
  assert.equal(res.status, 503);
  DB.close();
});
