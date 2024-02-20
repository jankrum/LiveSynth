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

function main() {
    let input;

    while (true) {
        input = prompt('user> ');

        if (!input) {
            break;
        }

        alert(rep(input));
    }
}