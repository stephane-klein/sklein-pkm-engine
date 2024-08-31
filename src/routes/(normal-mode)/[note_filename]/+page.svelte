<script>
    import { format } from "date-fns";
    import { fr } from "date-fns/locale";
    
    function formatDate(value) {
        const formattedDate = format(value, "eeee dd MMMM yyyy à HH:mm", {locale: fr});
        return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }

    export let data;
</script>

<div class="note">
    <h1>{data.note._source?.title || formatDate(data.note._source.created_at)}</h1>

    {#if data.note._source.tags.length > 0}
        <ul class="tags">
            {#each data.note._source.tags as tag, i}
                <li><a href={`/diaries/?tags=${tag}`}>#{tag}</a>{#if i < data.note._source.tags.length - 1}, {/if}
                </li>
            {/each}
        </ul>
    {/if}

    <div class="body">
        {@html data.note._source.content_html}
    </div>
</div>

<hr class="ornament" />

{#if data.backlink_notes.length > 0}
    <h2>Journaux liées à cette note :</h2>

    {#each data.backlink_notes as note}
        <div class="journal-note">
            <p class="header">
                <span class="note-datetime">
                    <a
                        href={`/${note._source.filename}/`}
                    >
                        {#if note._source.title}
                            {note._source.title}
                        {:else}
                            Journal du {format(note._source.created_at, "yyyy-MM-dd à HH:mm")}
                        {/if}
                    </a>
                </span>

                <span class="tags">
                    {#each note._source.tags || [] as tag, i }
                        <a href={`/search/tags=${tag}`}>#{tag}</a>
                    {/each}
                </span>
            </p>

            <div class="body">
                {@html note._source.content_html}
            </div>
        </div>
    {/each}
{/if}
