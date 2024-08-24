<script>
	import { onMount } from "svelte";

    export let items;
    export let expanded = false;

    let node;
    onMount(() => {
        addClassToItemsOverTheFirstLine();
    });

    function getGapInPixels() {
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

    function addClassToItemsOverTheFirstLine() {
        let destroyAllNextItems = false;
        let overflowItems = [];

        const gapInPixels = getGapInPixels();

        // search width of items to keep
        let widthItemsToKeep = 0;
        for (let item of node.children) {
            if (!item.classList.contains("tag")) {
                widthItemsToKeep += item.clientWidth;
            }
        }

        for (let item of node.children) {
            if (destroyAllNextItems) {
                if (item.classList.contains("tag")) {
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
            item.classList.add("overflow-item");
        }
    }
</script>
<ul bind:this={node}>
    {#each items as item}
        <li class="tag">
            <slot item={item} />
        </li>
    {/each}
    <li>
        {#if !expanded}
            <slot name="display-more-tags-button" />
        {:else}
            <slot name="display-less-tags-button" />
        {/if}
    </li>
</ul>
