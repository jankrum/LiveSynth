// const toStr = 
// function toStr(x) {
//     // if (typeof (x)) {
//     //     return '"' + x + '"';
//     // } else {
//     //     return x;
//     // }
//     return 
// }

const ENV = new Map();

ENV.set('+', (...args) => args.reduce((x, y) => x + y));

Array.prototype.toString = function () {
    const toStr = x => typeof x === 'string' ? `"${x}"` : x;
    return `(${this.map(toStr).join(' ')})`;
};

function flex(s) {
    // Used to accumulate words, but also accumulates null strings
    function processChar(accumulator, char) {
        if ('()'.includes(char)) {
            // Add this char as a single-letter word at the end of accumulator, as well as the empty start of a new word
            return accumulator.concat([char, '']);
        } else if ('() \n\t'.includes(char)) {
            // Terminate adding to the current word by making the empty start of a new word
            return accumulator.concat(['']);
        } else {
            // Add the new char to the last word in the accumulator
            const lastWord = accumulator.slice(-1)[0];
            const lastWordWithNewChar = lastWord + char;
            return accumulator.slice(0, -1).concat([lastWordWithNewChar]);
        }
    }

    // Used to filter null strings from token list
    function notNull(text) {
        return text !== '';
    }

    const charArray = s.split('');
    const wordsAndBlanks = charArray.reduce(processChar, ['']);  // You have to start with one empty word
    const tokens = wordsAndBlanks.filter(notNull);

    return tokens;

    // return s.split('').reduce((acc, char) => '()'.includes(char) ? acc.concat([char, '']) : '() \n\t'.includes(char) ? acc.concat(['']) : acc.slice(0, -1).concat([acc.slice(-1)[0] + char]), ['']).filter(x => x !== '');
}

// Breaks a string into tokens
function lex(s) {
    return s.match(/[()]|[^() \n\t]+/g);
}

// Turns tokens into a tree-like structure
function parse(toks) {
    let tok = toks.shift();
    if (tok === '(') {
        let ret = [];
        while (toks.length) {
            if (toks[0] === ')') {
                toks.shift();
                return ret;
            } else {
                ret.push(parse(toks));
            }
        }
    } else if (tok === 'true') {
        return true;
    } else if (tok === 'false') {
        return false;
    } else if (!isNaN(tok)) {
        // not is-not-a-number === is a number
        return Number(tok);
    } else {
        return tok
    }
}

function findVar(x, e) {
    if (e.has(x)) {
        return e.get(x);
    } else if (e.has(';parent')) {
        //
    } else {
        throw (`findVar can't find var ${x}`)
    }
}

function truthy(x) {
    const isZeroLengthArray = Array.isArray(x) && x.length === 0;
    const isStrictlyFalse = x === false;

    return !(isZeroLengthArray || isStrictlyFalse);
}

function Fun(parms, body, e) {
    this.parms = parms;
    this.body = body;
    this.e = e;
}

function newEnv(eParent, parms, args) {
    let e = new Map();
    e.set(';parent', eParent);
    for (let i = 0; i < parms.length; i += 1) {
        e.set(parms[i], args[i]);
    }
    return e;
}

function eval(x, e = ENV) {
    if (Array.isArray(x)) {
        switch (x[0]) {
            case 'do':
                let ret;
                for (let i = 1; i < x.length; i += 1) {
                    ret = eval(x[i]);
                }
                return ret;
            case 'def':
                const key = x[1];
                const value = eval(x[2]);
                e.set(key, value);
                return [];
            case 'if':
                const cond = eval(x[1], e);
                return eval(x[truthy(cond) ? 2 : 3], e);
            case 'fun':
                const parms = x[1];
                let body = x.slice(2);
                body = body.length === 1 ? body[0] : ['do'].append(body);
                const func1 = new Fun(parms, body, e);
                return func1;
            default:
                const args = x.map(y => eval(y, e));
                const func2 = args[0];
                const body2 = args.slice(1);
                if (func2 instanceof Fun) {
                    return eval(func2.body, newEnv(func2.e, func2.parms, args));
                } else {
                    return func2(...body2);
                }
        }
    } else if (!isNaN(x)) {
        return x
    } else {
        return findVar(x, e);
    }
}

function read(s) {
    return parse(lex(s));
}

function run(s) {
    return eval(read(s));
}

function equalValue(a, b) {
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
        for (let i = 0; i < a.length; i += 1) {
            if (!equalValue(a[i], b[i])) {
                return false;
            }
        }
        return true;
    } else {
        return a === b;
    }
}

function assert(func, code, expected) {
    const result = func(code);
    if (equalValue(result, expected)) {
        console.log(`%c${func.name} Pass: ${code} => ${result}`, 'background-color: green');
    } else {
        console.log(`%c${func.name} Fail: ${code}: ${result} not= ${expected}`, 'background-color: red; color: white;');
    }
}

function main() {
    // const tokens = lex('(+ 1 2)');
    // console.log(`tokens: ${tokens} `);

    // const tree = parse(tokens);
    // console.log(`tree: ${tree} `);

    // const result = eval(tree);
    // console.log(`result: ${result} `);

    assert(lex, 'x', ['x']);
    assert(lex, '(+ 1 2)', ['(', '+', '1', '2', ')']);
    assert(lex, '(+ 11 22)', ['(', '+', '11', '22', ')']);
    assert(lex, `(str_cat \n\t'n' \n\t't')`, ['(', 'str_cat', "'n'", "'t'", ')']);

    assert(flex, 'x', ['x']);
    assert(flex, '(+ 1 2)', ['(', '+', '1', '2', ')']);
    assert(flex, '(+ 11 22)', ['(', '+', '11', '22', ')']);
    assert(flex, `(str_cat \n\t'n' \n\t't')`, ['(', 'str_cat', "'n'", "'t'", ')']);
    // assert(read, '(+ 1 2)', ['+', 1, 2]);
    // assert(run, '(+ 1 2)', 3);
    // assert(run, '(do 1 2)', 2);
    // assert(run, '(def x 1)', []);
    // assert(run, 'x', 1);
    // assert(run, '(if true 11 22)', 11);
    // assert(run, '(if false 11 22)', 22);
    // assert(run, '((fun (x) (+ x 1)) 2)', 3);
}