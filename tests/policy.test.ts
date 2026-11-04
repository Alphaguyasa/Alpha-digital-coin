// Checks the project rules in CLAUDE.md that a machine can check. A failure here means a
// rule was broken, so fix the change rather than the test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const trackedFiles = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const isText = (path: string) => !/\.(ico|png|jpg|wasm|gz|lock)$/.test(path);
const read = (path: string) => readFileSync(path, "utf8");

test("the README keeps the experimental, not financial advice disclaimer", () => {
  const readme = read("README.md").toLowerCase();
  assert.match(readme, /experimental software, not financial advice/);
});

test("every page shows the experimental notice", () => {
  assert.match(read("components/experimental-notice.tsx"), /Experimental software, not financial advice/);
  const dashboard = read("app/dashboard/page.tsx");
  assert.equal(dashboard.match(/<ExperimentalNotice \/>/g)?.length, 2, "both dashboard states need it");
  assert.match(read("app/page.tsx"), /<ExperimentalNotice \/>/);
});

test("the site makes no price, investment or false claims", () => {
  const site = trackedFiles.filter((path) => /^(app|components|lib)\/.*\.tsx?$/.test(path));
  assert.ok(site.length > 0);
  const banned = [
    // Price, returns, or a dollar value on a token balance.
    /\binvest/i, /\bprofit/i, /\bportfolio/i, /\bleverage\b/i, /\byield\b/i, /currentPrice/, /style:\s*"currency"/,
    // Inviting the public in.
    /public sale/i, /get alpha/i, /\bbuy\b/i, /alpha economy/i, /future of finance/i, /long-term growth/i,
    // Features that do not exist.
    /plug wallet/i, /non-custodial/i, /your keys, your coins/i, /governed by/i, /cold storage/i, /\bvesting\b/i,
    /sub-second/i, /zero gas/i, /full transaction history/i, /borderless/i,
  ];
  for (const path of site) {
    // Saying that it is not an investment is the one allowed use of the word.
    const text = read(path).replace(/not an investment/gi, "");
    for (const pattern of banned) {
      assert.doesNotMatch(text, pattern, `${path} makes a claim the project rules forbid`);
    }
    // ICRC-1 may only be named to say that the token is not it.
    for (const line of read(path).split("\n").filter((text) => /icrc-1/i.test(text))) {
      assert.match(line, /\bnot\b/i, `${path} implies ICRC-1 support: ${line.trim()}`);
    }
  }
});

test("no private keys, seed phrases or API tokens are tracked", () => {
  // Built from parts so that this file does not match its own patterns.
  const patterns = [
    new RegExp("-----BEGIN [A-Z ]*PRIVATE " + "KEY-----"),
    new RegExp("\\bgh[pousr]_[A-Za-z0-9]{" + "36,}"),
    new RegExp("\\bsk-[A-Za-z0-9_-]{" + "32,}"),
    new RegExp("(seed|mnemonic)[_ -]?(phrase)?\\s*[:=]\\s*[\"'][a-z]+( [a-z]+){" + "11,}"),
  ];
  for (const path of trackedFiles.filter(isText)) {
    for (const pattern of patterns) {
      assert.doesNotMatch(read(path), pattern, `${path} looks like it holds a secret`);
    }
  }
});

test("no key, keystore or env files and no dfx state are tracked", () => {
  const forbidden = /(^|\/)(\.env(?!\.example$).*|identity\.json)$|\.(pem|key|keystore)$|^\.dfx\//;
  assert.deepEqual(trackedFiles.filter((path) => forbidden.test(path)), []);
});

test("nothing automated can reach mainnet", () => {
  const automation = trackedFiles.filter(
    (path) => path === "package.json" || path.startsWith("scripts/") || path.startsWith(".github/"),
  );
  assert.ok(automation.length > 0);
  const mainnet = /--network[ =]+(ic|playground)\b|--ic\b|--playground\b|ic0\.app|icp0\.io/;
  for (const path of automation) {
    assert.doesNotMatch(read(path), mainnet, `${path} targets a public network`);
  }
});

test("CI has a read-only token and no secrets, and never runs on pull_request_target", () => {
  const ci = read(".github/workflows/ci.yml");
  assert.match(ci, /permissions:\n {2}contents: read/);
  assert.doesNotMatch(ci, /secrets\.\w|pull_request_target/);
});

test("the policies stay in CLAUDE.md", () => {
  const memory = read("CLAUDE.md");
  for (const heading of [
    "PROJECT SUMMARY",
    "THE DAILY LOOP",
    "PER-RUN LIMIT",
    "MONEY AND RISK RULES",
    "ENGINEERING RULES",
    "MERGE POLICY",
    "DEPLOY AND DATABASE POLICY",
    "MODEL POLICY",
    "NO PURCHASES POLICY",
    "SAFETY RULES",
    "REPORT",
  ]) {
    assert.ok(memory.includes(heading), `CLAUDE.md lost the ${heading} section`);
  }
});

test("nothing in the canister awaits, so no other message can run during a balance update", () => {
  for (const path of ["src/token/main.mo", "src/token/Ledger.mo"]) {
    const code = read(path).replace(/\/\/.*$/gm, "");
    assert.doesNotMatch(code, /await/, `${path} must not await: see Ledger.mo`);
  }
});

test("the canister uses no floating point and offers only the known public functions", () => {
  const source = read("src/token/main.mo");
  assert.doesNotMatch(read("src/token/Ledger.mo"), /Float/);
  assert.doesNotMatch(source, /\bFloat\b/);
  // A new public function is a new power. A mint or an admin function needs a written
  // justification in NEEDS_APPROVAL.md first, and then a change to this list.
  const functions = [...source.matchAll(/public\s+(?:query\s+|shared\s*(?:\([^)]*\)\s*)?)?func\s+(\w+)/g)]
    .map((match) => match[1])
    .sort();
  assert.deepEqual(functions, ["balanceOf", "claim", "getSymbol", "transfer"]);
});
