export default function ItemOverflowLimiter(node, options) {
    let destroyAllNextItems = false;
    let itemsToDestroy = [];

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
                itemsToDestroy.push(item);
            }
        } else if (
            (item.offsetTop > 0) ||
            (item.offsetLeft + item.clientWidth > (node.clientWidth - widthItemsToKeep))
        ) {
            itemsToDestroy.push(item);
            destroyAllNextItems = true;
        }
    }

    for (let item of itemsToDestroy) {
        item.remove();
    }
}
