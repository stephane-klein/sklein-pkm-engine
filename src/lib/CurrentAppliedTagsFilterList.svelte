<script>
    import RemoveTag from "$lib/RemoveTag.svelte";

    export let tags;
    export let currentUrl;
</script>

{#if tags.length > 0}
    <div style="margin: 1em 0">
        <p>Filtre actif, cliquez pour en enlever un tag :</p>
        <ul class="current-filter-tags">
            {#each tags as tag, i}
                {#if i > 0}<span>and</span>{/if}
                <li>
                    <RemoveTag tag={{key: tag}} currentUrl={currentUrl} />
                </li>
            {/each}
        </ul>
    </div>
{/if}
<style>
    UL {
        list-style: none;
        margin-top: 0.5em;
        padding: 0;
        display: flex;
        gap: 0.5em;
        flex-wrap: wrap;
        font-size: 0.7em;
        align-items: center;
    }
</style>
