import { Lexer, TokenType } from './Lexer';
import { Whitespace, LineTerminator } from './Lexer/Scanner/Whitespace';
import { Identifier } from './Lexer/Scanner/Identifier';
import { StringLiteral } from './Lexer/Scanner/StringLiteral';
import { NumberLiteral } from './Lexer/Scanner/NumberLiteral';
import { makePunctuationScanner, makeOperatorScanner } from './Lexer/Scanner/Punctuation';

export class ExpressionLexer extends Lexer {

    constructor() {
        super();

        this.appendScanner(Whitespace);
        this.appendScanner(LineTerminator);

        this.appendScanner(Identifier); // also handles keywords

        this.appendScanner(StringLiteral);
        this.appendScanner(NumberLiteral);

        this.appendScanner(makePunctuationScanner('.', TokenType.Dot));
        this.appendScanner(makePunctuationScanner('(', TokenType.LParen));
        this.appendScanner(makePunctuationScanner(')', TokenType.RParen));
        this.appendScanner(makePunctuationScanner('[', TokenType.LBracket));
        this.appendScanner(makePunctuationScanner(']', TokenType.RBracket));
        this.appendScanner(makePunctuationScanner('{', TokenType.LBrace));
        this.appendScanner(makePunctuationScanner('}', TokenType.RBrace));
        this.appendScanner(makePunctuationScanner(',', TokenType.Comma));
        this.appendScanner(makePunctuationScanner(':', TokenType.Colon));

        this.appendScanner(makeOperatorScanner('++', TokenType.PlusPlus, TokenType.Plus));
        this.appendScanner(makeOperatorScanner('+=', TokenType.PlusEq, TokenType.Plus));
        this.appendScanner(makePunctuationScanner('+', TokenType.Plus));

        this.appendScanner(makeOperatorScanner('--', TokenType.MinusMinus, TokenType.Minus));
        this.appendScanner(makeOperatorScanner('-=', TokenType.MinusEq, TokenType.Minus));
        this.appendScanner(makePunctuationScanner('-', TokenType.Minus));

        this.appendScanner(makePunctuationScanner('=>', TokenType.RightArrow));

        this.appendScanner(makePunctuationScanner('===', TokenType.EqEqEq));
        this.appendScanner(makePunctuationScanner('==', TokenType.EqEq));
        this.appendScanner(makeOperatorScanner('=', TokenType.Eq, TokenType.Eq));

        this.appendScanner(makePunctuationScanner('!==', TokenType.BangEqEq));
        this.appendScanner(makePunctuationScanner('!=', TokenType.BangEq));
        this.appendScanner(makePunctuationScanner('!', TokenType.Bang));

        this.appendScanner(makePunctuationScanner('&&', TokenType.AmpAmp));
        this.appendScanner(makeOperatorScanner('&=', TokenType.AmpEq, TokenType.Amp));
        this.appendScanner(makePunctuationScanner('&', TokenType.Amp));

        this.appendScanner(makePunctuationScanner('||', TokenType.PipePipe));
        this.appendScanner(makeOperatorScanner('|=', TokenType.PipeEq, TokenType.Pipe));
        this.appendScanner(makePunctuationScanner('|', TokenType.Pipe));

        this.appendScanner(makeOperatorScanner('^=', TokenType.CaretEq, TokenType.Caret));
        this.appendScanner(makePunctuationScanner('^', TokenType.Caret));

        this.appendScanner(makeOperatorScanner('~=', TokenType.TildeEq, TokenType.Tilde));
        this.appendScanner(makePunctuationScanner('~', TokenType.Tilde));

        this.appendScanner(makeOperatorScanner('**=', TokenType.StarStarEq, TokenType.StarStar));
        this.appendScanner(makePunctuationScanner('**', TokenType.StarStar));
        this.appendScanner(makeOperatorScanner('*=', TokenType.StarEq, TokenType.Star));
        this.appendScanner(makePunctuationScanner('*', TokenType.Star));

        this.appendScanner(makeOperatorScanner('/=', TokenType.SlashEq, TokenType.Slash));
        this.appendScanner(makePunctuationScanner('/', TokenType.Slash));

        this.appendScanner(makeOperatorScanner('%=', TokenType.PercentEq, TokenType.Percent));
        this.appendScanner(makePunctuationScanner('%', TokenType.Percent));

        this.appendScanner(makeOperatorScanner('<<=', TokenType.LtLtEq, TokenType.LtLt));
        this.appendScanner(makePunctuationScanner('<<', TokenType.LtLt));
        this.appendScanner(makeOperatorScanner('<=', TokenType.LtEq, TokenType.Lt));
        this.appendScanner(makePunctuationScanner('<', TokenType.Lt));

        this.appendScanner(makeOperatorScanner('>>>=', TokenType.GtGtGtEq, TokenType.GtGtGt));
        this.appendScanner(makePunctuationScanner('>>>', TokenType.GtGtGt));
        this.appendScanner(makeOperatorScanner('>>=', TokenType.GtGtEq, TokenType.GtGt));
        this.appendScanner(makePunctuationScanner('>>', TokenType.GtGt));
        this.appendScanner(makeOperatorScanner('>=', TokenType.GtEq, TokenType.Gt));
        this.appendScanner(makePunctuationScanner('>', TokenType.Gt));

        this.appendScanner(makeOperatorScanner('??=', TokenType.QuestionQuestionEq, TokenType.QuestionQuestion));
        this.appendScanner(makePunctuationScanner('??', TokenType.QuestionQuestion));
        this.appendScanner(makePunctuationScanner('?.', TokenType.QuestionDot));
        this.appendScanner(makePunctuationScanner('?', TokenType.Question));
    }
}
