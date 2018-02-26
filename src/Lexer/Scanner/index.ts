import { Any as Token, TokenPosition } from '../Token';

export interface ScannerContext {
    current(): string;
    peek(next?: number): string;
    advance(step?: number): string;
    match(expected: string): boolean;
    accept(extra?: number): string;
    newline(): void;
}

export interface Scanner {
    (start: string, position: TokenPosition, context: ScannerContext): Token | false;
}
