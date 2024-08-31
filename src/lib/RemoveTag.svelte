<script>
    export let currentUrl;
    export let tag;
    import TablerX from "~icons/tabler/x";

    let href;
    $: {
        const url = new URL(currentUrl);
        url.searchParams.delete('tags', tag.key);
        href = url.toString();
    }
</script>
<a
    href={href}
    >{tag.key}
{#if tag.doc_count}
    ({tag.doc_count})
{/if}
    <TablerX
        width="1em"
        height="1em"
        style="vertical-align: middle"
    />
</a>
<style>
    a {
        display: inline-block;
        padding: 0.2em 0;
        border: 1px solid #aaa;
        padding: 0.2em 0.4em;

        white-space: nowrap;
        text-decoration: none;
    }
</style>
