jest.mock("../../middlewares/auth", () => (req, res, next) => next());
const request = require("supertest");
const app = require("../../app");

jest.mock("../../config/db", () => ({
  query: jest.fn(),
  pool: { connect: jest.fn() }
}));

const dbMock = require("../../config/db");

describe("POST /api/rodovias/export", () => {

  beforeEach(() => jest.clearAllMocks());

  test("Deve gerar arquivo CSV", async () => {

    dbMock.pool.connect.mockResolvedValue({
      query: () => ({
        on: jest.fn().mockImplementation((evento, cb) => {
          if (evento === "end") cb();
        })
      }),
      release: jest.fn()
    });

    const response = await request(app).post("/api/rodovias/export");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
  });

});
