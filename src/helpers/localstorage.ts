export function getSearchFilters(type: string): any {
    const stringFilters = localStorage.getItem("searchFilters");
    if (stringFilters) {
        const filters = JSON.parse(stringFilters);
        if (filters) {
            let x = filters[type] || "";
            return x;
        }
    }
    return "";
}


export function setSearchFilters(type: string, filtersProvided: any) {
    const stringFilters = localStorage.getItem("searchFilters");
    if (stringFilters) {
        const filters = JSON.parse(stringFilters);
        filters[type] = filtersProvided;

        localStorage.setItem("searchFilters", JSON.stringify(filters));
    } else {
        const newFilters: { [key: string]: any } = {};
        newFilters[type] = filtersProvided;
        localStorage.setItem("searchFilters", JSON.stringify(newFilters));
    }

}