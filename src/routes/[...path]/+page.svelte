<script lang="ts">
    import type { PageProps } from './$types'

    let { data }: PageProps = $props()
</script>

<div>
    <h1>{data.pageConfig.title}</h1>

    {#if Object.keys(data.routeParams).length > 0}
        <div>
            <h2>Route Parameters:</h2>
            <pre>{JSON.stringify(data.routeParams, null, 2)}</pre>
        </div>
    {/if}

    <h2>Page Config:</h2>
    <pre>{JSON.stringify(data.pageConfig, null, 2)}</pre>
</div>