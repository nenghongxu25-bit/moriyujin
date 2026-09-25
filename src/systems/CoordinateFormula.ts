/** Compiles a small, data-only math expression for spatial controls. */
export type CoordinateFunction = (x: number, y: number) => number;

const functions: Record<string, (...values: number[]) => number> = {
    abs: Math.abs,
    ceil: Math.ceil,
    clamp: (value, low, high) => Math.max(low, Math.min(high, value)),
    cos: Math.cos,
    floor: Math.floor,
    max: Math.max,
    min: Math.min,
    pow: Math.pow,
    round: Math.round,
    sin: Math.sin,
    sqrt: Math.sqrt,
    tan: Math.tan
};

type Node = (x: number, y: number) => number;

/** Supports x/y, pi, arithmetic (+ - * / % ^), parentheses and common math functions. */
export function compileCoordinateFormula(source: string): CoordinateFunction {
    const text = source.trim() || "1";
    const tokens: string[] = [];
    const pattern = /\s*(?:(\d*\.\d+(?:[eE][+-]?\d+)?|\d+(?:[eE][+-]?\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|([()+\-*/%,^]))/y;
    let offset = 0;
    while (offset < text.length) {
        pattern.lastIndex = offset;
        const match = pattern.exec(text);
        if (!match) throw new Error(`Unexpected character at ${offset + 1}`);
        tokens.push(match[1] ?? match[2] ?? match[3]);
        offset = pattern.lastIndex;
    }
    let index = 0;
    const peek = (): string => tokens[index] ?? "";
    const take = (): string => tokens[index++] ?? "";
    const expect = (token: string): void => {
        if (take() !== token) throw new Error(`Expected '${token}'`);
    };

    const expression = (): Node => {
        let left = term();
        while (peek() === "+" || peek() === "-") {
            const op = take(), right = term(), previous = left;
            left = op === "+" ? (x, y) => previous(x, y) + right(x, y) :
                (x, y) => previous(x, y) - right(x, y);
        }
        return left;
    };
    const term = (): Node => {
        let left = power();
        while (peek() === "*" || peek() === "/" || peek() === "%") {
            const op = take(), right = power(), previous = left;
            left = op === "*" ? (x, y) => previous(x, y) * right(x, y) :
                op === "/" ? (x, y) => previous(x, y) / right(x, y) :
                    (x, y) => previous(x, y) % right(x, y);
        }
        return left;
    };
    const power = (): Node => {
        const left = unary();
        if (peek() !== "^") return left;
        take();
        const right = power(), previous = left;
        return (x, y) => Math.pow(previous(x, y), right(x, y));
    };
    const unary = (): Node => {
        if (peek() === "+") { take(); return unary(); }
        if (peek() === "-") { take(); const value = unary(); return (x, y) => -value(x, y); }
        return primary();
    };
    const primary = (): Node => {
        const token = take();
        if (token === "(") {
            const value = expression();
            expect(")");
            return value;
        }
        if (/^(?:\d|\.)/.test(token)) {
            const value = Number(token);
            if (!Number.isFinite(value)) throw new Error(`Invalid number '${token}'`);
            return () => value;
        }
        if (token === "x") return (x) => x;
        if (token === "y") return (_x, y) => y;
        if (token === "pi") return () => Math.PI;
        const fn = functions[token];
        if (!fn || peek() !== "(") throw new Error(`Unknown name '${token}'`);
        take();
        const args: Node[] = [];
        if (peek() !== ")") {
            do {
                args.push(expression());
                if (peek() !== ",") break;
                take();
            } while (true);
        }
        expect(")");
        const validArity = token === "min" || token === "max" ? args.length > 0 :
            token === "clamp" || token === "pow" ? args.length === 3 || (token === "pow" && args.length === 2) :
                args.length === 1;
        if (!validArity || (token === "pow" && args.length !== 2))
            throw new Error(`Invalid number of arguments for '${token}'`);
        return (x, y) => fn(...args.map((arg) => arg(x, y)));
    };

    const result = expression();
    if (index !== tokens.length) throw new Error(`Unexpected token '${peek()}'`);
    return (x, y) => {
        const value = result(x, y);
        return Number.isFinite(value) ? value : 0;
    };
}
