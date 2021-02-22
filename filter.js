console.log("filter extension loaded");

function filterResults(mutationsList) {
    /* Identify all results whose data-domain attribute matches one in the blacklist
        and then apply filtering to it so that its not visible.
    */
    browser.storage.local.get('filteredDomains')
        .then((storedData) => {
            if (!storedData.filteredDomains) {
                storedData.filteredDomains = [];
            }
            filteredDomains = storedData.filteredDomains;
            mutationsList.forEach((mutation) => {
                if (mutation.type === 'childList') { // a child node was added
                    mutation.addedNodes.forEach((node) => {
                        if (node.classList.contains('result')) {
                            let liveNode = document.querySelector("#" + node.id);
                            let gotFiltered = false;
                            for (let blacklistDomain of filteredDomains) {
                                let liveNode = document.querySelector("#" + node.id);
                                matchedNode = liveNode.dataset.domain;
                                if (matchedNode && matchedNode.includes(blacklistDomain)) {
                                    wrapAndCollapseResult(liveNode);
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

function addBlacklistButton(elem) {
    //add a button to allow filtering
    let filterBtn = document.createElement('a');
    filterBtn.id = "filter_" + elem.id;
    filterBtn.href = '#';
    filterBtn.innerHTML = "Filter " + elem.dataset.domain + " from future searches";
    filterBtn.onclick = function () { addDomainToFilter(elem.dataset.domain); };
    filterBtn.classList.add('.feedback-prompt');
    elem.parentNode.insertBefore(filterBtn, elem.nextSibling);
}

function addDomainToFilter(domain) {
    console.log("Adding " + domain + "to the blacklist");
    browser.storage.local.get('filteredDomains').then(
        (storedData) => {
            if (!storedData.filteredDomains.includes(domain)) {
                //todo: parse domain and set as wildcard *.whatever.com
                let blacklist = storedData.filteredDomains;
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

