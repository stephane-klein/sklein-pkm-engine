<script>
    export let currentUrl;
    export let tag;

    let href;
    $: {
        const url = new URL(currentUrl);
        url.searchParams.append('tags', tag.key);
        href = url.toString();
    }
</script>
<a
    href={href}
    >{tag.key}
{#if tag.doc_count}
    ({tag.doc_count})
{/if}
</a>
