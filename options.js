let storedData = browser.storage.local.get();
storedData.then(data => {
    let showFilteredResults = getOptionsOrDefault(data);
    let filteredDomains = getBlacklistOrDefault(data);

    let list = document.querySelector('#blacklist');
    for (let domain of filteredDomains) {
        // Create the list item:
        let listItem = document.createElement('li');
        let removeButton = document.createElement('button');
        removeButton.innerHTML = "Remove";
        removeButton.onclick = getBlacklistRemoveCallback(domain);
        removeButton.classList.add("remove");
        // Set its contents:
        listItem.appendChild(removeButton);
        listItem.appendChild(document.createTextNode(domain));

        // Add it to the list:
        list.appendChild(listItem);
    }

    let checkShowFilteredResults = document.querySelector('#checkShowFiltered');
    checkShowFilteredResults.checked = showFilteredResults;
    checkShowFilteredResults.addEventListener('change', (event) => {
        storeShowFilteredOption();
    });
});

function storeShowFilteredOption() {
    let checkbox = document.querySelector('#checkShowFiltered');
    let checked = checkbox.checked;
    browser.storage.local.set({
        "showFilteredResults": checked
    });
}

function getBlacklistRemoveCallback(domain) {
    return function () { removeItemFromBlacklist(domain); };
}

function removeItemFromBlacklist(domain) {
    browser.storage.local.get('filteredDomains')
        .then((storedData) => {
            if (!storedData.filteredDomains) {
                storedData.filteredDomains = [];
            }
            let blacklist = storedData.filteredDomains;
            if (blacklist.includes(domain)) {
                blacklist.splice(blacklist.indexOf(domain), 1);
            }
            browser.storage.local.set({
                "filteredDomains": blacklist
            });
        });
}

function getOptionsOrDefault(data) {
    /* Return "Show Filtered Results on Page or default (true)" */
    if (data.showFilteredResults === null) {
        return true;
    }
    return data.showFilteredResults;
}

function getBlacklistOrDefault(data) {
    /* Return stored blacklist of domain or empty array [] */
    if (!data.filteredDomains) {
        return [];
    }
    return data.filteredDomains;
}