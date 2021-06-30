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

export class InvalidArgumentError extends Error {
    constructor(message: string) {
        super(message);
    }
}
