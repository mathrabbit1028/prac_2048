const formatters = [
  {
    name: "biome",
    runner: "npx @biomejs/biome format --write",
    testers: {
      configFile: /biome\.json/,
      script: /biome\s+format/
    }
  },
  {
    name: "deno",
    runner: "deno fmt",
    testers: {
      configFile: /deno\.json/,
      script: /deno/
    }
  },
  {
    name: "dprint",
    runner: "npx dprint fmt",
    testers: {
      configFile: /dprint\.json/,
      script: /dprint/
    }
  },
  {
    name: "prettier",
    runner: "npx prettier --write",
    testers: {
      configFile: /prettier(?:rc|\.)/,
      packageKey: "prettier",
      script: /prettier/
    }
  }
];
export {
  formatters
};
