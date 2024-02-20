const allStrings = {
    wantToClearPrompt: 'Are you sure you want to clear localStorage?',
    clearedMessage: 'Cleared localStorage!',
    clearButtonSelector: '#clear_local_storage_button'
}

async function clearLocalStorage() {
    if (confirm(allStrings.wantToClearPrompt)) {
        localStorage.clear();
        alert(allStrings.clearedMessage);
    }
}

const clearLocalStorageButton = document.querySelector(allStrings.clearButtonSelector);
clearLocalStorageButton.addEventListener('mousedown', clearLocalStorage);

main();