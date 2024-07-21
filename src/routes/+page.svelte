<script>
    import { format } from "date-fns";
    export let data;
</script>

<p>Recent notes:</p>

{#each Object.entries(data.notesByDay) as [date, notes]}
    <h2>{date}</h2>
    {#each notes as note}

        {@html note.html}

        <p>
            <a href={`/${note.filename}/`} rel="bookmark">#</a>
            {format(note.created_at, "HH:mm")}
        </p>
        <hr />
    {/each}
{/each}
