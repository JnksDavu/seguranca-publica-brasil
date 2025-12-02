jest.mock("../../middlewares/auth", () => (req, res, next) => next());

const request = require("supertest");
const app = require("../../app");

jest.mock("../../config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() }
}));

const dbMock = require("../../config/db");

describe("DIMENSÕES - /api/dimensoes", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET /calendario", async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [{ ano: 2023 }]
    });

    const res = await request(app).get("/api/dimensoes/calendario");

    expect(res.status).toBe(200);
    expect(res.body[0].ano).toBe(2023);
  });

  test("GET /localidade", async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [{ uf: "SC" }]
    });

    const res = await request(app).get("/api/dimensoes/localidade");

    expect(res.status).toBe(200);
    expect(res.body[0].uf).toBe("SC");
  });

  test("GET /tipoAcidente", async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [{ tipo: "Colisão" }]
    });

    const res = await request(app).get("/api/dimensoes/tipoAcidente");

    expect(res.status).toBe(200);
    expect(res.body[0].tipo).toBe("Colisão");
  });

  test("GET /crime", async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [{ nome: "Furto" }]
    });

    const res = await request(app).get("/api/dimensoes/crime");

    expect(res.status).toBe(200);
    expect(res.body[0].nome).toBe("Furto");
  });

  test("GET /estabelecimento", async () => {
    const rows = [{ id: 10, nome: "Presídio A" }];
    dbMock.query.mockResolvedValueOnce({ rows });

    const res = await request(app).get("/api/dimensoes/estabelecimento");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });

  test.each([
    "/api/dimensoes/calendario",
    "/api/dimensoes/localidade",
    "/api/dimensoes/tipoAcidente",
    "/api/dimensoes/crime",
    "/api/dimensoes/estabelecimento"
  ])("GET %s should return empty array when no rows", async (path) => {
    dbMock.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get(path);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test.each([
    "/api/dimensoes/calendario",
    "/api/dimensoes/localidade",
    "/api/dimensoes/tipoAcidente",
    "/api/dimensoes/crime",
    "/api/dimensoes/estabelecimento"
  ])("GET %s should handle DB error with 500", async (path) => {
    dbMock.query.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get(path);

    expect(res.status).toBe(500);
    const message = res.body && (res.body.error || res.body.message);
    expect(message).toBeDefined();
  });
});