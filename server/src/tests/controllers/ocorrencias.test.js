jest.mock("../../middlewares/auth", () => (req, res, next) => next());

const request = require("supertest");
const app = require("../../app");

jest.mock("../../config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() }
}));
const dbMock = require("../../config/db");

describe("OCORRÊNCIAS - /api/ocorrencias", () => {
  const mute = () => jest.spyOn(console, "error").mockImplementation(() => {});
  let unmute;

  beforeEach(() => {
    jest.clearAllMocks();
    if (unmute) unmute.mockRestore();
  });

  test("GET / retorna ocorrências", async () => {
    const rows = [{ evento: "Furto" }];
    dbMock.query.mockResolvedValueOnce({ rows });

    const res = await request(app).get("/api/ocorrencias");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].evento).toBe("Furto");
  });

  test("GET / aplica filtros", async () => {
    const rows = [{ evento: "Roubo" }];
    dbMock.query.mockResolvedValueOnce({ rows });

    const res = await request(app).get("/api/ocorrencias?uf=SC&ano=2022&mes=1");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].evento).toBe("Roubo");
  });

  test("GET / retorna [] quando vazio", async () => {
    dbMock.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get("/api/ocorrencias");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("GET / erro 500", async () => {
    unmute = mute();
    dbMock.query.mockRejectedValueOnce(new Error("erro"));

    const res = await request(app).get("/api/ocorrencias");

    expect(res.status).toBe(500);
    const msg = res.body && (res.body.error || res.body.message);
    expect(msg).toBeDefined();
  });

  describe("Indicadores", () => {
    test("GET /indicadores sucesso (vazio => defaults)", async () => {
      // Muitos controllers calculam a partir de várias queries. Para cobrir linhas,
      // respondemos vazio para todas as chamadas.
      dbMock.query.mockResolvedValue({ rows: [] });

      const res = await request(app).get("/api/ocorrencias/indicadores");

      // Só garantimos que não quebrou e retornou algo coerente.
      expect([200, 204]).toContain(res.status);
      // Se 200, geralmente retorna objeto de indicadores
      if (res.status === 200) {
        expect(typeof res.body).toBe("object");
      }
    });

    test("GET /indicadores erro 500", async () => {
      unmute = mute();
      dbMock.query.mockRejectedValueOnce(new Error("erro"));

      const res = await request(app).get("/api/ocorrencias/indicadores");

      expect(res.status).toBe(500);
      const msg = res.body && (res.body.error || res.body.message);
      expect(msg).toBeDefined();
    });
  });
});