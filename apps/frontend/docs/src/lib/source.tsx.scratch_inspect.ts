import { source } from "/Users/pranavpatel/Downloads/reloop/apps/frontend/docs/src/lib/source";

const findNodes = (nodes: any[]): any[] => {
  let results: any[] = [];
  for (const node of nodes) {
    if (node.name === "Go" || node.name === "Python" || node.name === "Java" || node.name === "Dotnet") {
      results.push({
        name: node.name,
        type: node.type,
        url: node.url,
        hasIcon: !!node.icon,
        hasMethod: !!node.method,
        keys: Object.keys(node)
      });
    }
    if (node.children) {
      results.push(...findNodes(node.children));
    }
  }
  return results;
};

console.log(JSON.stringify(findNodes(source.pageTree.children), null, 2));
