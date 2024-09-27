<script>
    import { format } from "date-fns";

    export let filename;
    export let title;
    export let created_at;
    export let tags;
    export let content_html;
</script>
<div class="journal-note">
    <p class="header">
        <span class="note-datetime">
            <a
                href={`/${filename}/`}
            >
                {#if title}
                    {title}
                {:else}
                    Journal du {format(created_at, "yyyy-MM-dd à HH:mm")}
                {/if}
            </a>
        </span>

        <span class="tags">
            {#each tags || [] as tag }
                <a href={`/search/tags=${tag}`}>#{tag}</a>
            {/each}
        </span>
    </p>

    <div class="body">
    {@html content_html}
    </div>
</div>
