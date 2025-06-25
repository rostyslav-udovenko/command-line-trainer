/**
 * Virtual file system representation in memory.
 * Provides utilities to manage and traverse directories and paths.
 *
 * @typedef {Object} FileNode
 * @property {string} name - Name of the file or directory.
 * @property {'file'|'dir'} type - Type of the node (file or directory).
 * @property {Object<string, FileNode>} [children] - Child nodes (if directory).
 */

/**
 * Represents the root of the virtual file system and the current working directory.
 */
export const virtualFileSystem = {
  /** @type {FileNode} */
  root: { name: "/", type: "dir", children: {} },

  /** @type {string} */
  currentDirectory: "/",
};

/**
 * Initializes the virtual file system with a deep clone of a given file system structure.
 *
 * @param {FileNode} fs - Root node of the file system to clone.
 */
export function setupFileSystem(fs) {
  /**
   * Recursively clones a file or directory node.
   *
   * @param {FileNode} node - Node to clone.
   * @returns {FileNode} - Deep copy of the node.
   */
  function clone(node) {
    if (node.type === "dir") {
      const children = {};
      for (const key in node.children) {
        children[key] = clone(node.children[key]);
      }
      return { name: node.name, type: "dir", children };
    }
    return { name: node.name, type: "file", content: node.content || "" };
  }

  virtualFileSystem.root = clone(fs);
}

/**
 * Retrieves a directory node by its absolute path.
 *
 * @param {string} path - Absolute path (e.g. "/home/user").
 * @returns {FileNode|null} - The directory node if it exists, or null otherwise.
 */
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

/**
 * Normalizes a target path relative to the current path.
 *
 * @param {string} current - Current working directory (e.g. "/home/user").
 * @param {string} target - Target path (relative or absolute).
 * @returns {string} - Normalized absolute path (e.g. "/home/docs").
 */
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
