export function lsParse(line: string): [string, any] | undefined {
  if (line.length < 1) return undefined;
  if (line.startsWith("total")) return undefined;
  if (line.includes("Permission denied")) return [line, 0];
  if (line.includes("is not debuggable")) return [line, 0];
  if (line.includes("is not an application")) return [line, 0];

  if (line.startsWith("d")) {
    return [line.split(/\s+/).pop() || "UnknownDirectory", 2];
  }
  if (line.startsWith("-")) {
    return [line.split(/\s+/).pop() || "UnknownFile", 1];
  }
  if (line.startsWith("l")) {
    return [line.split(" -> ").shift()?.split(/\s+/).pop() || "UnknownSymbolicLink", 64];
  }
  return [line, 0];
}
