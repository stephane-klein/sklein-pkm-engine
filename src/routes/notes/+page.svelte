<script>
    export let data;
</script>
{#each Object.entries(data.notesGroupedByFirstLetter) as [firstLetter, notes]}
    <h2>{firstLetter}</h2>

    <ul>
    {#each notes as note}
        <li><a href={`/${note._source.filename}/`}>{note._source.title}</a></li>
    {/each}
    </ul>
{/each}
