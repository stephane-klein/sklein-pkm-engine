<script>
    import { page } from "$app/stores";
    import { format } from "date-fns";
    import Tag from "./Tag.svelte";
    import TagsFilterList from "./TagsFilterList.svelte";
    export let data;

    let querySearch = "";

    $: displayMoreTags = $page.url.hash === '#display-more-tags';

    $: querySearch = ($page.url.searchParams.has('tags')
        ? ($page.url.searchParams.getAll('tags').map((tag) => `#${tag}`)).join(" ")
        : ""
    );

    $: currentUrl = $page.url;
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

<TagsFilterList
    items={data.tags}
    let:item={item}
    expanded={displayMoreTags}
>
    <Tag tag={item} currentUrl={currentUrl} />
    <a
        slot="display-more-tags-button"
        href="#display-more-tags"
        on:click={() => { window.location.hash = "#display-more-tags"; }}
    >Afficher plus de tags…</a>
    <a
        slot="display-less-tags-button"
        href=""
        on:click={() => { window.location.hash = ""; }}
    >Afficher moins de tags…</a>
</TagsFilterList>

{#if (data.countNewNotes === 0)}
    <p style="margin-top: 2em">Résultat de la recherche ({data.countNotes} notes) :</p>
{:else}
    <p style="text-align: center">
        [ <a href={`?created_after=${data.firstNote._source.created_at}`}>&lt;&lt; Notes plus récentes
            ({data.countNewNotes})</a> ]
            {#if (data.countOldNotes === 0)}
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
                <a href={`/search/tags=${tag}`}>{tag}</a>
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
        [ <a href={`?created_after=${data.firstNote._source.created_at}`}>&lt;&lt; Notes plus récentes
            ({data.countNewNotes})</a> ]
        {/if}
        |
        [ <a href={`?created_before=${data.lastNote._source.created_at}`}>Notes plus anciennes ({data.countOldNotes}) &gt;&gt; </a> ]
    </p>
{/if}
