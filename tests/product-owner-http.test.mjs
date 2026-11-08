import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createProductOwnerHandler } from "../src/http/product-owner.mjs";

const contract = JSON.parse(readFileSync(new URL("../contracts/openapi/product-owner.v1.json", import.meta.url)));
const route = "/api/v1/owner/tenants/{tenantId}/memberships/{actorId}";
const url = "https://ei.test" + route.replace("{tenantId}", "tenant-a").replace("{actorId}", "user-a");
const revision = "00000000-0000-4000-8000-000000000001";
const membership = { role: "teacher", active: true, revision, confidential: "hidden" };

function request({ token = "owner", method = "GET", body, contentType, tag } = {}) {
  const headers = { Authorization: "Bearer " + token, "X-Owner": "owner", "X-Role": "product_owner" };
  if (contentType) headers["Content-Type"] = contentType;
  if (tag) headers["If-Match"] = tag;
  return new Request(url, { method, body, headers });
}

async function check(response, method, status) {
  assert.equal(response.status, status);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const payload = await response.json();
  assert.equal(payload.requestId, response.headers.get("X-Request-Id"));
  assert.match(payload.requestId, /^[a-f0-9-]{36}$/);
  const ref = contract.paths[route][method].responses[status].$ref.split("/").at(-1);
  if (status >= 400) {
    const error = contract.components.responses[ref].content["application/json"].schema;
    assert.deepEqual(Object.keys(payload).sort(), [...error.required].sort());
    assert.ok(error.properties.code.enum.includes(payload.code));
  }
  return payload;
}

test("owner read projects only allowed fields and ignores the caller's role claim", async () => {
  const calls = [];
  const handler = createProductOwnerHandler({
    ownerSubject: "owner",
    verifyBearer: async token => ({ subject: token, stepUpVerified: token !== "old", role: "product_owner" }),
    readMembership: async args => { calls.push(args); return membership; },
  });
  await check(await handler(request({ token: "manager" })), "get", 404);
  const response = await handler(request());
  assert.equal(response.headers.get("ETag"), '"' + revision + '"');
  const { membership: view } = await check(response, "get", 200);
  assert.deepEqual(view, { tenantId: "tenant-a", actorId: "user-a", role: "teacher", active: true });
  assert.deepEqual(calls, [{ tenantId: "tenant-a", actorId: "user-a" }]);
});

test("owner mutation requires step-up, exact JSON, and a strong revision", async () => {
  const calls = [];
  const put = { method: "PUT", body: '{"role":"teacher","active":false}', contentType: "application/json" };
  const tag = '"' + revision + '"';
  const handler = createProductOwnerHandler({
    ownerSubject: "owner",
    verifyBearer: async token => ({ subject: "owner", stepUpVerified: token === "owner" }),
    changeMembership: async args => {
      calls.push(args);
      return { membership: { ...membership, ...args.policy } };
    },
  });
  await check(await handler(request({ ...put, tag, token: "old" })), "put", 403);
  await check(await handler(request(put)), "put", 428);
  await check(await handler(request({ ...put, tag: "W/" + tag })), "put", 400);
  await check(await handler(request({ ...put, tag, contentType: "text/plain" })), "put", 415);
  await check(await handler(request({ ...put, tag, body: " ".repeat(1025) })), "put", 413);
  await check(await handler(request({ ...put, tag, body: '{"role":"product_owner","active":true}' })), "put", 400);
  const result = await check(await handler(request({ ...put, tag })), "put", 200);
  assert.equal(result.membership.active, false);
  assert.deepEqual(calls, [{ tenantId: "tenant-a", actorId: "user-a", ownerSubject: "owner",
    expectedRevision: revision, requestId: result.requestId, policy: { role: "teacher", active: false } }]);
});

test("stale state and store failures get distinct responses without private error details", async () => {
  const put = { method: "PUT", body: '{"role":"teacher","active":false}', contentType: "application/json", tag: '"' + revision + '"' };
  const handler = createProductOwnerHandler({
    ownerSubject: "owner",
    verifyBearer: async () => ({ subject: "owner", stepUpVerified: true }),
    changeMembership: async () => ({ changed: false }),
    readMembership: async () => { throw Error("private database connection"); },
  });
  assert.equal((await check(await handler(request(put)), "put", 412)).code, "MEMBERSHIP_CHANGED");
  assert.equal((await check(await handler(request()), "get", 503)).code, "OWNER_CONTROL_UNAVAILABLE");
});
