<script>
    import { page } from "$app/stores"; 
    import { derived } from 'svelte/store';
    import "../screen.css";
    import "highlight.js/styles/github.css";

    const isDiariesPage = derived(page, $page => $page.url.pathname.startsWith('/diaries/'));
    const isNotePage = derived(page, $page => $page.url.pathname.startsWith('/notes/'));
</script>

<nav style="margin: 1em 0;">
    <ul
        style="list-style: none; padding: 0; margin: 1em 0; font-size: 1em; display: flex; gap: 0.5em; flex-wrap: wrap;"
    >
        <li><a class:is-active={$isDiariesPage} href="/diaries/">Journaux</a> | </li>
        <li><a class:is-active={$isNotePage} href="/notes/">Notes</a> | </li>
        <li><a href="/search/">Recherche</a> | </li>
        <li><a href="/tags/">Explorer tous les tags</a></li>
    </ul>
</nav>

<slot />

<style>
    .is-active {
        font-weight: bold;
        text-decoration: none;
        color: black;
    }
</style>
