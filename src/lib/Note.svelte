<script>
    import { browser } from '$app/environment';
    import clsx from "clsx/lite";
    import { format } from "date-fns";
    import { fr } from "date-fns/locale";
    import { onMount } from "svelte";

    export let filename;
    export let title;
    export let created_at;
    export let tags;
    export let content_html;

    let bodyNode;
    let overflowed;
    let maxHeight;
    let close = true;

    onMount(() => {
        if (browser) {
            overflowed = (bodyNode.scrollHeight > bodyNode.clientHeight);
            maxHeight = bodyNode.scrollHeight;
        }
    });

</script>
<div class="journal-note">
    <p class="header">
        <span class="note-title">
            <a
                href={`/${filename}/`}
            >
                {#if title}
                    {title}
                {:else}
                    Journal du {format(created_at, "eeee dd MMMM yyyy à HH:mm", {locale: fr})}
                {/if}
            </a>
        </span>

        {#if tags.length > 0}
            <span class="tags">
                {#each tags || [] as tag, i }
                    <span><a href={`/search/?tags=${tag}`}>#{tag}</a>{#if i < tags.length - 1}, {/if}</span>
                {/each}
            </span>
        {/if}
    </p>

    <div
        class={clsx("body", close && "close")}
        style:max-height={!close ? `${maxHeight + 100}px` : null}
        bind:this={bodyNode}
    >
        {@html content_html}
    </div>
    {#if overflowed && close}
        <div class="see-more-or-less">
            <button on:click={() => {close = false; }}>Afficher l'intégralité de la note</button>
        </div>
    {:else if (!close)}
        <div class="see-more-or-less">
            <button on:click={() => {close = true; }}>Réduire l'affichage de la note</button>
        </div>
    {/if}
</div>
