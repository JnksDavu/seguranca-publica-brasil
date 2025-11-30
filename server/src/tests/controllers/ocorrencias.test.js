jest.mock("../../middlewares/auth", () => (req, res, next) => next());

jest.mock("../../controllers/ocorrenciasController", () => {
    const original = jest.requireActual("../../controllers/ocorrenciasController");
    return {
      ...original,
      indicadoresCache: { clear: () => {} }
    };
  });

const request = require("supertest");
const app = require("../../app");

jest.mock("../../config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() }
}));

const dbMock = require("../../config/db");

describe("OCORRÊNCIAS - /api/ocorrencias", () => {

  beforeEach(() => jest.clearAllMocks());

  test("GET / retorna ocorrências", async () => {
    dbMock.query
      .mockResolvedValueOnce({ rows: [{ total: 1 }] }) // COUNT
      .mockResolvedValueOnce({ rows: [{ id_ocorrencia: 1, evento: "Furto" }] }); // Dados

    const res = await request(app).get("/api/ocorrencias");

    expect(res.status).toBe(200);
    expect(res.body.rows.length).toBe(1);
    expect(res.body.rows[0].evento).toBe("Furto");
  });

  test("GET / aplica filtros", async () => {
    dbMock.query
      .mockResolvedValueOnce({ rows: [{ total: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id_ocorrencia: 10, evento: "Roubo" }] });

    const res = await request(app).get("/api/ocorrencias?evento=Roubo");

    expect(res.status).toBe(200);
    expect(res.body.rows[0].evento).toBe("Roubo");
  });

  test("GET / erro 500", async () => {
    dbMock.query.mockRejectedValueOnce(new Error("erro"));

    const res = await request(app).get("/api/ocorrencias");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Erro ao consultar ocorrencias");
  });

  test("GET /indicadores sem filtros", async () => {
    dbMock.query
      .mockResolvedValueOnce({ rows: [{ total_geral: 50 }] }) // gerais
      .mockResolvedValueOnce({ rows: [] }) // mes
      .mockResolvedValueOnce({ rows: [] }) // categoria
      .mockResolvedValueOnce({ rows: [] }) // evento
      .mockResolvedValueOnce({ rows: [] }) // uf
      .mockResolvedValueOnce({ rows: [] }) // municipio
      .mockResolvedValueOnce({ rows: [] }) // dia semana
      .mockResolvedValueOnce({ rows: [] }) // trimestre
      .mockResolvedValueOnce({ rows: [{ total_feminino: 1, total_masculino: 2, total_nao_informado: 0 }] }); // sexo

    const res = await request(app).get("/api/ocorrencias/indicadores");

    expect(res.status).toBe(200);
    expect(res.body.indicadores_gerais.total_geral).toBe(50);
  });

  test("GET /indicadores erro 500", async () => {
    // ERROR GLOBAL EM TODAS QUERIES
    dbMock.query.mockRejectedValue(new Error("erro"));

    const res = await request(app).get("/api/ocorrencias/indicadores");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Erro ao consultar indicadores");
  });

});
