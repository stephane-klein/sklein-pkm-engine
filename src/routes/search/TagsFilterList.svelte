<script>
	import { onMount, afterUpdate, tick } from "svelte";

    export let items;
    export let expanded = false;
    let fitsOnASingleLine = true;

    $: if (items) {
        fitsOnASingleLine = true;
    }

    let node;
    onMount(() => {
        addClassToItemsOverTheFirstLine();
    });
    afterUpdate(() => {
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

    async function addClassToItemsOverTheFirstLine() {
        let destroyAllNextItems = false;
        let overflowItems = [];

        const gapInPixels = getGapInPixels();

        // search width of items to keep
        let widthItemsToKeep = 0;
        await tick();
        for (let item of node.children) {
            if (!item.classList.contains("tag")) {
                widthItemsToKeep += item.clientWidth;
            }
            item.classList.remove("overflow-item");
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
                console.log("ici1");
                fitsOnASingleLine = false;
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
    {#if !fitsOnASingleLine}
        <li>
            {#if !expanded}
                <slot name="display-more-tags-button" />
            {:else}
                <slot name="display-less-tags-button" />
            {/if}
        </li>
    {/if}
</ul>
