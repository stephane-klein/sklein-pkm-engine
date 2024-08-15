<script>
    export let data;
</script>

<ul class="search-tags-panel">
    {#each data.tags as tag}
        <li><a
            href={`/search/?tags=${tag.name}`}
            >{tag.name} ({tag.note_counts})</a>
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
