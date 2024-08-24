<script>
    export let currentUrl;
    export let tag;

    let href;
    $: {
        const urlParams = new URLSearchParams(currentUrl.search);
        urlParams.append('tags', tag.key);
        href = `/search/?${urlParams.toString()}`;
    }
</script>
<a
    href={href}
    >{tag.key}
{#if tag.doc_count}
    ({tag.doc_count})
{/if}
</a>
