console.log("filter extension loaded");

// dump some defaults into browser storage
browser.storage.local.set(
    { "filteredDomains": ["stackoverflow.com"] }
);

function filterResults(mutationsList) {
    browser.storage.local.get("filteredDomains").then(
        function (storedData) {
            if (!storedData.filteredDomains) {
                results.filteredDomains = [];
            }
            filteredDomains = storedData.filteredDomains;
            mutationsList.forEach((mutation) => {
                if (mutation.type === 'childList') { //a child node was added
                    mutation.addedNodes.forEach((node) => {
                        if (node.classList.contains('result')) {
                            let liveNode = document.querySelector("#" + node.id);
                            for (let blacklistDomain of filteredDomains) {
                                let liveNode = document.querySelector("#" + node.id);
                                matchedNode = liveNode.dataset.domain;
                                if (matchedNode && matchedNode.includes(blacklistDomain)) {
                                    wrapAndCollapseResult(liveNode);
                                }
                                break;
                            }
                        }
                    }
                    );
                }
            });
        });
}

function wrapAndCollapseResult(resultNode) {
    /* Wrap the blacklisted result with a <details> element so we can autocollapse it */
    let wrapper = document.createElement('details');
    let filterSummary = document.createElement('summary');
    filterSummary.textContent = "Filtered result";
    wrapper.appendChild(filterSummary);
    resultNode.parentNode.insertBefore(wrapper, resultNode);
    wrapper.appendChild(resultNode);
}


let resultsObserver = new MutationObserver(filterResults);
let resultDiv = document.querySelector('#links');
/*
register the observer to watch for child node changes on the results div 
that are nodes with a data-domain element.
*/
resultsObserver.observe(resultDiv, { childList: true, attributeFilter: ['result', 'data-domain'] });