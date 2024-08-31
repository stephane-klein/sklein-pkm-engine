<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import debounceAction from "$lib/debounceAction.js";
    import AddTag from "$lib/AddTag.svelte";
    import TagsFilterList from "$lib/TagsFilterList.svelte";
    import CurrentAppliedTagsFilterList from "$lib/CurrentAppliedTagsFilterList.svelte";
    export let data;

    let queryString = "";

    function setUrlHash(value) {
        const url = new URL(window.location.href);
        url.hash = value;
        goto(url.pathname + url.search + url.hash, { replaceState: true });
    }

    $: displayMoreTags = $page.url.hash === '#display-more-tags';

    $: queryString = decodeURIComponent($page.url.searchParams.get('q') || "");

    $: currentUrl = $page.url;

    let previousPageUrl = "";
    $: {

        if (data.firstNote) {
            const url = new URL($page.url);
            url.searchParams.delete("created_before");
            url.searchParams.set("created_after", data.firstNote._source.created_at);
            previousPageUrl = url.toString();
        }
    }

    let nextPageUrl = "";
    $: {
        if (data.lastNote) {
            const url = new URL($page.url);
            url.searchParams.delete("created_after");
            url.searchParams.set("created_before", data.lastNote._source.created_at);
            nextPageUrl = url.toString();
        }
    }

    let currentFilterTags;
    $: currentFilterTags = $page.url.searchParams.getAll("tags");
</script>

<div style="margin: 1em 0">
    <input
        type="text"
        name="search"
        value={queryString}
        use:debounceAction={{ duration: 400 }}
        on:debounced={(e) => {
            const url = new URL($page.url);
            url.searchParams.set("q", encodeURIComponent(e.target.value));
            goto(
                url.toString(),
                { 
                    keepFocus: true
                }
            );
        }}
        style="width: 100%; margin: 0; padding: 0.5em;"
        placeholder="Search"
    />
    <CurrentAppliedTagsFilterList tags={currentFilterTags} currentUrl={currentUrl} />
</div>

{#if data.tags.length > 0}
    <p>Cliquez sur un tag pour affiner votre recherche :</p>

    <TagsFilterList
        items={data.tags}
        let:item={item}
        expanded={displayMoreTags}
    >
        <AddTag tag={item} currentUrl={currentUrl} />
        <a
            slot="display-more-tags-button"
            href="#display-more-tags"
            on:click={() => { setUrlHash("display-more-tags"); }}
        >Afficher plus de tags…</a>
        <a
            slot="display-less-tags-button"
            href=""
            on:click={() => { setUrlHash(""); }}
        >Afficher moins de tags…</a>
    </TagsFilterList>
{/if}

{#if data.countNotes == 0}
    <p>Aucune note trouvée pour votre recherche.</p>
{:else}
    {#if (data.countNewNotes === 0)}
        <p style="margin-top: 2em">Résultat de la recherche ({data.totalNotesInAllPages} notes) :</p>
    {:else}
        <p style="text-align: center">
            [ <a href={previousPageUrl}>&lt;&lt; Notes plus récentes ({data.countNewNotes})</a> ]
                {#if (data.countOldNotes === 0)}
                    Pas de notes plus anciennes
                {:else}
                    [ <a href={nextPageUrl}>Notes plus anciennes ({data.countOldNotes}) &gt;&gt; </a> ]
                {/if}
        </p>
    {/if}
    {#each data.notes as note}

        {@html note._source.content_html}

        <p>
            <a href={`/${note._source.filename}/`} rel="bookmark">#</a>
            {note._source.created_at}
            -
            {#each note._source.tags || [] as tag, i }
                {#if i > 0}, {/if}
                <a href={`/search/tags=${tag}`}>{tag}</a>
            {/each}
        </p>
        <hr />
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
            [ <a href={previousPageUrl}>&lt;&lt; Notes plus récentes ({data.countNewNotes})</a> ]
            {/if}
            |
            [ <a href={nextPageUrl}>Notes plus anciennes ({data.countOldNotes}) &gt;&gt; </a> ]
        </p>
    {/if}
{/if}
