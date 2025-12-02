jest.mock("../../middlewares/auth", () => (req, res, next) => next());

const request = require("supertest");
const app = require("../../app");

jest.mock("../../config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() }
}));
const dbMock = require("../../config/db");

const PATHS = {
  LISTA: "/api/presidios",
  INDICADORES: "/api/presidios/indicadores"
};

describe("PRESÍDIOS - rotas principais", () => {
  const mute = () => jest.spyOn(console, "error").mockImplementation(() => {});
  let unmute;

  beforeEach(() => {
    jest.clearAllMocks();
    if (unmute) unmute.mockRestore();
  });

  test("GET /presidios retorna estabelecimentos", async () => {
    const rows = [
      { id: 1, nome: "Presídio A", uf: "SC" },
      { id: 2, nome: "Presídio B", uf: "PR" }
    ];
    dbMock.query.mockResolvedValueOnce({ rows });

    const res = await request(app).get(PATHS.LISTA);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
  });

  test("GET /presidios retorna [] quando vazio", async () => {
    dbMock.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get(PATHS.LISTA);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("GET /presidios erro 500", async () => {
    unmute = mute();
    dbMock.query.mockRejectedValueOnce(new Error("erro"));

    const res = await request(app).get(PATHS.LISTA);

    expect(res.status).toBe(500);
    const msg = res.body && (res.body.error || res.body.message);
    expect(msg).toBeDefined();
  });

  test("GET /presidios/indicadores sucesso (vazio => defaults)", async () => {
    dbMock.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get(PATHS.INDICADORES);

    expect([200, 204]).toContain(res.status);
    if (res.status === 200) {
      expect(typeof res.body).toBe("object");
    }
  });

  test("GET /presidios/indicadores erro 500", async () => {
    unmute = mute();
    dbMock.query.mockRejectedValueOnce(new Error("erro"));

    const res = await request(app).get(PATHS.INDICADORES);

    expect(res.status).toBe(500);
    const msg = res.body && (res.body.error || res.body.message);
    expect(msg).toBeDefined();
  });
});