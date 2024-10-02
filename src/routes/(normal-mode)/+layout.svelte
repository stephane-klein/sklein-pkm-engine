<script>
    import { page } from "$app/stores"; 
    import { derived } from 'svelte/store';
    import { fly, scale } from "svelte/transition";
    import { beforeNavigate, afterNavigate } from '$app/navigation';
    import { quadOut } from "svelte/easing";
    import { Hamburger } from "svelte-hamburgers";
    import "../../screen.css";
    import "highlight.js/styles/github.css";
    import Avatar from "$lib/assets/favicon-48x48.png";

    const isDiariesPage = derived(page, $page => $page.url.pathname.startsWith('/diaries/'));
    const isNotePage = derived(page, $page => $page.url.pathname.startsWith('/notes/'));
    const isSearchPage = derived(page, $page => $page.url.pathname.startsWith('/search/'));
    const isTagsPage = derived(page, $page => $page.url.pathname.startsWith('/tags/'));

    beforeNavigate(() => {
        open = false;
    });

    afterNavigate(() => {
        window.scrollTo({ top: 0 });
    });

    let open;
</script>

<article class="normal-mode">
    <header class="narrow-screen" role="navigation">
        <div class="top">
            <a href="/"><img src={Avatar} alt="Logo" class="logo" /></a>
            <h1>
                {#if $isDiariesPage}Journaux
                {:else if $isNotePage}Notes
                {:else if $isSearchPage}Recherche
                {:else if $isTagsPage}Tous les tags
                {/if}
            </h1>
            <div style="flex-grow: 1; display: flex; justify-content: flex-end;">
                <Hamburger bind:open --color="var(--text-color)" />
            </div>
        </div>
        {#if open}
            <nav>
                <ul>
                    <li>
                        <a transition:fly={{ y: -15, delay: 50 }} class:is-active={$isDiariesPage} href="/diaries/">Journaux</a>
                    </li>
                    <li>
                        <a transition:fly={{ y: -15, delay: 100 }} class:is-active={$isNotePage} href="/notes/">Notes</a>
                    </li>
                    <li>
                        <a transition:fly={{ y: -15, delay: 150 }} class:is-active={$isSearchPage} href="/search/">Recherche</a>
                    </li>
                    <li>
                        <a transition:fly={{ y: -15, delay: 200 }} class:is-active={$isTagsPage} href="/tags/">Explorer tous les tags</a>
                    </li>
                </ul>
            </nav>
            <div class="bar" transition:scale={{ duration: 750, easing: quadOut, opacity: 1 }} />
        {/if}
    </header>
    <header class="wide-screen" role="navigation">
        <a href="/"><img src={Avatar} alt="Logo" class="logo" /></a>
        <nav style="padding: 1em 0; display: flex; flex-direction: row; justify-content: space-between;">
            <ul
                style="list-style: none; padding: 0; margin: 0; font-size: 1em; display: flex; gap: 0.5em; flex-wrap: wrap;"
            >
                <li><a class:is-active={$isDiariesPage} href="/diaries/">Journaux</a> | </li>
                <li><a class:is-active={$isNotePage} href="/notes/">Notes</a> | </li>
                <li><a href="/search/">Recherche</a> | </li>
                <li><a href="/tags/">Explorer tous les tags</a></li>
            </ul>
            <div>
            {#if $page.route.id === "/(normal-mode)/[note_filename]"}
                <a href="./zen/">Activer mode Zen</a>
            {/if}
            </div>
        </nav>
    </header>

    <main>
        <slot />
    </main>
</article>

<style>
    .is-active {
        font-weight: bold;
        text-decoration: none;
        color: black;
    }
</style>
