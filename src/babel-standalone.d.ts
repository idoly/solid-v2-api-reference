declare module "babel-preset-solid" {
  const preset: unknown;
  export default preset;
}

declare module "@babel/standalone" {
  interface TransformOptions {
    filename?: string;
    presets?: unknown[];
    plugins?: unknown[];
    sourceType?: "module" | "script";
  }

  interface TransformResult {
    code?: string;
  }

  const Babel: {
    transform(source: string, options: TransformOptions): TransformResult;
  };

  export default Babel;
}
