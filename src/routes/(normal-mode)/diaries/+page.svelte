<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import AddTag from "$lib/AddTag.svelte";
    import CurrentAppliedTagsFilterList from "$lib/CurrentAppliedTagsFilterList.svelte";
    import TagsFilterList from "$lib/TagsFilterList.svelte";
    import Note from "$lib/Note.svelte";
    export let data;

    function setUrlHash(value) {
        const url = new URL(window.location.href);
        url.hash = value;
        goto(url.pathname + url.search + url.hash, { replaceState: true });
    }

    function formatDate(value) {
        const formattedDate = new Intl.DateTimeFormat(
            "fr-FR",
            { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric"
            }
        ).format(new Date(value));
        return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }

    $: displayMoreTags = $page.url.hash === '#display-more-tags';

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

<CurrentAppliedTagsFilterList tags={currentFilterTags} currentUrl={currentUrl} />

{#if data.tags.length > 0}
    <p>Cliquez sur un ou plusieurs tags pour appliquer un filtre sur la liste des notes de type "Journaux" :</p>

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
    {#each Object.entries(data.notesByDay) as [date, notes]}
        <h2 style="text-align: center; margin: 2rem 0; font-variant-caps: small-caps;">{formatDate(date)}</h2>
        {#each notes as note}
            <Note 
                filename={note._source.filename}
                title={note._source.title}
                created_at={note._source.created_at}
                tags={note._source.tags}
                content_html={note._source.content_html}
            />
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
            [ <a href={previousPageUrl}>&lt;&lt; Notes plus récentes ({data.countNewNotes})</a> ]
            {/if}
            |
            [ <a href={nextPageUrl}>Notes plus anciennes ({data.countOldNotes}) &gt;&gt; </a> ]
        </p>
    {/if}
{/if}
