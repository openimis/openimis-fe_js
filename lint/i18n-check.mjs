#!/usr/bin/env node
// Translation check for an openIMIS frontend module, run by the i18n job of
// .github/workflows/module-ci-build.yml and runnable locally from a module:
//
//   node ../../frontend/lint/i18n-check.mjs [--module-dir .] [--strict] [--verbose]
//
// It reports:
//   - error:   a static key used in src/ that src/translations/en.json lacks;
//   - warning: an en.json key with an empty value;
//   - warning: an en.json key of this module missing from Lokalise (only when
//              LOKALISE_APIKEY is set);
//   - notice:  how many keys could not be checked (computed ids or modules) and
//              how many en.json keys look unused.
//
// Keys are resolved the way @openimis/fe-core does: formatMessage(intl, module, id),
// formatMessageWithValues(intl, module, id, values) and <FormattedMessage module id>
// look up `${module}.${id}` first and fall back to `id`; inputs and pickers given
// literal `module` and `label` props translate the label the same way. Keys that
// belong to another module (formatMessage(intl, "core", ...)) are not checked here:
// that module's en.json is not available.
//
// Exit code is 0 unless --strict is given and an error was found.
// Requires the lint/ dependencies (npm ci in lint/): espree comes with eslint.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(path.join(path.dirname(fileURLToPath(import.meta.url)), "package.json"));
const espree = require("espree");

const LOKALISE_PROJECT = "983881975d551c5fdba845.54008358";
const SOURCE_EXT = new Set([".js", ".jsx", ".mjs"]);
// Props through which fe-core inputs, pickers and filters translate with `module`.
const TRANSLATED_PROPS = ["label"];
const FE_CORE_HELPERS = new Set(["formatMessage", "formatMessageWithValues"]);

function parseArgs(argv) {
  const opts = { moduleDir: ".", strict: false, verbose: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--module-dir") opts.moduleDir = argv[++i];
    else if (a === "--strict") opts.strict = true;
    else if (a === "--verbose" || a === "-v") opts.verbose = true;
    else if (a === "--help" || a === "-h") {
      console.log("usage: i18n-check.mjs [--module-dir DIR] [--strict] [--verbose]");
      process.exit(0);
    } else {
      console.error(`unknown argument: ${a}`);
      process.exit(2);
    }
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
const moduleDir = path.resolve(opts.moduleDir);
const srcDir = path.join(moduleDir, "src");
const enPath = path.join(srcDir, "translations", "en.json");
const inActions = process.env.GITHUB_ACTIONS === "true";

const counts = { error: 0, warning: 0, notice: 0 };

function escapeData(s) {
  return String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
function escapeProp(s) {
  return escapeData(s).replace(/:/g, "%3A").replace(/,/g, "%2C");
}

function report(level, message, loc) {
  counts[level]++;
  const rel = loc?.file ? path.relative(moduleDir, loc.file) : null;
  if (inActions) {
    const props = [];
    if (rel) props.push(`file=${escapeProp(rel)}`);
    if (loc?.line) props.push(`line=${loc.line}`);
    if (loc?.col) props.push(`col=${loc.col}`);
    props.push("title=i18n");
    console.log(`::${level} ${props.join(",")}::${escapeData(message)}`);
  } else {
    const where = rel ? `${rel}${loc.line ? `:${loc.line}${loc.col ? `:${loc.col}` : ""}` : ""}  ` : "";
    console.log(`${level.padEnd(7)} ${where}${message}`);
  }
}

if (!fs.existsSync(srcDir)) {
  report("warning", `no src/ in ${moduleDir}; translation check skipped`);
  process.exit(0);
}

// --- en.json --------------------------------------------------------------

let en = {};
let enLines = new Map();
if (fs.existsSync(enPath)) {
  const raw = fs.readFileSync(enPath, "utf8");
  try {
    en = JSON.parse(raw);
  } catch (e) {
    report("error", `en.json is not valid JSON: ${e.message}`, { file: enPath });
    process.exit(opts.strict ? 1 : 0);
  }
  raw.split("\n").forEach((line, i) => {
    const m = line.match(/^\s*"((?:[^"\\]|\\.)*)"\s*:/);
    if (m && !enLines.has(m[1])) enLines.set(m[1], i + 1);
  });
} else {
  report("warning", "src/translations/en.json is missing", { file: enPath });
}
// Keys written as nested objects ({"project": {"picker": {"label": ...}}}). fe-core
// merges the translation contributions as a flat map and react-intl does not walk
// dotted paths, so a module that nests its en.json must flatten it itself
// (`flatten(messages_en)` from the "flat" package, as social protection does).
const nested = new Map();
(function flatten(obj, prefix) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") flatten(v, key);
    else if (prefix) nested.set(key, v);
  }
})(en, "");
const flattensMessages =
  nested.size > 0 &&
  listSources(srcDir).some((f) =>
    /\bfrom\s+["']flat["']|require\(\s*["']flat["']\s*\)/.test(fs.readFileSync(f, "utf8")),
  );
if (flattensMessages) {
  for (const [k, v] of Object.entries(en)) if (v && typeof v === "object") delete en[k];
  for (const [k, v] of nested) en[k] = v;
}
const nestedKeys = flattensMessages ? new Set() : new Set(nested.keys());
const enKeys = new Set(Object.keys(en));

// Keys the assembly itself provides (src/translations/ref.json of openimis-fe_js):
// fe-core falls back to the bare id, so formatMessage(intl, "claim", "ok") reads "ok".
const assemblyDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "translations");
const sharedKeys = new Set();
if (fs.existsSync(assemblyDir)) {
  for (const f of fs.readdirSync(assemblyDir).filter((n) => n.endsWith(".json"))) {
    try {
      Object.keys(JSON.parse(fs.readFileSync(path.join(assemblyDir, f), "utf8"))).forEach((k) => sharedKeys.add(k));
    } catch {
      // A broken assembly file is not this module's problem.
    }
  }
}
if (!sharedKeys.size) {
  report(
    "warning",
    "assembly translations (openimis-fe_js src/translations) not found; bare shared keys may be reported as missing",
  );
}

