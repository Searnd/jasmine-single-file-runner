import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/extension.ts",
  output: {
    dir: "out",
    format: "cjs"
  },
  plugins: [typescript(), terser()]
}