import * as vscode from "vscode";

export class VscodeTaskManager {
    private _type: string;

    constructor(type: string) {
        this._type = type;
    }

    public registerTaskProvider(name: string, commandLine: string, cwd: string): vscode.Disposable {
        return vscode.tasks.registerTaskProvider(this._type, {
            provideTasks: () => {
                const execution = new vscode.ShellExecution(commandLine, {cwd});
                const task = new vscode.Task({type: this._type}, vscode.TaskScope.Workspace, name, "jsfr", execution);

                return [task];
            },
            resolveTask: (task) => {
                return task;
            }
        });
    }

    public async getTask(name: string): Promise<vscode.Task|undefined> {
        const tasks = await vscode.tasks.fetchTasks({type: this._type});

        return tasks.find((task) => {
            return task.name === name;
        });
    }

    public killTask(name: string): void {
        const taskExecution =  vscode.tasks.taskExecutions.find(taskExecution =>
            taskExecution.task.name === name);

        if (taskExecution) {
            taskExecution.terminate();
        }
    }
}