// --- source files ---------------------------------------------------------

function listSources(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "__tests__") continue;
      listSources(p, out);
    } else if (SOURCE_EXT.has(path.extname(entry.name)) && !/\.(test|spec)\.[mc]?jsx?$/.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

function parse(file) {
  const code = fs.readFileSync(file, "utf8");
  let firstError = null;
  for (const sourceType of ["module", "script"]) {
    try {
      return espree.parse(code, {
        ecmaVersion: "latest",
        sourceType,
        ecmaFeatures: { jsx: true },
        loc: true,
      });
    } catch (e) {
      firstError ??= e;
      if (sourceType === "script") {
        report("warning", `cannot parse (${firstError.message}); file not checked`, {
          file,
          line: firstError.lineNumber,
        });
      }
    }
  }
  return null;
}

function walk(node, visit, parent = null) {
  if (!node || typeof node.type !== "string") return;
  visit(node, parent);
  for (const key of Object.keys(node)) {
    if (key === "loc" || key === "range" || key === "parent") continue;
    const child = node[key];
    if (Array.isArray(child)) child.forEach((c) => c && typeof c.type === "string" && walk(c, visit, node));
    else if (child && typeof child.type === "string") walk(child, visit, node);
  }
}

const files = listSources(srcDir);
const asts = new Map();
for (const f of files) {
  const ast = parse(f);
  if (ast) asts.set(f, ast);
}

// String constants (const MODULE_NAME = "individual"), per file and project-wide
// when the name has a single value across the module: a module name is usually
// declared once in constants.js and imported everywhere.
const projectConsts = new Map();
const fileConsts = new Map();
for (const [file, ast] of asts) {
  const local = new Map();
  walk(ast, (node) => {
    if (
      node.type === "VariableDeclarator" &&
      node.id.type === "Identifier" &&
      node.init &&
      node.init.type === "Literal" &&
      typeof node.init.value === "string"
    ) {
      local.set(node.id.name, node.init.value);
      const prev = projectConsts.get(node.id.name);
      projectConsts.set(node.id.name, prev === undefined || prev === node.init.value ? node.init.value : null);
    }
  });
  fileConsts.set(file, local);
}

function staticString(node, file) {
  if (!node) return undefined;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) return node.quasis[0].value.cooked;
  if (node.type === "Identifier") {
    const local = fileConsts.get(file)?.get(node.name);
    if (local !== undefined) return local;
    const global = projectConsts.get(node.name);
    if (global) return global;
  }
  if (node.type === "JSXExpressionContainer") return staticString(node.expression, file);
  return undefined;
}

