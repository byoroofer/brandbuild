import { promises as fs } from "node:fs";
import path from "node:path";

const appRoot = process.cwd();
const repoRoot = path.resolve(appRoot, "../..");

const protectedTargets = [
  "app",
  "components",
  "lib",
  "types",
  "middleware.ts",
  "next.config.ts",
  "package.json",
  ".env.example",
  "vercel.json",
].map((target) => path.join(appRoot, target)).concat([
  path.join(repoRoot, "README.md"),
  path.join(repoRoot, ".env.example"),
  path.join(repoRoot, "package.json"),
  path.join(repoRoot, "pnpm-workspace.yaml"),
  path.join(repoRoot, "turbo.json"),
  path.join(repoRoot, "docs"),
  path.join(repoRoot, "packages"),
  path.join(repoRoot, "supabase"),
]);

const ignoredDirectoryNames = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  "node_modules",
]);

const allowedFileExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".sql",
  ".svg",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);

// BrandBuild / AI Video should not ship BYOR-owned branding or links.
const blockedPatterns = [
  {
    label: "BYOR domain",
    regex: /\bhttps?:\/\/(?:www\.)?byoroofer\.com\b/i,
  },
  {
    label: "BYOR domain",
    regex: /\b(?:www\.)?byoroofer\.com\b/i,
  },
  {
    label: "BYOR GitHub org",
    regex: /\bgithub\.com\/byoroofer\/[^\s"'`<>)]*/i,
  },
  {
    label: "BYOR brand name",
    regex: /\bBYORoofer\b/i,
  },
];

function shouldInspectFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (!extension) {
    const baseName = path.basename(filePath);
    return baseName === "README" || baseName === "LICENSE";
  }

  return allowedFileExtensions.has(extension);
}

async function collectFiles(targetPath, bucket) {
  const stats = await fs.stat(targetPath);

  if (stats.isFile()) {
    if (shouldInspectFile(targetPath)) {
      bucket.push(targetPath);
    }
    return;
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoredDirectoryNames.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(targetPath, entry.name);

    if (entry.isDirectory()) {
      await collectFiles(entryPath, bucket);
      continue;
    }

    if (entry.isFile() && shouldInspectFile(entryPath)) {
      bucket.push(entryPath);
    }
  }
}

function getLineNumber(content, index) {
  return content.slice(0, index).split("\n").length;
}

async function inspectFile(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  const findings = [];

  for (const pattern of blockedPatterns) {
    const match = content.match(pattern.regex);

    if (!match || typeof match.index !== "number") {
      continue;
    }

    findings.push({
      filePath,
      label: pattern.label,
      line: getLineNumber(content, match.index),
      match: match[0],
    });
  }

  return findings;
}

async function main() {
  const files = [];

  for (const targetPath of protectedTargets) {
    try {
      await collectFiles(targetPath, files);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        continue;
      }

      throw error;
    }
  }

  const findings = [];

  for (const filePath of [...new Set(files)].sort()) {
    findings.push(...(await inspectFile(filePath)));
  }

  if (findings.length === 0) {
    console.log(
      "No blocked external-product references were found in protected BrandBuild/AI Video surfaces."
    );
    return;
  }

  console.error(
    "Blocked external-product references were found in protected BrandBuild/AI Video surfaces:"
  );

  for (const finding of findings) {
    const relativePath = path.relative(repoRoot, finding.filePath) || finding.filePath;
    console.error(`- ${relativePath}:${finding.line} [${finding.label}] ${finding.match}`);
  }

  process.exitCode = 1;
}

main().catch((error) => {
  console.error("Failed to inspect protected BrandBuild/AI Video surfaces.");
  console.error(error);
  process.exitCode = 1;
});
