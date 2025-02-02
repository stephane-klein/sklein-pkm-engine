<script>
    import { format } from "date-fns";
    import { fr } from "date-fns/locale";
    import Note from "$lib/Note.svelte";
    
    function formatDate(value) {
        const formattedDate = format(value, "eeee dd MMMM yyyy à HH:mm", {locale: fr});
        return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }

    export let data;
</script>
<svelte:head>
    <title>{data.note._source?.title || `Journal du ${formatDate(data.note._source.created_at)}`} - Jardin numérique de {data.digital_garden_name}</title>
    <meta name="description" content={data.note._source?.title || `Journal du ${formatDate(data.note._source.created_at)}`} />
</svelte:head>

<div class="note">
    <h1>{data.note._source?.title || formatDate(data.note._source.created_at)}</h1>

    {#if data.note._source.tags.length > 0}
        <ul class="tags">
            {#each data.note._source.tags as tag, i}
                <li><a href={`/search/?tags=${tag}`}>#{tag}</a>{#if i < data.note._source.tags.length - 1}, {/if}
                </li>
            {/each}
        </ul>
    {/if}

    {#if (data.note._source.note_type === "journal_note") && data.note._source?.title}
        <p class="datetime">Journal du {formatDate(data.note._source.created_at).toLowerCase()}</p>
    {/if}

    <div class="body">
        {@html data.note._source.content_html}
    </div>
</div>

<hr class="ornament" />

{#if data.backlink_notes.length > 0}
    <h2>Journaux liées à cette note :</h2>

    {#each data.backlink_notes as note}
        <Note 
            filename={note._source.filename}
            title={note._source.title}
            created_at={note._source.created_at}
            tags={note._source.tags}
            content_html={note._source.content_html}
        />
    {/each}
{/if}
