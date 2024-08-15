<script>
    import clsx from "clsx/lite";
    import IconChevronRight from "$lib/icons/ChevronRight.svelte";
    import IconChevronDown from "$lib/icons/ChevronDown.svelte";
    import { page } from "$app/stores";
    import { format } from "date-fns";
    import ItemOverflowLimiter from "./ItemOverflowLimiter.js";
    export let data;

    let querySearch = "";

    $: displayMoreTags = $page.url.hash === '#display-more-tags';

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

<div class={clsx("search-tags-panel", displayMoreTags && "display-more-tags")}>
    {#if displayMoreTags}
        <a
            style="display: inline-block;"
            href=""
            on:click={() => { window.location.hash = ''; }}>
            <IconChevronDown
                style="height: 100%; width: auto; display: block; color: #666;"
                color="black"
                width="2em"
                height="2em"
            />
        </a>
    {:else}
        <a
            style="display: inline-block;"
            href="#display-more-tags"
            on:click={() => { window.location.hash = "#display-more-tags"; }}
        >
            <IconChevronRight
                style="height: 100%; width: auto; display: block; color: #666;"
                color="black"
                width="2em"
                height="2em"
            />
        </a>
    {/if}
    <ul use:ItemOverflowLimiter={{
        itemClass: "tag",
        addClassOnOverflowItems: "overflow-item"
    }}>
        {#each data.tags as tag}
            <li class="tag">
                <a
                    href={`/search/?tags=${tag.name}`}
                    >{tag.name} ({tag.note_counts})</a>
            </li>
        {/each}
        {#if displayMoreTags}
            <li><a
                href=""
                on:click={() => { window.location.hash = ""; }}>
                >Afficher moins de tags…</a></li>
        {:else}
            <li><a
                href="#display-more-tags"
                on:click={() => { window.location.hash = "#display-more-tags"; }}
            >Afficher plus de tags…</a></li>
        {/if}
    </ul>
</div>

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
