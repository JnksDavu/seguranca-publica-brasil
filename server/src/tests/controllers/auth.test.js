jest.mock("../../middlewares/auth", () => (req, res, next) => next());

const request = require("supertest");
const app = require("../../app");

describe("AUTH CONTROLLER - Rotas válidas", () => {

  test("GET /api/auth/token-test retorna token válido", async () => {
    const res = await request(app).get("/api/auth/token-test");

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe("string");
  });

  test("GET /api/auth/system-token retorna token de sistema", async () => {
    const res = await request(app).get("/api/auth/system-token");

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe("string");
  });

});
