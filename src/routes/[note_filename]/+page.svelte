<script>
    export let data;
</script>

<h1>{data.note._source.title}</h1>

<p>Note type : {data.note._source.note_type}</p>

{@html data.note._source.content_html}

{#if data.backlink_notes.length > 0}
    <h2>Fleeting notes liées :</h2>

    {#each data.backlink_notes as note}

        {@html note._source.content_html}

        <p>
            <a href={`/${note._source.filename}/`} rel="bookmark">#</a>
            {note._source.created_at || ""}
        </p>
        <hr />
    {/each}
{/if}
