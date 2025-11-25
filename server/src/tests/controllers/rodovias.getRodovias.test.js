jest.mock("../../middlewares/auth", () => (req, res, next) => next());
const request = require("supertest");
const app = require("../../app");

jest.mock("../../config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() }
}));

const dbMock = require("../../config/db");

describe("GET /api/rodovias", () => {

  beforeEach(() => jest.clearAllMocks());

  test("Deve retornar lista de rodovias", async () => {
    dbMock.query
      .mockResolvedValueOnce({ rows: [{ total: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id_acidente_bronze: 1 }] });

    const response = await request(app).get("/api/rodovias");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });

  test("Deve aplicar filtros", async () => {
    dbMock.query
      .mockResolvedValueOnce({ rows: [{ total: 1 }] })
      .mockResolvedValueOnce({
        rows: [{ id_acidente_bronze: 15, uf_abrev: "SC" }]
      });

    const response = await request(app).get("/api/rodovias?uf=SC");

    expect(response.status).toBe(200);
    expect(response.body[0].uf_abrev).toBe("SC");
  });

  test("Deve retornar erro 500", async () => {
    dbMock.query.mockRejectedValueOnce(new Error("erro"));

    const response = await request(app).get("/api/rodovias");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Erro ao consultar rodovias");
  });

});
