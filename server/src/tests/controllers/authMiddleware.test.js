const auth = require("../../middlewares/auth");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn()
}));

describe("AUTH MIDDLEWARE", () => {

  test("Deve permitir acesso com token válido", () => {
    const req = { headers: { authorization: "Bearer VALID_TOKEN" } };
    const res = {};
    const next = jest.fn();

    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { id: 1 });
    });

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 1 });
  });

  test("Deve bloquear acesso sem token", () => {
    const req = { headers: {} };
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) };

    auth(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: "Token não fornecido" });
  });

  test("Deve bloquear token mal formatado", () => {
    const req = { headers: { authorization: "Bearer" } };
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) };

    auth(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ error: "Token mal formatado" });
  });

  test("Deve bloquear token inválido ou expirado", () => {
    const req = { headers: { authorization: "Bearer INVALID" } };
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })) };

    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(new Error("invalid"), null);
    });

    auth(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ error: "Token inválido ou expirado" });
  });
});
