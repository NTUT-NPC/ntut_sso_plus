const fs = require("fs");
const path = require("path");

function checkFile(filePath) {
  // Remove query parameters or fragments
  const cleanPath = filePath.split(/[?#]/)[0];
  if (!fs.existsSync(cleanPath)) {
    console.error(`Error: File not found: ${cleanPath}`);
    process.exit(1);
  }
}

// 1. Check manifest.json
console.log("Checking manifest.json files...");
if (!fs.existsSync("manifest.json")) {
  console.error("Error: manifest.json not found");
  process.exit(1);
}

let manifest;
try {
  const manifestContent = fs.readFileSync("manifest.json", "utf8");
  manifest = JSON.parse(manifestContent);
} catch (err) {
  console.error("Error: Failed to parse manifest.json as valid JSON: " + err.message);
  process.exit(1);
}

const manifestFiles = [];

if (manifest.background && manifest.background.service_worker) {
  manifestFiles.push(manifest.background.service_worker);
}

if (manifest.content_scripts) {
  manifest.content_scripts.forEach(cs => {
    if (cs.js) manifestFiles.push(...cs.js);
    if (cs.css) manifestFiles.push(...cs.css);
  });
}

if (manifest.action && manifest.action.default_popup) {
  manifestFiles.push(manifest.action.default_popup);
}

if (manifest.icons) {
  manifestFiles.push(...Object.values(manifest.icons));
}

if (manifest.declarative_net_request && manifest.declarative_net_request.rule_resources) {
  manifest.declarative_net_request.rule_resources.forEach(rr => {
    if (rr.path) manifestFiles.push(rr.path);
  });
}

manifestFiles.forEach(f => {
  if (typeof f === "string") {
    checkFile(path.join(".", f));
  }
});

// 2. Check JS imports
console.log("Checking JS imports...");
const jsFiles = [];
function findJsFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== ".git") {
        findJsFiles(fullPath);
      }
    } else if (file.endsWith(".js")) {
      jsFiles.push(fullPath);
    }
  });
}
findJsFiles(".");

jsFiles.forEach(jsFile => {
  const content = fs.readFileSync(jsFile, "utf8");
  const importRegex = /import\s+.*?\s+from\s+["'](.*?)["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith(".")) {
      const fullPath = path.resolve(path.dirname(jsFile), importPath);
      checkFile(fullPath);
    }
  }
});

// 3. Check HTML script/link tags
console.log("Checking HTML references...");
const htmlFiles = new Set();

// Include any HTML files referenced in the manifest
manifestFiles.forEach(f => {
  if (typeof f === "string" && f.toLowerCase().endsWith(".html")) {
    htmlFiles.add(path.join(".", f));
  }
});

// Also include all .html files found in the project tree
function findHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "node_modules" && file !== ".git") {
        findHtmlFiles(fullPath);
      }
    } else if (file.toLowerCase().endsWith(".html")) {
      htmlFiles.add(fullPath);
    }
  });
}

findHtmlFiles(".");

Array.from(htmlFiles).forEach(htmlFile => {
  const content = fs.readFileSync(htmlFile, "utf8");
  const scriptRegex = /<script.*?src=["'](.*?)["']/g;
  const linkRegex = /<link.*?href=["'](.*?)["']/g;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    const src = match[1];
    if (!src.startsWith("http") && !src.startsWith("//")) {
      checkFile(path.resolve(path.dirname(htmlFile), src));
    }
  }
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1];
    if (!href.startsWith("http") && !href.startsWith("//")) {
      checkFile(path.resolve(path.dirname(htmlFile), href));
    }
  }
});

console.log("All checks passed!");
