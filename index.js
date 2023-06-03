const valueParser = require('postcss-value-parser');

function getFallbackNode(node) {
  const nodes = node.nodes
  if (nodes && nodes.length === 3) {
    // It's got a fallback, go deeper
    return getFallbackNode(nodes[2]);
  }

  return node;
}

module.exports = () => {
  return {
    postcssPlugin: 'postcss-var-fallback',
    Declaration(decl) {
      const parsed = valueParser(decl.value);
      if (!parsed.nodes || !parsed.nodes.length) {
        return node.value;
      }

      parsed.walk(node => {
        if (node.type === 'function' && node.value === 'var') {
          // If it's a var, recursively find the fallback
          const fallbackNode = getFallbackNode(node);

          // Replace node properties with the fallback
          if (fallbackNode.type) node.type = fallbackNode.type;
          if (fallbackNode.value) node.value = fallbackNode.value;
          if (fallbackNode.nodes) node.nodes = fallbackNode.nodes;

          // Do not investigate children
          return false;
        }
      });

      decl.value = parsed.stringify();
    },
  };
};

module.exports.postcss = true;
