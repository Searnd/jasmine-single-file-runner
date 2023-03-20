import terser from "@rollup/plugin-terser";

export default {
  input: "out/extension.js",
  output: {
    dir: "out",
    format: "cjs",
    sourcemap: true
  },
  plugins: [terser()]
};