interface Formatter {
    name: FormatterName;
    runner: string;
    testers: {
        configFile: RegExp;
        packageKey?: string;
        script: RegExp;
    };
}
type FormatterName = "biome" | "deno" | "dprint" | "prettier";
declare const formatters: [{
    readonly name: "biome";
    readonly runner: "npx @biomejs/biome format --write";
    readonly testers: {
        readonly configFile: RegExp;
        readonly script: RegExp;
    };
}, {
    readonly name: "deno";
    readonly runner: "deno fmt";
    readonly testers: {
        readonly configFile: RegExp;
        readonly script: RegExp;
    };
}, {
    readonly name: "dprint";
    readonly runner: "npx dprint fmt";
    readonly testers: {
        readonly configFile: RegExp;
        readonly script: RegExp;
    };
}, {
    readonly name: "prettier";
    readonly runner: "npx prettier --write";
    readonly testers: {
        readonly configFile: RegExp;
        readonly packageKey: "prettier";
        readonly script: RegExp;
    };
}];

export { type Formatter, type FormatterName, formatters };
