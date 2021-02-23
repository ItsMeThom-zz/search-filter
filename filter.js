function filterResults(mutationsList) {
    /* Identify all results whose data-domain attribute matches one in the blacklist
        and then apply filtering to it so that its not visible.
    */
    let storedData = browser.storage.local.get();
    storedData.then((data) => {
        let showFilteredResults = getOptionsOrDefault(data);
        let filteredDomains = getBlacklistOrDefault(data);
        mutationsList.forEach((mutation) => {
            if (mutation.type === 'childList') { // a child node was added
                mutation.addedNodes.forEach((node) => {
                    if (node.classList.contains('result')) {
                        let liveNode = document.querySelector("#" + node.id);
                        let gotFiltered = false;
                        for (let blacklistedDomain of filteredDomains) {
                            let liveNode = document.querySelector("#" + node.id);
                            nodeDomain = liveNode.dataset.domain;
                            if (nodeDomain && nodeDomain.includes(blacklistedDomain)) {
                                if (showFilteredResults) {
                                    wrapAndCollapseResult(liveNode);
                                } else {
                                    liveNode.remove();
                                }
                                gotFiltered = true;
                                break;
                            }
                        }
                        if (!gotFiltered && liveNode.dataset.domain !== undefined) {
                            // if its a valid result node add a button to allow filtering
                            addBlacklistButton(liveNode);
                        }
                    }
                }
                );
            }
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

function addBlacklistButton(elem) {
    /* add <a> element that triggers addDomainToFilter blacklist for a given result */
    let filterBtn = document.createElement('a');
    filterBtn.id = "filter_" + elem.id;
    filterBtn.href = '#';
    filterBtn.innerHTML = "Filter " + elem.dataset.domain + " from future searches";
    filterBtn.onclick = function () { addDomainToFilter(elem.dataset.domain); };
    filterBtn.classList.add('.feedback-prompt');
    elem.parentNode.insertBefore(filterBtn, elem.nextSibling);
}

function addDomainToFilter(domain) {
    /* Callback in onclick to add given domain to the blacklist */
    browser.storage.local.get('filteredDomains').then(
        (storedData) => {
            let blacklist = getBlacklistOrDefault(storedData);
            if (!blacklist.includes(domain)) {
                //todo: parse domain and set as wildcard *.whatever.com
                blacklist.push(domain);
                browser.storage.local.set(
                    { "filteredDomains": blacklist }
                );
            }
        }
    );
}

function wrapAndCollapseResult(resultNode) {
    /* Wrap the blacklisted result with a <details> element so we can autocollapse it */
    let wrapper = document.createElement('details');
    wrapper.id = resultNode.id + "_wrapper";
    wrapper.classList.add('.feedback-prompt');

    let filterSummary = document.createElement('summary');
    filterSummary.textContent = "Filtered " + resultNode.dataset.domain + " from results";

    wrapper.appendChild(filterSummary);
    resultNode.parentNode.insertBefore(wrapper, resultNode);
    wrapper.appendChild(resultNode);
}

/*
register the observer on the results page to watch for child node changes on the results div
that are elements with a data-domain element.
*/
let resultsObserver = new MutationObserver(filterResults);
let resultDiv = document.querySelector('#links');
if (resultDiv) {
    resultsObserver.observe(resultDiv, { childList: true, attributeFilter: ['result', 'data-domain'] });
}

