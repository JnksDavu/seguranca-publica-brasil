jest.mock("../../middlewares/auth", () => (req, res, next) => next());
const request = require("supertest");
const app = require("../../app");

jest.mock("../../config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() }
}));

const dbMock = require("../../config/db");

describe("GET /api/rodovias/indicadores - COMPLETO", () => {

  beforeEach(() => jest.clearAllMocks());

  // Caso geral (all)
  test("Deve retornar indicadores gerais (modo ALL)", async () => {
    for (let i = 0; i < 15; i++) {
      dbMock.query.mockResolvedValueOnce({ rows: [] });
    }

    dbMock.query.mockResolvedValueOnce({
      rows: [{ total_acidentes: 10 }]
    });

    const res = await request(app).get("/api/rodovias/indicadores");

    expect(res.status).toBe(200);
    expect(res.body.indicadores_gerais.total_acidentes).toBe(10);
  });

  // Indicador específico
  test("Deve retornar indicador específico (mes)", async () => {
    dbMock.query.mockResolvedValueOnce({
      rows: [{ nome_mes: "Janeiro", total: 3 }]
    });

    const res = await request(app).get("/api/rodovias/indicadores?indicador=mes");

    expect(res.status).toBe(200);
  });

  // Percapita
  test("Deve retornar indicador percapita", async () => {
    dbMock.query.mockResolvedValue({
      rows: [{ municipio: "Florianópolis" }]
    });

    const res = await request(app).get("/api/rodovias/indicadores?indicador=percapita&municipio=florianopolis");

    expect(res.status).toBe(200);
  });

  // Erro no DB
  test("Deve retornar erro 500", async () => {
    dbMock.query.mockRejectedValueOnce(new Error("erro"));

    const res = await request(app).get("/api/rodovias/indicadores");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Erro ao consultar indicadores");
  });

});
