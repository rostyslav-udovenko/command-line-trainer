export const virtualFileSystem = {
  root: { name: "/", type: "dir", children: {} },
  currentDirectory: "/",
};

export function setupFileSystem(fs) {
  function clone(node) {
    if (node.type === "dir") {
      const children = {};
      for (const key in node.children) {
        children[key] = clone(node.children[key]);
      }
      return { name: node.name, type: "dir", children };
    }
    return { name: node.name, type: "file" };
  }

  virtualFileSystem.root = clone(fs);
}

export function getDirectory(path) {
  const parts = path.split("/").filter(Boolean);
  let current = virtualFileSystem.root;
  for (const part of parts) {
    if (current.children[part]?.type === "dir") {
      current = current.children[part];
    } else {
      return null;
    }
  }
  return current;
}

export function normalizePath(current, target) {
  const stack = current.split("/").filter(Boolean);
  const parts = target.split("/");
  if (target.startsWith("/")) stack.length = 0;

  for (const part of parts) {
    if (part === "..") stack.pop();
    else if (part && part !== ".") stack.push(part);
  }
  return "/" + stack.join("/");
}