// Static prefix of a computed id (`claim.status.${x}` -> "claim.status."), used
// so that keys reached only through such ids are not reported as unused.
function staticPrefix(node) {
  if (node?.type === "JSXExpressionContainer") return staticPrefix(node.expression);
  if (node?.type === "TemplateLiteral" && node.quasis[0].value.cooked) return node.quasis[0].value.cooked;
  if (node?.type === "BinaryExpression" && node.operator === "+") {
    const left = node.left.type === "Literal" ? node.left.value : staticPrefix(node.left);
    return typeof left === "string" ? left : null;
  }
  return null;
}

const usages = []; // { module, id, file, loc } ; module === null means a full react-intl id
const dynamicUses = []; // { file, loc, why }
const dynamicPrefixes = new Set();
const literals = new Set(); // every string literal, for the unused-key note
const moduleLiterals = new Map(); // literal module argument -> uses

function addDynamic(file, node, why, idNode) {
  dynamicUses.push({ file, loc: node.loc.start, why });
  const prefix = staticPrefix(idNode);
  if (prefix) dynamicPrefixes.add(prefix);
}

for (const [file, ast] of asts) {
  walk(ast, (node) => {
    if (node.type === "Literal" && typeof node.value === "string") literals.add(node.value);
    if (node.type === "TemplateElement" && node.value.cooked) literals.add(node.value.cooked);

    if (node.type === "CallExpression") {
      const callee = node.callee;
      const name =
        callee.type === "Identifier"
          ? callee.name
          : callee.type === "MemberExpression" && !callee.computed
          ? callee.property.name
          : null;
      // fe-core helpers: formatMessage(intl, module, id[, values])
      if (FE_CORE_HELPERS.has(name) && node.arguments.length >= 3) {
        const [, modNode, idNode] = node.arguments;
        const mod = staticString(modNode, file);
        const id = staticString(idNode, file);
        if (id === undefined) addDynamic(file, node, "computed id", idNode);
        else if (mod === undefined) usages.push({ module: undefined, id, file, loc: node.loc.start });
        else usages.push({ module: mod, id, file, loc: node.loc.start });
        if (mod !== undefined) moduleLiterals.set(mod, (moduleLiterals.get(mod) || 0) + 1);
        return;
      }
      // react-intl: intl.formatMessage({ id: "..." }[, values])
      if (name === "formatMessage" && node.arguments[0]?.type === "ObjectExpression") {
        const idProp = node.arguments[0].properties.find(
          (p) => p.type === "Property" && !p.computed && (p.key.name === "id" || p.key.value === "id"),
        );
        if (!idProp) return;
        const id = staticString(idProp.value, file);
        if (id === undefined) addDynamic(file, node, "computed id", idProp.value);
        else usages.push({ module: null, id, file, loc: node.loc.start });
      }
      return;
    }

    if (node.type === "JSXOpeningElement") {
      const attrs = new Map();
      for (const a of node.attributes) {
        if (a.type === "JSXAttribute" && a.name.type === "JSXIdentifier") attrs.set(a.name.name, a.value);
      }
      const elName = node.name.type === "JSXIdentifier" ? node.name.name : null;
      const hasModule = attrs.has("module");
      const mod = hasModule ? staticString(attrs.get("module"), file) : null;
      if (hasModule && mod !== undefined) moduleLiterals.set(mod, (moduleLiterals.get(mod) || 0) + 1);

      const checkProp = (prop, viaModule) => {
        const valueNode = attrs.get(prop);
        if (!valueNode) return;
        const id = staticString(valueNode, file);
        if (id === undefined) {
          addDynamic(file, node, `computed ${prop}`, valueNode);
          return;
        }
        usages.push({ module: viaModule ? mod : null, id, file, loc: node.loc.start });
        // Constant pickers translate `${label}.${value}`: keep those keys out of the unused note.
        if (prop === "label") {
          dynamicPrefixes.add(`${id}.`);
          if (mod) dynamicPrefixes.add(`${mod}.${id}.`);
        }
      };

      if (elName === "FormattedMessage" && attrs.has("id")) {
        // fe-core's FormattedMessage takes `module`; react-intl's takes a full id.
        checkProp("id", hasModule);
      } else if (hasModule) {
        // Inputs, pickers and filters: label is translated through formatMessage(intl, module, label).
        for (const p of TRANSLATED_PROPS) checkProp(p, true);
      }
    }
  });
}

