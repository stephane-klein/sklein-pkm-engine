<script>
    import { format } from "date-fns";
    export let data;
</script>

<h1>Tag : "{data.tag_name}"</h1>

<p>Voici toutes les notes qui sont associées au tag "{ data.tag_name }".</p>

<hr />

{#each data.notes as note}

    {#if note.note_type !== "fleeting_note"}
        <h2><a href={`/${note.filename}/`}>{note.title}</a></h2>
    {/if}

    {@html note.html}

    <p>
        <a href={`/${note.filename}/`} rel="bookmark">#</a>
        {#if note.created_at}
            {format(note.created_at, "yyyy-MM-dd HH:mm")}
        {/if}
        -
        {#each note.tag_names || [] as tag, i }
            {#if i > 0}, {/if}
            <a href="/tags/{tag}/">{tag}</a>
        {/each}
    </p>
    <hr />
{/each}
