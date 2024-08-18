<script>
    import { format } from "date-fns";
    export let data;
</script>

{#if (data.countNewNotes <= 0)}
    Notes les plus récentes :
{:else}
    <p style="text-align: center">
        [ <a href={`?created_after=${data.firstNote._source.created_at}`}>&lt;&lt; Notes plus récentes
            ({data.countNewNotes})</a> ]
            {#if (data.countOldNotes <= 0)}
                Pas de notes plus anciennes
            {:else}
                [ <a href={`?created_before=${data.lastNote._source.created_at}`}>Notes plus anciennes ({data.countOldNotes}) &gt;&gt; </a> ]
            {/if}
    </p>
{/if}
{#each Object.entries(data.notesByDay) as [date, notes]}
    <h2>{date}</h2>
    {#each notes as note}

        {@html note._source.content_html}

        <p>
            <a href={`/${note._source.filename}/`} rel="bookmark">#</a>
            {format(note._source.created_at, "HH:mm")}
            -
            {#each note._source.tags || [] as tag, i }
                {#if i > 0}, {/if}
                <a href="/tags/{tag}/">{tag}</a>
            {/each}
        </p>
        <hr />
    {/each}
{/each}
{#if (data.countOldNotes <= 0)}
    <p style="text-align: center">
        Fin de la liste des notes.
    </p>
{:else}
    <p style="text-align: center">
        {#if (data.countNewNotes <= 0)}
            Pas de notes plus récentes
        {:else}
        [ <a href={`?created_after=${data.lastNote._source.created_at}`}>&lt;&lt; Notes plus récentes
            ({data.countNewNotes})</a> ]
        {/if}
        |
        [ <a href={`?created_before=${data.lastNote._source.created_at}`}>Notes plus anciennes ({data.countOldNotes}) &gt;&gt; </a> ]
    </p>
{/if}
