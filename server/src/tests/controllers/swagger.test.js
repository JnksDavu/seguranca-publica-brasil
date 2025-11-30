/// <reference types="jest" />

jest.mock("swagger-ui-express", () => ({
  serve: (req, res, next) => next(),
  setup: () => (req, res) => res.send("swagger-ui-mock")
}));

jest.mock("../../swagger/swagger", () => ({
  swaggerUi: {
    serve: (req, res, next) => next(),
    setup: () => (req, res) => res.send("swagger-ui-mock")
  },
  swaggerSpec: { swagger: "spec-mock" }
}));

const request = require("supertest");
const app = require("../../app");

describe("SWAGGER ROUTES", () => {
  
  test("GET /api/docs deve retornar UI do Swagger", async () => {
    const res = await request(app).get("/api/docs");
    expect(res.status).toBe(200);
    expect(res.text).toContain("swagger-ui-mock");
  });

  test("GET /api/docs/json deve retornar swaggerSpec JSON", async () => {
    const res = await request(app).get("/api/docs/json");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ swagger: "spec-mock" });
  });

});
