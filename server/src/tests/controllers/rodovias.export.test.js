jest.mock("../../middlewares/auth", () => (req, res, next) => next());

const request = require("supertest");
const app = require("../../app");
const MockStream = require("../helpers/mockStream");

jest.mock("pg-query-stream", () => jest.fn());

jest.mock("../../config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() }
}));

const dbMock = require("../../config/db");

describe("EXPORT RODOVIAS — FIXED", () => {

  beforeEach(() => jest.clearAllMocks());

  test("stream com sucesso", async () => {
    const stream = new MockStream();

    const fakeClient = {
      query: () => stream,
      release: jest.fn()
    };

    dbMock.pool.connect.mockResolvedValue(fakeClient);

    // supertest começa a requisição
    const req = request(app).post("/api/rodovias/export");

    // Emite eventos sincronamente
    stream.data({ id_acidente_bronze: 1 });
    stream.end();

    const res = await req;

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
  });

  test("erro no stream", async () => {
    const stream = new MockStream();

    const fakeClient = {
      query: () => stream,
      release: jest.fn()
    };

    dbMock.pool.connect.mockResolvedValue(fakeClient);

    const req = request(app).post("/api/rodovias/export");

    stream.error(new Error("erro-stream"));

    const res = await req;

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Erro ao exportar rodovias");
  });

  test("erro ao conectar no banco", async () => {
    dbMock.pool.connect.mockRejectedValue(new Error("erro"));

    const res = await request(app).post("/api/rodovias/export");

    expect(res.status).toBe(500);
  });

});
