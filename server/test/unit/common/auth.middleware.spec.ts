import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/common/utils/auth.utils.js", () => ({
  verifyToken: vi.fn()
}));

vi.mock("../../../src/services/users.service.js", () => ({
  usersService: {
    getByToken: vi.fn()
  }
}));

import { verifyToken } from "../../../src/common/utils/auth.utils.js";
import { usersService } from "../../../src/services/users.service.js";
import { authMiddleware } from "../../../src/common/middlewares/auth.middleware.js";

const createRes = () => {
  const res = {
    locals: {},
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  } as unknown as Response;

  return res;
};

describe("authMiddleware (unit)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when token is not provided", async () => {
    const req = { headers: {} } as Request;
    const res = createRes();
    const next = vi.fn() as unknown as NextFunction;

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("loads user and calls next on valid token", async () => {
    const req = { headers: { authorization: "Bearer token" } } as unknown as Request;
    const res = createRes();
    const next = vi.fn() as unknown as NextFunction;

    vi.mocked(verifyToken).mockReturnValue({ id: "u1" } as never);
    vi.mocked(usersService.getByToken).mockResolvedValue({ id: "u1", email: "u@test.com", name: "U", isAdmin: false });

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((res.locals as { user?: { id: string } }).user?.id).toBe("u1");
  });

  it("returns 401 on invalid token", async () => {
    const req = { headers: { authorization: "Bearer bad-token" } } as unknown as Request;
    const res = createRes();
    const next = vi.fn() as unknown as NextFunction;

    vi.mocked(verifyToken).mockImplementation(() => {
      throw new Error("invalid");
    });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 404 when token resolves to a missing user", async () => {
    const req = { headers: { authorization: "Bearer token" } } as unknown as Request;
    const res = createRes();
    const next = vi.fn() as unknown as NextFunction;

    vi.mocked(verifyToken).mockReturnValue({ id: "missing" } as never);
    vi.mocked(usersService.getByToken).mockResolvedValue(null as never);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });
});
