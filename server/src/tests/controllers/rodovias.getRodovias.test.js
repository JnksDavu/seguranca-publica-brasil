jest.mock("../../middlewares/auth", () => (req, res, next) => next());
const request = require("supertest");
const app = require("../../app");

const MockStream = require("../helpers/mockStream");

jest.mock("pg-query-stream", () => {
  return jest.fn().mockImplementation(() => {});
});

jest.mock("../../config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() }
}));

const dbMock = require("../../config/db");

// ----------------------------------------------
// TESTES ADICIONAIS PARA COBRIR RAMOS FALTANTES
// ----------------------------------------------

describe("RodoviasController - Extra Coverage", () => {

  beforeEach(() => jest.clearAllMocks());

  // -------------------------------------------------
  // EXPORT - stream com 1 linha sendo emitida
  // -------------------------------------------------
  test("ExportRodovias — stream emitindo data + end", async () => {
    const stream = new MockStream();

    const fakeClient = {
      query: () => stream,
      release: jest.fn()
    };

    dbMock.pool.connect.mockResolvedValue(fakeClient);

    setTimeout(() => {
      stream.emit("data", { id_acidente_bronze: 1 });
      stream.emit("end");
    }, 10);

    const res = await request(app).post("/api/rodovias/export");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
  });

  // -------------------------------------------------
  // EXPORT - stream com erro emitido
  // -------------------------------------------------
  test("ExportRodovias — stream emitindo erro", async () => {
    const stream = new MockStream();

    const fakeClient = {
      query: () => stream,
      release: jest.fn()
    };

    dbMock.pool.connect.mockResolvedValue(fakeClient);

    setTimeout(() => {
      stream.emit("error", new Error("stream error"));
    }, 10);

    const res = await request(app).post("/api/rodovias/export");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Erro ao exportar rodovias");
  });

  // -------------------------------------------------
  // getRodovias — filtro de string que vira ILIKE
  // -------------------------------------------------
  test("getRodovias — filtro ILIKE simples", async () => {
    dbMock.query
      .mockResolvedValueOnce({ rows: [{ total: 1 }] })
      .mockResolvedValueOnce({ rows: [{ uf_abrev: "RJ" }] });

    const res = await request(app).get("/api/rodovias?municipio=rio%20de%20janeiro");

    expect(res.status).toBe(200);
    expect(res.body[0].uf_abrev).toBe("RJ");
  });

  // -------------------------------------------------
  // getRodovias — filtro com partes vazias "SC,,PR"
  // -------------------------------------------------
  test("getRodovias — filtro múltiplo com partes vazias ignoradas", async () => {
    dbMock.query
      .mockResolvedValueOnce({ rows: [{ total: 2 }] })
      .mockResolvedValueOnce({
        rows: [{ uf_abrev: "SC" }, { uf_abrev: "PR" }]
      });

    const res = await request(app).get("/api/rodovias?uf=SC,,PR");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  // -------------------------------------------------
  // Indicadores — parâmetro idade_sexo
  // -------------------------------------------------
  test("getIndicadores — idade_sexo vazio retorna defaults", async () => {
    dbMock.query
      .mockResolvedValueOnce({ rows: [{ total_acidentes: 1 }] }) // indicadores gerais
      .mockResolvedValue(new Error("ignored"))                    // ignora outros
      .mockResolvedValueOnce({ rows: [] });                       // idade_sexo vazio

    const res = await request(app).get("/api/rodovias/indicadores?indicador=idade_sexo");

    expect(res.status).toBe(200);
    expect(res.body.acidentes_por_idade_sexo).toEqual({
      mulheres_envolvidas: 0,
      homens_envolvidos: 0,
      media_idade_feridos: 0
    });
  });

  // -------------------------------------------------
  // Indicadores — percapita sem filtros
  // -------------------------------------------------
  test("getIndicadores — percapita sem filtros retorna vazio", async () => {
    dbMock.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/rodovias/indicadores?indicador=percapita");

    expect(res.status).toBe(200);
    expect(res.body.acidentes_por_percapita).toEqual([]);
  });

});