// --- this module's own key prefixes --------------------------------------

// The module's own names are the module arguments whose prefix en.json uses;
// failing that, the most common first segment of the en.json keys.
const enPrefixCount = new Map();
for (const k of enKeys) {
  const p = k.split(".")[0];
  enPrefixCount.set(p, (enPrefixCount.get(p) || 0) + 1);
}
const ownModules = new Set([...moduleLiterals.keys()].filter((m) => enPrefixCount.has(m)));
if (ownModules.size === 0 && enPrefixCount.size) {
  ownModules.add([...enPrefixCount.entries()].sort((a, b) => b[1] - a[1])[0][0]);
}
// Other modules named in this module's code, plus fe-core: a key under one of
// them is that module's business.
const foreignModules = new Set(["core", ...[...moduleLiterals.keys()].filter((m) => !ownModules.has(m))]);
for (const own of ownModules) foreignModules.delete(own);

function firstSegment(id) {
  const i = id.indexOf(".");
  return i > 0 ? id.slice(0, i) : null;
}

// --- check usages ---------------------------------------------------------

const usedKeys = new Set();
let checked = 0;
let foreign = 0;
let unresolvedModule = 0;
const missing = new Map(); // key -> [loc]

for (const u of usages) {
  if (u.id === "") continue;
  const candidates = u.module ? [`${u.module}.${u.id}`, u.id] : [u.id];
  const hit = candidates.find((k) => enKeys.has(k));
  if (hit) {
    usedKeys.add(hit);
    checked++;
    continue;
  }
  if (candidates.some((k) => sharedKeys.has(k))) {
    checked++;
    continue;
  }
  if (u.module === undefined) {
    // Module passed as a variable (a reusable component): resolve against our own names.
    const ownHit = [...ownModules].map((m) => `${m}.${u.id}`).find((k) => enKeys.has(k));
    if (ownHit) {
      usedKeys.add(ownHit);
      checked++;
    } else unresolvedModule++;
    continue;
  }
  const seg = firstSegment(u.id);
  if ((u.module && !ownModules.has(u.module)) || (seg && foreignModules.has(seg) && !ownModules.has(seg))) {
    foreign++;
    continue;
  }
  if (u.module === null && !(seg && ownModules.has(seg))) {
    // A full react-intl id outside our prefixes: may come from any module.
    foreign++;
    continue;
  }
  checked++;
  const key = candidates[0];
  if (!missing.has(key)) missing.set(key, []);
  missing.get(key).push({ file: u.file, line: u.loc.line, col: u.loc.column + 1 });
}

for (const [key, locs] of [...missing.entries()].sort()) {
  const more = locs.length > 1 ? ` (and ${locs.length - 1} more use${locs.length > 2 ? "s" : ""})` : "";
  const bare = key.slice(key.indexOf(".") + 1);
  const why =
    nestedKeys.has(key) || nestedKeys.has(bare)
      ? ": it exists only inside a nested object, which is never looked up"
      : "";
  report("error", `"${key}" is used but missing from src/translations/en.json${why}${more}`, locs[0]);
}

// --- en.json content ------------------------------------------------------

for (const [k, v] of Object.entries(en)) {
  if (typeof v !== "string") {
    const hint =
      v && typeof v === "object"
        ? ': nothing in src/ imports "flat" to flatten it, so its keys are never found; write them out as dotted strings'
        : "";
    report("warning", `"${k}" is not a string in en.json${hint}`, { file: enPath, line: enLines.get(k) });
  } else if (v.trim() === "") {
    report("warning", `"${k}" has an empty English text in en.json`, { file: enPath, line: enLines.get(k) });
  }
}

