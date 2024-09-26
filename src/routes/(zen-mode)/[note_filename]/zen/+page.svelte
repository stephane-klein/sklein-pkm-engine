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

    {#if (data.note._source.note_type === "journal_note") && data.note._source?.title}
        <p class="datetime">Journal du {formatDate(data.note._source.created_at).toLowerCase()}</p>
    {/if}

    <div class="body">
        {@html data.note._source.content_html}
    </div>
</div>

<p style="text-align: center;margin-top: 5rem;"><a href="../" class="action-button">Quitter le mode Zen</a></p>
