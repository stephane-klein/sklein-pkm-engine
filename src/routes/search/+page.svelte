<script>
    import { format } from "date-fns";
    export let data;
</script>

{#if (data.countNewNotes === 0)}
    Notes les plus récentes :
{:else}
    <p style="text-align: center">
        [ <a href={`?created_after=${format(data.firstNote.created_at, "yyyyMMddHHmmss")}`}>&lt;&lt; Notes plus récentes
            ({data.countNewNotes})</a> ]
            {#if (data.countOldNotes === 0)}
                Pas de notes plus anciennes
            {:else}
                [ <a href={`?created_before=${format(data.lastNote.created_at, "yyyyMMddHHmmss")}`}>Notes plus anciennes ({data.countOldNotes}) &gt;&gt; </a> ]
            {/if}
    </p>
{/if}
{#each Object.entries(data.notesByDay) as [date, notes]}
    <h2>{date}</h2>
    {#each notes as note}

        {@html note.html}

        <p>
            <a href={`/${note.filename}/`} rel="bookmark">#</a>
            {format(note.created_at, "HH:mm")}
            -
            {#each note.tag_names || [] as tag, i }
                {#if i > 0}, {/if}
                <a href="/search/?tags={tag}">{tag}</a>
            {/each}
        </p>
        <hr />
    {/each}
{/each}
{#if (data.countOldNotes === 0)}
    <p style="text-align: center">
        Fin de la liste des notes.
    </p>
{:else}
    <p style="text-align: center">
        {#if (data.countNewNotes === 0)}
            Pas de notes plus récentes
        {:else}
        [ <a href={`?created_after=${format(data.firstNote.created_at, "yyyyMMddHHmmss")}`}>&lt;&lt; Notes plus récentes
            ({data.countNewNotes})</a> ]
        {/if}
        |
        [ <a href={`?created_before=${format(data.lastNote.created_at, "yyyyMMddHHmmss")}`}>Notes plus anciennes ({data.countOldNotes}) &gt;&gt; </a> ]
    </p>
{/if}
