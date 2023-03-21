import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "out/extension.js",
  output: {
    dir: "out",
    format: "cjs"
  },
  plugins: [commonjs(), nodeResolve(), terser()]
};