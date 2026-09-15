import { describe, expect, it, vi } from "vitest";

// modules.jsx is generated and statically imports every module.
vi.mock("./modules.jsx", () => ({
  loadModules: vi.fn(),
  packages: ["@openimis/fe-core", "@openimis/fe-not-installed"],
}));

// Stubbed rather than importing the fe-core barrel, which imports itself.
vi.mock("@openimis/fe-core", () => ({
  ensureArray: (maybeArray) => {
    if (Array.isArray(maybeArray)) return maybeArray;
    if (maybeArray !== null && maybeArray !== undefined) return [maybeArray];
    return [];
  },
}));

const { loadModules } = await import("./modules.jsx");
const { default: ModulesManager } = await import("./ModulesManager.jsx");

const managerFor = (modules = [], cfg = {}) => new ModulesManager(cfg, modules);

describe("ModulesManager", () => {
  describe("init", () => {
    it("resolves a manager around the loaded modules", async () => {
      loadModules.mockResolvedValueOnce([{ refs: [{ key: "a", ref: ["id"] }] }]);

      const mm = await ModulesManager.init({});

      expect(mm).toBeInstanceOf(ModulesManager);
      expect(mm.getRef("a")).toEqual(["id"]);
    });

    it("wraps a module-loading failure instead of surfacing the raw error", async () => {
      loadModules.mockRejectedValueOnce(new Error("duplicate module"));

      await expect(ModulesManager.init({})).rejects.toThrow(/Loading modules failed[\s\S]*duplicate module/);
    });
  });

  describe("controls cache / hideField", () => {
    const cfg = {
      "fe-insuree": {
        controls: [
          { field: "chfId", usage: 1 },
          { field: "lastName", usage: 0 },
          { field: "phone", usage: 3 },
        ],
      },
      "fe-claim": { controls: [{ field: "code", usage: 2 }] },
      "fe-policy": {},
    };

    it("flattens every module's controls into <module>.<field> keys", () => {
      expect(managerFor([], cfg).controlsCache).toEqual({
        "fe-insuree.chfId": 1,
        "fe-insuree.lastName": 0,
        "fe-insuree.phone": 3,
        "fe-claim.code": 2,
      });
    });

    it("reads the low bit of usage, so odd values hide and even values do not", () => {
      const mm = managerFor([], cfg);

      expect(mm.hideField("insuree", "chfId")).toBe(1);
      expect(mm.hideField("insuree", "lastName")).toBe(0);
      expect(mm.hideField("insuree", "phone")).toBe(1);
      expect(mm.hideField("claim", "code")).toBe(0);
    });

    it("does not hide fields it has no control entry for", () => {
      expect(managerFor([], cfg).hideField("insuree", "unknownField")).toBe(0);
      expect(managerFor([], cfg).hideField("unknownModule", "chfId")).toBe(0);
    });
  });

  describe("refs and projections", () => {
    const modules = [
      { refs: [{ key: "insuree.picker", ref: ["id", "chfId"] }] },
      { refs: { key: "claim.picker", ref: ["uuid"] } },
    ];

    it("indexes refs from every module, whether contributed singly or as a list", () => {
      const mm = managerFor(modules);

      expect(mm.getRef("insuree.picker")).toEqual(["id", "chfId"]);
      expect(mm.getRef("claim.picker")).toEqual(["uuid"]);
      expect(mm.getRef("nope")).toBeUndefined();
    });

    it("renders a ref as a GraphQL projection", () => {
      expect(managerFor(modules).getProjection("insuree.picker")).toBe("{id, chfId}");
    });

    it("returns an empty projection for an unknown ref rather than throwing", () => {
      expect(managerFor(modules).getProjection("nope")).toBe("");
    });
  });

  describe("reports cache", () => {
    const validReport = { key: "claims", getParams: () => ({}), isValid: () => true };

    it("indexes reports by key", () => {
      const mm = managerFor([{ reports: [validReport] }]);
      expect(mm.getReport("claims")).toBe(validReport);
      expect(mm.getReport("missing")).toBeUndefined();
    });

    it("still registers a malformed report but logs which contract it breaks", () => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});

      const mm = managerFor([{ reports: [{ key: "broken" }] }]);

      expect(mm.getReport("broken")).toBeDefined();
      expect(error).toHaveBeenCalledTimes(2);
      expect(error.mock.calls.map(([m]) => m)).toEqual([
        "Report broken has no getParams function.",
        "Report broken has no isValid function.",
      ]);
    });
  });

  describe("getContribs", () => {
    it("concatenates a contribution key across all modules", () => {
      const mm = managerFor([
        { "core.Router": [{ path: "/a" }, { path: "/b" }] },
        { "core.Router": { path: "/c" } },
        { somethingElse: [{ path: "/ignored" }] },
      ]);

      expect(mm.getContribs("core.Router")).toEqual([{ path: "/a" }, { path: "/b" }, { path: "/c" }]);
    });

    it("returns an empty list when no module contributes the key", () => {
      expect(managerFor([{ refs: [] }]).getContribs("nobody.contributes")).toEqual([]);
    });

    it("memoizes per key, so repeated lookups return the identical array", () => {
      const mm = managerFor([{ "core.Router": [{ path: "/a" }] }]);

      expect(mm.getContribs("core.Router")).toBe(mm.getContribs("core.Router"));
    });

    it("memoizes per instance, not globally", () => {
      const first = managerFor([{ "core.Router": [{ path: "/a" }] }]);
      const second = managerFor([{ "core.Router": [{ path: "/z" }] }]);

      expect(first.getContribs("core.Router")).toEqual([{ path: "/a" }]);
      expect(second.getContribs("core.Router")).toEqual([{ path: "/z" }]);
    });
  });

  describe("getConf", () => {
    const mm = () => managerFor([], { "fe-insuree": { pageSize: 10, showPhoto: false, nothing: null } });

    it("reads a configured value", () => {
      expect(mm().getConf("fe-insuree", "pageSize")).toBe(10);
    });

    it("returns falsy configured values rather than falling back", () => {
      expect(mm().getConf("fe-insuree", "showPhoto", true)).toBe(false);
      expect(mm().getConf("fe-insuree", "nothing", "fallback")).toBeNull();
    });

    it("falls back for unknown keys and unknown modules", () => {
      expect(mm().getConf("fe-insuree", "missing", "fallback")).toBe("fallback");
      expect(mm().getConf("fe-unknown", "pageSize", 25)).toBe(25);
    });

    it("defaults the fallback to null", () => {
      expect(mm().getConf("fe-insuree", "missing")).toBeNull();
    });
  });

  describe("getRoutes", () => {
    it("indexes each route under both its path and its id", () => {
      const route = { id: "insuree.route", path: "/insurees" };
      const routes = managerFor([{ "core.Router": [route] }]).getRoutes();

      expect(routes["/insurees"]).toBe(route);
      expect(routes["insuree.route"]).toBe(route);
    });

    it("falls back to the path as key when a route has no id", () => {
      const route = { path: "/anon" };
      expect(managerFor([{ "core.Router": [route] }]).getRoutes()).toEqual({ "/anon": route });
    });

    it("returns an empty map when no module contributes routes", () => {
      expect(managerFor([{ refs: [] }]).getRoutes()).toEqual({});
    });
  });

  describe("getMenuEntries", () => {
    const parent = {
      "core.MainMenu": [{ id: "sp", contributionKey: "socialProtection.MainMenu", text: "menu.sp", icon: "People" }],
    };
    const child = { "socialProtection.MainMenu": [{ text: "menu.sp.benefits", route: "/benefits" }] };

    it("folds child contributions into the parent declared under core.MainMenu", () => {
      const [menu] = managerFor([parent, child]).getMenuEntries();

      expect(menu.id).toBe("sp");
      expect(menu.text).toBe("menu.sp");
      expect(menu.icon).toBe("People");
      expect(menu.entries).toEqual([{ text: "menu.sp.benefits", route: "/benefits" }]);
    });

    it("folds them the same way when the child module is loaded before the parent", () => {
      const [menu] = managerFor([child, parent]).getMenuEntries();

      expect(menu.id).toBe("sp");
      expect(menu.entries).toEqual([{ text: "menu.sp.benefits", route: "/benefits" }]);
    });

    it("merges children contributed by several modules under one parent", () => {
      const otherChild = { "socialProtection.MainMenu": [{ text: "menu.sp.grievances" }] };
      const [menu] = managerFor([parent, child, otherChild]).getMenuEntries();

      expect(menu.entries).toEqual([{ text: "menu.sp.benefits", route: "/benefits" }, { text: "menu.sp.grievances" }]);
    });

    it("keeps an orphan child group as its own menu keyed by contribution key", () => {
      const [menu] = managerFor([child]).getMenuEntries();

      expect(menu.id).toBe("socialProtection.MainMenu");
      expect(menu.entries).toEqual([{ text: "menu.sp.benefits", route: "/benefits" }]);
    });

    it("ignores modules that contribute no menus", () => {
      expect(managerFor([{ refs: [] }]).getMenuEntries()).toEqual([]);
    });
  });

  describe("version reporting", () => {
    it("reports the assembly version from package.json", () => {
      expect(managerFor().getOpenIMISVersion()).toMatch(/^\d/);
    });

    it("marks packages absent from dependencies with '?' instead of undefined", () => {
      const versions = managerFor().getModulesVersions();

      expect(versions).toContain("@openimis/fe-not-installed@?");
      expect(versions.every((v) => !v.endsWith("@undefined"))).toBe(true);
    });
  });
});
