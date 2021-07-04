export class FileNotFoundError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class LineNotFoundInFileError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class ArgumentInvalidError extends Error {
    constructor(message = "Error: invalid argument") {
        super(message);
    }
}
