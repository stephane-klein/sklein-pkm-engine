<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import TagsFilterList from "$lib/TagsFilterList.svelte";
    import AddTag from "$lib/AddTag.svelte";
    import CurrentAppliedTagsFilterList from "../../lib/CurrentAppliedTagsFilterList.svelte";

    export let data;

    function setUrlHash(value) {
        const url = new URL(window.location.href);
        url.hash = value;
        goto(url.pathname + url.search + url.hash, { replaceState: true });
    }

    $: displayMoreTags = $page.url.hash === '#display-more-tags';

    $: currentUrl = $page.url;

    let currentFilterTags;
    $: currentFilterTags = $page.url.searchParams.getAll("tags");
</script>

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

{#each Object.entries(data.notesGroupedByFirstLetter) as [firstLetter, notes]}
    <h2>{firstLetter}</h2>

    <ul>
    {#each notes as note}
        <li><a href={`/${note._source.filename}/`}>{note._source.title}</a></li>
    {/each}
    </ul>
{/each}
