<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import TagsFilterList from "$lib/TagsFilterList.svelte";
    import AddTag from "$lib/AddTag.svelte";
    import CurrentAppliedTagsFilterList from "$lib/CurrentAppliedTagsFilterList.svelte";

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

<svelte:head>
    <title>Notes du type Evergreen du jardin numérique de Stéphane Klein</title>
    <meta name="description" content="Notes du type Evergreen du jardin numérique de Stéphane Klein" />
</svelte:head>

<CurrentAppliedTagsFilterList tags={currentFilterTags} currentUrl={currentUrl} />

{#if data.tags.length > 0}
    <p>Cliquez sur un ou plusieurs tags pour appliquer un filtre sur la liste des "evergreen" notes :</p>

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

<ul class="letters">
{#each Object.keys(data.notesGroupedByFirstLetter) as firstLetter}
    <li><a href={`#${firstLetter}`}>{firstLetter}</a></li>
{/each}
</ul>

{#each Object.entries(data.notesGroupedByFirstLetter) as [firstLetter, notes]}
    <h2 id={firstLetter}>{firstLetter}</h2>

    <ul>
    {#each notes as note}
        <li><a href={`/${note._source.filename}/`}>{note._source.title}</a></li>
    {/each}
    </ul>
{/each}

<style>
    .letters {
        margin: 2rem auto;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
    }
</style>
