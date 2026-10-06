const sameSelection = (item, selection) =>
    (item.selectedSize || '') === (selection.selectedSize || '') &&
    (item.selectedColor || '') === (selection.selectedColor || '');

const selectCartItem = (items, productId, selection) => {
    const matches = items.filter((item) => item.productId.toString() === productId);
    if (selection.selectedSize === undefined && selection.selectedColor === undefined) {
        // Older clients can still address a single line, but must not change multiple variants.
        if (matches.length > 1) throw new Error('Select a size and colour to identify the cart item');
        return matches[0];
    }
    return matches.find((item) => sameSelection(item, selection));
};

module.exports = { sameSelection, selectCartItem };
