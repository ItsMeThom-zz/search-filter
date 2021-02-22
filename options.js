browser.storage.local.get('filteredDomains')
    .then((storedData) => {
        if (!storedData.filteredDomains) {
            storedData.filteredDomains = [];
        }
        let storedBlacklist = storedData.filteredDomains;
        let list = document.querySelector('#blacklist');
        for (let domain of storedBlacklist) {
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

    });

function setOptionsShowFilteredCheckbox() {
    browser.storage.local.get('showFilteredResults').then((storedData) => {
        if (!storedData.showFilteredResults) {
            storedData.showFilteredResults = true;
        }
        let checkbox = document.querySelector('#checkShowFiltered');
        checkbox.attributes.checked = storedData.showFilteredResults;
    });
}

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
