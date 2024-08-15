function getGapInPixels(node) {
    const style = window.getComputedStyle(node);
    const gapValue = style.getPropertyValue("gap");

    function convertToPixels(value, parentElement) {
        if (value.includes("em") || value.includes("rem")) {
            const fontSize = parseFloat(window.getComputedStyle(parentElement).fontSize);
            return parseFloat(value) * fontSize;
        }
        return parseFloat(value);
    }

    return convertToPixels(gapValue, node);
}

export default function ItemOverflowLimiter(node, options) {
    let destroyAllNextItems = false;
    let overflowItems = [];

    const gapInPixels = getGapInPixels(node);

    // search width of items to keep
    let widthItemsToKeep = 0;
    for (let item of node.children) {
        if (
            (options?.itemClass) &&
            (!item.classList.contains(options.itemClass))
        ) {
            widthItemsToKeep += item.clientWidth;
        }
    }

    for (let item of node.children) {
        if (destroyAllNextItems) {
            if (
                (!options?.itemClass) ||
                (item.classList.contains(options.itemClass))
            ) {
                overflowItems.push(item);
            }
        } else if (
            (item.offsetTop > 0) ||
            (item.offsetLeft + item.clientWidth + gapInPixels > (node.clientWidth - widthItemsToKeep))
        ) {
            overflowItems.push(item);
            destroyAllNextItems = true;
        }
    }

    for (let item of overflowItems) {
        if (options?.addClassOnOverflowItems) {
            if (!item.classList.contains(options.addClassOnOverflowItems)) {
                item.classList.add(options.addClassOnOverflowItems);
            }
        } else {
            item.remove();
        }
    }
}
