async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

await sleep(100)
console.log('bitch');