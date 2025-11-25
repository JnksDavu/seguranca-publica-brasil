jest.mock("../../middlewares/auth", () => (req, res, next) => next());

const request = require("supertest");
const app = require("../../app");

jest.mock("../../config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() }
}));

const dbMock = require("../../config/db");

describe("GET /api/rodovias/indicadores", () => {

  beforeEach(() => jest.clearAllMocks());

  test("Deve retornar indicadores gerais", async () => {
    dbMock.query
      .mockResolvedValueOnce({ rows: [{ total_acidentes: 10 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/rodovias/indicadores");

    expect(res.status).toBe(200);
    expect(res.body.indicadores_gerais.total_acidentes).toBe(10);
  });

  test("Deve retornar erro 500 se DB falhar", async () => {
    dbMock.query.mockRejectedValueOnce(new Error("erro"));

    const res = await request(app).get("/api/rodovias/indicadores");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Erro ao consultar indicadores");
  });

});
