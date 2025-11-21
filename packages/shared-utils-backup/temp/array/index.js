"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortByLocale = sortByLocale;
function sortByLocale(list, selector) {
    const mapper = selector ?? ((item) => String(item ?? ''));
    return [...list].sort((a, b) => {
        const left = mapper(a) ?? '';
        const right = mapper(b) ?? '';
        return left.localeCompare(right, undefined, { sensitivity: 'base' });
    });
}