// Unused: own keys never resolved by a static use, not reachable through a
// computed id's static prefix, and whose text (full or without the module
// prefix) appears in no string literal (header arrays, constants, ...).
const unused = [];
for (const k of enKeys) {
  if (usedKeys.has(k) || literals.has(k)) continue;
  const seg = firstSegment(k);
  if (!seg || !ownModules.has(seg)) continue;
  const rest = k.slice(seg.length + 1);
  if (literals.has(rest)) continue;
  if ([...dynamicPrefixes].some((p) => k.startsWith(p) || rest.startsWith(p))) continue;
  unused.push(k);
}

// --- Lokalise -------------------------------------------------------------

async function lokaliseKeys(token) {
  const names = new Set();
  let cursor = "";
  for (let page = 0; page < 1000; page++) {
    const url = new URL(`https://api.lokalise.com/api2/projects/${LOKALISE_PROJECT}/keys`);
    url.searchParams.set("limit", "500");
    url.searchParams.set("pagination", "cursor");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url, { headers: { "x-api-token": token, accept: "application/json" } });
    if (!res.ok) throw new Error(`Lokalise answered HTTP ${res.status}`);
    const body = await res.json();
    for (const key of body.keys || []) {
      const n = key.key_name;
      if (typeof n === "string") names.add(n);
      else if (n) Object.values(n).forEach((v) => v && names.add(v));
    }
    cursor = res.headers.get("x-pagination-next-cursor") || "";
    if (!cursor) return names;
  }
  throw new Error("Lokalise pagination did not end");
}

const token = process.env.LOKALISE_APIKEY;
let lokaliseSummary = "Lokalise: not checked (LOKALISE_APIKEY not set)";
if (!token) {
  if (inActions)
    report("warning", "LOKALISE_APIKEY is not available (secret not set, or a fork PR); Lokalise check skipped");
} else if (enKeys.size) {
  try {
    const remote = await lokaliseKeys(token);
    const absent = [...enKeys].filter((k) => !remote.has(k)).sort();
    for (const k of absent) {
      report("warning", `"${k}" is in en.json but not in Lokalise: upload en.json`, {
        file: enPath,
        line: enLines.get(k),
      });
    }
    lokaliseSummary = `Lokalise: ${enKeys.size - absent.length}/${enKeys.size} en.json keys present`;
  } catch (e) {
    report("warning", `Lokalise check failed: ${e.message}`);
    lokaliseSummary = "Lokalise: check failed";
  }
}

// --- summary --------------------------------------------------------------

const dynamicCount = dynamicUses.length + unresolvedModule;
const summary = [
  `module names: ${[...ownModules].join(", ") || "(none found)"}`,
  `en.json keys: ${enKeys.size} (assembly shared keys: ${sharedKeys.size})`,
  `static uses checked: ${checked}, missing keys: ${missing.size}`,
  `not checkable: ${dynamicCount} (computed id or label: ${dynamicUses.length}, module passed as a variable: ${unresolvedModule})`,
  `other modules' keys skipped: ${foreign}`,
  `possibly unused en.json keys: ${unused.length}`,
  lokaliseSummary,
];
if (inActions) {
  report("notice", `i18n summary: ${summary.join("; ")}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    const md = ["### Translations (en.json)", "", ...summary.map((s) => `- ${s}`)];
    if (unused.length) {
      md.push(
        "",
        "<details><summary>Possibly unused keys</summary>",
        "",
        ...unused.sort().map((k) => `- \`${k}\``),
        "",
        "</details>",
      );
    }
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md.join("\n") + "\n");
  }
} else {
  console.log("\n" + summary.join("\n"));
}
if (opts.verbose) {
  for (const d of dynamicUses) {
    console.log(`dynamic ${path.relative(moduleDir, d.file)}:${d.loc.line}  ${d.why}`);
  }
  for (const k of unused.sort()) console.log(`unused  ${k}`);
}

process.exit(opts.strict && counts.error > 0 ? 1 : 0);
