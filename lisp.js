const MAL = (() => {
    class Reader {
        constructor(tokens) {
            this.tokens = tokens;
            this.position = 0;
        }

        peek() {
            return this.tokens[this.position];
        }

        next() {
            const result = this.peek();
            this.position += 1;

            return result;
        }
    }

    function tokenize(text) {
        return text.match(/[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g)
    }

    function readForm(reader) {
        const firstToken = reader.peek();

        switch (firstToken) {
            case '(':
                readList(reader)
        }
    }

    function readStr(text) {
        const tokens = tokenize(text);
        const reader = new Reader(tokens);
        readForm(reader);
    }

    function read(text) {
        return text;
    }

    function eval(text) {
        return text;
    }

    function print(text) {
        return text;
    }

    function rep(text) {
        const ast = read(text);
        const result = eval(ast);
        return print(result)
    }

    return {
        rep
    };
})();

function main() {
    let input;

    while (true) {
        input = prompt('user> ');

        if (!input) {
            break;
        }

        alert(MAL.rep(input));
    }
}