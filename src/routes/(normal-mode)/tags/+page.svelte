<script>
    export let data;
</script>
<svelte:head>
    <title>Les tags du jardin numérique de {data.digital_garden_name}</title>
    <meta name="description" content="Les tags du jardin numérique de {data.digital_garden_name}" />
</svelte:head>

<ul class="search-tags-panel">
    {#each data.tags as tag}
        <li><a
            href={`/search/?tags=${tag.key}`}
            >{tag.key} ({tag.doc_count})</a>
        </li>
    {/each}
</ul>

<style>
    .search-tags-panel {
        margin: 1em 0;
        font-size: 0.7em;
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        column-gap: 0.5em;
        row-gap: 1em;
        flex-wrap: wrap;

        > LI {
            display: inline-block;
            padding: 0.2em 0.4em;
            border: 1px solid #aaa;

            > A {
                white-space: nowrap;
                text-decoration: none;
            }
        }
    }
</style>
