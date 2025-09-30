export const virtualFileSystem = {
  root: { name: "/", type: "dir", children: {} },
  currentDirectory: "/",
};

export function initFileSystem(fs) {
  function cloneNode(node) {
    if (node.type === "dir") {
      const children = {};
      for (const key in node.children) {
        children[key] = cloneNode(node.children[key]);
      }
      return {
        name: node.name,
        type: "dir",
        children,
        meta: node.meta ? { ...node.meta } : undefined,
      };
    }

    return {
      name: node.name,
      type: "file",
      content: node.content || "",
      meta: node.meta ? { ...node.meta } : undefined,
    };
  }

  virtualFileSystem.root = cloneNode(fs);
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

export function resolvePath(current, target) {
  const parts = current.split("/").filter(Boolean);
  const segments = target.split("/");

  if (target.startsWith("/")) {
    parts.length = 0;
  }

  for (const segment of segments) {
    if (segment === "..") {
      parts.pop();
    } else if (segment && segment !== ".") {
      parts.push(segment);
    }
  }

  return "/" + parts.join("/");
}
