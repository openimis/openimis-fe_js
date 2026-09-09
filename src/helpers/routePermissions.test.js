import { beforeEach, describe, expect, it, vi } from "vitest";

const hasRight = vi.fn();
vi.mock("@openimis/fe-core", () => ({ hasRight: (...args) => hasRight(...args) }));

const { canAccessRoute, getRouteIcon } = await import("./routePermissions.js");

const managerWith = (permission) => ({ getRoutePermission: () => permission });

describe("canAccessRoute", () => {
  beforeEach(() => hasRight.mockReset());

  it("denies access when the route declares no permission at all", () => {
    expect(canAccessRoute("/x", managerWith(undefined), ["1001"])).toBe(false);
    expect(hasRight).not.toHaveBeenCalled();
  });

  it("denies access when the permission entry declares neither rights nor right", () => {
    expect(canAccessRoute("/x", managerWith({ icon: "People" }), ["1001"])).toBe(false);
    expect(hasRight).not.toHaveBeenCalled();
  });

  describe("with a list of rights", () => {
    const permission = { rights: ["1001", "1002"] };

    it("grants access if the user holds any one of them", () => {
      hasRight.mockImplementation((right) => right === "1002");

      expect(canAccessRoute("/x", managerWith(permission), ["1002"])).toBe(true);
    });

    it("denies access if the user holds none of them", () => {
      hasRight.mockReturnValue(false);

      expect(canAccessRoute("/x", managerWith(permission), [])).toBe(false);
      expect(hasRight).toHaveBeenCalledTimes(2);
    });

    it("stops checking once a right matches", () => {
      hasRight.mockReturnValue(true);

      canAccessRoute("/x", managerWith(permission), ["1001"]);

      expect(hasRight).toHaveBeenCalledTimes(1);
    });

    it("denies access for an empty rights list", () => {
      expect(canAccessRoute("/x", managerWith({ rights: [] }), ["1001"])).toBe(false);
      expect(hasRight).not.toHaveBeenCalled();
    });

    it("passes the user's rights through to hasRight", () => {
      hasRight.mockReturnValue(false);
      const userRights = ["1001", "9999"];

      canAccessRoute("/x", managerWith({ rights: ["1001"] }), userRights);

      expect(hasRight).toHaveBeenCalledWith("1001", userRights);
    });
  });

  describe("with a single right", () => {
    it("delegates the decision to hasRight", () => {
      hasRight.mockReturnValue(true);

      expect(canAccessRoute("/x", managerWith({ right: "1001" }), ["1001"])).toBe(true);
      expect(hasRight).toHaveBeenCalledWith("1001", ["1001"]);
    });

    it("denies access when hasRight says no", () => {
      hasRight.mockReturnValue(false);

      expect(canAccessRoute("/x", managerWith({ right: "1001" }), [])).toBe(false);
    });
  });

  it("prefers the rights list when an entry carries both shapes", () => {
    hasRight.mockImplementation((right) => right === "single");

    const permission = { rights: ["listed"], right: "single" };

    expect(canAccessRoute("/x", managerWith(permission), [])).toBe(false);
    expect(hasRight).toHaveBeenCalledExactlyOnceWith("listed", []);
  });
});

describe("getRouteIcon", () => {
  it("returns the icon declared for the route", () => {
    expect(getRouteIcon("/x", managerWith({ icon: "People" }))).toBe("People");
  });

  it("returns null when the route has a permission but no icon", () => {
    expect(getRouteIcon("/x", managerWith({ right: "1001" }))).toBeNull();
  });

  it("returns null when the route has no permission entry", () => {
    expect(getRouteIcon("/x", managerWith(undefined))).toBeNull();
  });
});
