console.log("myextension loaded");
// dump some defaults into browser storage
browser.storage.local.set(
    { "filteredDomains": ["javascriptinfo.com"] }
).then(() => {
    console.log("populated test defaults into storage")
}
);


let storage = browser.storage.local.get("filteredDomains");
//promise returned
storage.then((results) => {
    console.log("results");
    console.log(results);
    if (!results.filteredDomains) {
        results.filteredDomains = [];
    }
    filteredDomains = results.filteredDomains;
    console.log("Filtered domains is:");
    console.log(filteredDomains);
    //listen for updates on the search result page
    document.querySelector("#links").addEventListener("DOMSubtreeModified", () => {
        filteredDomains.forEach((domain) => {
            //match all elements whose data-domain attribute end with our target
            document.querySelectorAll(
                "div[data-domain$='" + domain + "']"
            ).forEach((el) => {
                el.style.backgroundColor = "red";
            });
        });
    });
});