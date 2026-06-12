import { source } from "/Users/pranavpatel/Downloads/reloop/apps/frontend/docs/src/lib/source";

const rootChildren = source.pageTree.children;
for (const child of rootChildren) {
  console.log({
    name: child.name,
    type: child.type,
    url: child.url,
    childrenCount: child.children ? child.children.length : 0
  });
}
