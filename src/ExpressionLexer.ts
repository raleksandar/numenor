import { Lexer, TokenType } from './Lexer';
import { Whitespace, LineTerminator } from './Lexer/Scanner/Whitespace';
import { Identifier } from './Lexer/Scanner/Identifier';
import { StringLiteral } from './Lexer/Scanner/StringLiteral';
import { NumberLiteral } from './Lexer/Scanner/NumberLiteral';
import { makePunctuationScanner, makeOperatorScanner } from './Lexer/Scanner/Punctuation';

export class ExpressionLexer extends Lexer {

    constructor() {
        super();

        this.addScanner(Whitespace);
        this.addScanner(LineTerminator);

        this.addScanner(Identifier); // also handles keywords

        this.addScanner(StringLiteral);
        this.addScanner(NumberLiteral);

        this.addScanner(makePunctuationScanner('.', TokenType.Dot));
        this.addScanner(makePunctuationScanner('(', TokenType.LParen));
        this.addScanner(makePunctuationScanner(')', TokenType.RParen));
        this.addScanner(makePunctuationScanner('[', TokenType.LBracket));
        this.addScanner(makePunctuationScanner(']', TokenType.RBracket));
        this.addScanner(makePunctuationScanner('{', TokenType.LBrace));
        this.addScanner(makePunctuationScanner('}', TokenType.RBrace));
        this.addScanner(makePunctuationScanner(',', TokenType.Comma));
        this.addScanner(makePunctuationScanner(':', TokenType.Colon));

        this.addScanner(makeOperatorScanner('++', TokenType.PlusPlus, TokenType.Plus));
        this.addScanner(makeOperatorScanner('+=', TokenType.PlusEq, TokenType.Plus));
        this.addScanner(makePunctuationScanner('+', TokenType.Plus));

        this.addScanner(makeOperatorScanner('--', TokenType.MinusMinus, TokenType.Minus));
        this.addScanner(makeOperatorScanner('-=', TokenType.MinusEq, TokenType.Minus));
        this.addScanner(makePunctuationScanner('-', TokenType.Minus));

        this.addScanner(makePunctuationScanner('===', TokenType.EqEqEq));
        this.addScanner(makePunctuationScanner('==', TokenType.EqEq));
        this.addScanner(makeOperatorScanner('=', TokenType.Eq, TokenType.Eq));

        this.addScanner(makePunctuationScanner('!==', TokenType.BangEqEq));
        this.addScanner(makePunctuationScanner('!=', TokenType.BangEq));
        this.addScanner(makePunctuationScanner('!', TokenType.Bang));

        this.addScanner(makePunctuationScanner('&&', TokenType.AmpAmp));
        this.addScanner(makeOperatorScanner('&=', TokenType.AmpEq, TokenType.Amp));
        this.addScanner(makePunctuationScanner('&', TokenType.Amp));

        this.addScanner(makePunctuationScanner('||', TokenType.PipePipe));
        this.addScanner(makeOperatorScanner('|=', TokenType.PipeEq, TokenType.Pipe));
        this.addScanner(makePunctuationScanner('|', TokenType.Pipe));

        this.addScanner(makeOperatorScanner('^=', TokenType.CaretEq, TokenType.Caret));
        this.addScanner(makePunctuationScanner('^', TokenType.Caret));

        this.addScanner(makeOperatorScanner('~=', TokenType.TildeEq, TokenType.Tilde));
        this.addScanner(makePunctuationScanner('~', TokenType.Tilde));

        this.addScanner(makeOperatorScanner('**=', TokenType.StarStarEq, TokenType.StarStar));
        this.addScanner(makePunctuationScanner('**', TokenType.StarStar));
        this.addScanner(makeOperatorScanner('*=', TokenType.StarEq, TokenType.Star));
        this.addScanner(makePunctuationScanner('*', TokenType.Star));

        this.addScanner(makeOperatorScanner('/=', TokenType.SlashEq, TokenType.Slash));
        this.addScanner(makePunctuationScanner('/', TokenType.Slash));

        this.addScanner(makeOperatorScanner('%=', TokenType.PercentEq, TokenType.Percent));
        this.addScanner(makePunctuationScanner('%', TokenType.Percent));

        this.addScanner(makeOperatorScanner('<<=', TokenType.LtLtEq, TokenType.LtLt));
        this.addScanner(makePunctuationScanner('<<', TokenType.LtLt));
        this.addScanner(makeOperatorScanner('<=', TokenType.LtEq, TokenType.Lt));
        this.addScanner(makePunctuationScanner('<', TokenType.Lt));

        this.addScanner(makeOperatorScanner('>>>=', TokenType.GtGtGtEq, TokenType.GtGtGt));
        this.addScanner(makePunctuationScanner('>>>', TokenType.GtGt));
        this.addScanner(makeOperatorScanner('>>=', TokenType.GtGtGtEq, TokenType.GtGtGt));
        this.addScanner(makePunctuationScanner('>>', TokenType.GtGt));
        this.addScanner(makeOperatorScanner('>=', TokenType.GtEq, TokenType.Gt));
        this.addScanner(makePunctuationScanner('>', TokenType.Gt));

        this.addScanner(makeOperatorScanner('??=', TokenType.QuestionQuestionEq, TokenType.QuestionQuestion));
        this.addScanner(makePunctuationScanner('??', TokenType.QuestionQuestion));
        this.addScanner(makePunctuationScanner('?.', TokenType.QuestionDot));
        this.addScanner(makePunctuationScanner('?', TokenType.Question));
    }
}
