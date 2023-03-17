import { Progress } from "vscode";

export type VsCodeProgress = Progress<{message?: string | undefined; increment?: number | undefined;}>