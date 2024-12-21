<script>
    import { browser } from '$app/environment';
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import debounceAction from "$lib/debounceAction.js";
    import AddTag from "$lib/AddTag.svelte";
    import TagsFilterList from "$lib/TagsFilterList.svelte";
    import CurrentAppliedTagsFilterList from "$lib/CurrentAppliedTagsFilterList.svelte";
    import Note from "$lib/Note.svelte";
    export let data;

    let queryString = "";

    function setUrlHash(value) {
        const url = new URL(window.location.href);
        url.hash = value;
        goto(url.pathname + url.search + url.hash, { replaceState: true });
    }

    $: displayMoreTags = $page.url.hash === "#display-more-tags";

    $: queryString = decodeURIComponent($page.url.searchParams.get("q") || "");

    let currentPage;
    $: currentPage = parseInt($page.url.searchParams.get("page") || 1, 10);

    $: currentUrl = $page.url;

    let previousPageUrl = "";
    $: {
        const url = new URL($page.url);
        url.searchParams.delete("created_before");
        if (currentPage - 1 > 1) {
            url.searchParams.set("page", currentPage - 1);
        } else {
            url.searchParams.delete("page");
        }
        previousPageUrl = url.toString();
    }

    let nextPageUrl = "";
    $: {
        const url = new URL($page.url);
        url.searchParams.set("page", currentPage + 1);
        nextPageUrl = url.toString();
    }

    let currentFilterTags;
    $: currentFilterTags = $page.url.searchParams.getAll("tags");
    
    let noteTypeFilter = "";
    $: {
        if (browser) {
            const url = new URL($page.url);
            if (noteTypeFilter === "") {
                if (url.searchParams.has("note_type") === true) {
                    url.searchParams.delete("note_type");
                    url.searchParams.delete("page");
                }
            } else if (url.searchParams.get("note_type") !== noteTypeFilter) {
                url.searchParams.set("note_type", noteTypeFilter);
                url.searchParams.delete("page");
            }
            goto(
                url.toString(),
                { 
                    keepFocus: true
                }
            );
        }
    }

    let totalSumOfAllNoteTypes;
    $: totalSumOfAllNoteTypes = data.noteTypes.reduce((accumulator, noteType) => accumulator + noteType.doc_count, 0);
</script>

<div style="display: flex; gap: 1em;">
    <div>Recherche effectué dans :</div>
    <div>
        <input
            type="radio"
            bind:group={noteTypeFilter}
            value=""
            id="note_type_all_input"
        />
        <label for="note_type_all_input">Tous type de notes ({totalSumOfAllNoteTypes})</label>
    </div>
    {#each data.noteTypes as note_type}
        <div>
            <input
                type="radio"
                bind:group={noteTypeFilter}
                value="{note_type.key}"
                id={`note_type_${note_type.key}_input`}
            /><label for={`note_type_${note_type.key}_input`}>{note_type.key} ({note_type.doc_count})</label>
        </div>
    {/each}
</div>
<input
    type="text"
    name="search"
    value={queryString}
    use:debounceAction={{ duration: 800 }}
    on:debounced={(e) => {
        const url = new URL($page.url);
        if (e.target.value.trim() === "") {
            url.searchParams.delete("q");
        } else {
            url.searchParams.set("q", encodeURIComponent(e.target.value));
        }
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


{#if data.totalNotesInAllPages == 0}
    <p>Aucune note trouvée pour votre recherche.</p>
{:else}
    {#if (currentPage === 1)}
        <p style="margin-top: 2em">Résultat de la recherche ({data.totalNotesInAllPages} notes) :</p>
    {:else}
        <p style="text-align: center">
            [ <a href={previousPageUrl}>&lt;&lt; Page précédente ({data.countNotesInPreviousPages})</a> ]
                {#if (data.countOldNotes === 0)}
                    Vous êtes sur la dernière page
                {:else}
                    [ <a href={nextPageUrl}>Page suivante ({data.countNotesInNextPages}) &gt;&gt; </a> ]
                {/if}
        </p>
    {/if}
    {#each data.notes as note}
        <Note 
            filename={note._source.filename}
            title={note._source.title}
            created_at={note._source.created_at}
            tags={note._source.tags}
            content_html={note?.highlight?.content_html || note._source.content_html}
        />
    {/each}
    {#if (data.countNotesInNextPages === 0)}
        <p style="text-align: center">
            Dernière page.
        </p>
    {:else}
        <p style="text-align: center">
            {#if (data.countNotesInPreviousPages === 0)}
                Vous êtes sur la première page
            {:else}
                [ <a href={previousPageUrl}>&lt;&lt; Page précédente ({data.countNotesInPreviousPages})</a> ]
            {/if}
            |
            [ <a href={nextPageUrl}>Page suivante ({data.countNotesInNextPages}) &gt;&gt; </a> ]
        </p>
    {/if}
{/if}
