<script>
    import { page } from "$app/stores"; 
    import { derived } from 'svelte/store';
    import "../../screen.css";
    import "highlight.js/styles/github.css";
    import Avatar from "$lib/assets/favicon-48x48.png";

    const isDiariesPage = derived(page, $page => $page.url.pathname.startsWith('/diaries/'));
    const isNotePage = derived(page, $page => $page.url.pathname.startsWith('/notes/'));
    console.log($page.route.id);
</script>

<div class="normal-mode">
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

    <slot />
</div>

<style>
    .is-active {
        font-weight: bold;
        text-decoration: none;
        color: black;
    }
</style>
