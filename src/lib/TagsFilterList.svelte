<script>
    import clsx from "clsx/lite";
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
                fitsOnASingleLine = false;
            }
        }

        for (let item of overflowItems) {
            item.classList.add("overflow-item");
        }
    }
</script>
<div class={clsx("search-tags-panel", !expanded && "reduced")}>
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
</div>

<style lang="postcss" global>
    .search-tags-panel {
        display: flex;
        align-items: flex-start;
        width: 100%;
        margin: 1em 0;
        font-size: 0.7em;
        align-items: center;

        > UL {
            flex-grow: 1;
            position: relative;
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            gap: 0.5em;
            flex-wrap: wrap;

            LI > * {
                vertical-align: middle;
            }

            > LI:not(.tag) A {
                border-color: transparent;
            }
        }
    }

    .reduced {
        UL {
            max-height: 2.2em;
            overflow: hidden;

            > LI.overflow-item {
                display: none!important;
            }
        }
    }
</style>
