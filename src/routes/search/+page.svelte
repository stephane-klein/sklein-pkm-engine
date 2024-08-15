<script>
    import { page } from '$app/stores';
    import { format } from "date-fns";
    export let data;

    let querySearch = "";

    $: querySearch = ($page.url.searchParams.has('tags')
        ?`#${$page.url.searchParams.get('tags')}`
        : ""
    );
</script>

<div style="margin: 1em 0">
    <input
        type="text"
        name="search"
        value={querySearch}
        style="width: 100%; margin: 0; padding: 0.5em;"
        placeholder="Search"
    />
</div>

<p>Cliquez sur un tag pour affiner votre recherche :</p>
<ul class="search-tags-panel" style="">
    {#each data.tags as tag}
        <li
            style="display: inline-block; padding: 0.2em 0.4em; border: 1px solid #aaa;"
            ><a
                href={`/search/?tags=${tag.name}`}
                style="white-space: nowrap; text-decoration: none;"
                >{tag.name} ({tag.note_counts})</a>
        </li>
    {/each}
</ul>

{#if (data.countNewNotes === 0)}
    <p style="margin-top: 2em">Résultat de la recherche ({data.countNotes} notes) :</p>
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

<style>
    .search-tags-panel {
        position: relative;
        list-style: none;
        padding: 0;
        margin: 1em 0;
        font-size: 0.7em;
        display: flex;
        gap: 0.5em;
        flex-wrap: wrap;
        max-height: 4em;
        overflow: hidden;
    }

    .search-tags-panel::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2em;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0), #ffffff); /* Couleurs à ajuster */
        pointer-events: none;
    }
</style>
