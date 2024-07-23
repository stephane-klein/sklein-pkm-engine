<script>
    import { format } from "date-fns";
    export let data;
</script>

<h1>{data.note.title}</h1>

Note type : {data.note.note_type}

{@html data.note.html}

{#if data.backlink_notes.length > 0}
    <h2>Fleeting notes liées :</h2>

    {#each data.backlink_notes as note}

        {@html note.html}

        <p>
            <a href={`/${note.filename}/`} rel="bookmark">#</a>
            {note.created_at || ""}
        </p>
        <hr />
    {/each}
{/if}
