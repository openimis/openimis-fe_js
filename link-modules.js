const { execSync } = require("child_process");
const path = require("path");

const MODULES = [
  "core",
  "insuree",
  "policy",
  "product",
  "payment",
  "claim",
  "contribution",
  "individual",
  "social_protection",
  "home",
  "opensearch_reports",
  "location",
  "medical",
  "medical_pricelist",
  "payer",
  "admin",
  "tools",
  "profile",
  "calculation",
  "policyholder",
  "tasks_management",
  "invoice",
  "grievance_social_protection",
  "language_fr",
  "claim_sampling",
  "deduplication",
  "payroll",
  'payment_cycle',
  'contribution_plan',
  'claim_batch',
  'contract',
  'benefit_plan',
  'beneficiary'
];

const baseDir = path.resolve(__dirname, ".."); // '/home/user/openIMIS-24-10/frontend'
const feAppDir = path.join(baseDir, "openimis-fe_js");

const run = (cmd, cwd) => {
  console.log(`\n➡️ Running "${cmd}" in ${cwd}`);
  execSync(cmd, { stdio: "inherit", cwd });
};

try {
  for (const mod of MODULES) {
    const modDir = path.join(baseDir, `openimis-fe-${mod}_js`);

    console.log(`\n=== Processing module: ${mod} ===`);
    run("yarn install", modDir);
    run("yarn build", modDir);
    run("yarn link", modDir);
  }

  console.log("\n=== Linking modules in main frontend app ===");
  for (const mod of MODULES) {
    const packageName = `@openimis/fe-${mod}`;
    run(`yarn link "${packageName}"`, feAppDir);
  }

  console.log("\n✅ All modules processed and linked!");
} catch (err) {
  console.error("❌ Error occurred:", err.message);
  process.exit(1);
}
