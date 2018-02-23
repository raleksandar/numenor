import { Any as Token } from '../Token';

export interface ScannerContext {
    current(): string;
    peek(next?: number): string;
    advance(step?: number): string;
    match(expected: string): boolean;
    accept(extra?: number): string;
    newline(): void;
}

export interface Scanner {
    (start: string, line: number, col: number, context: ScannerContext): Token | false;
}
