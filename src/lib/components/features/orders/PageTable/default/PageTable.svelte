<script lang="ts">
</script>

<div class="infinite-scroll-table s-3iB8NG1jejlK virtualization-disabled" style="height: 100%; position: relative;">
  <div class="s-3iB8NG1jejlK table w-full align-middle text-sm" style="padding-top: 0px; padding-bottom: 0px;">
    <div class="thead s-3iB8NG1jejlK sticky top-14 z-10 table-header-group bg-background">
      <div
        class="table-cell h-10 border border-r-0 border-stone-200 px-2 align-middle font-medium text-muted-foreground first:border-l-0 dark:border-stone-700">
        Codice ordine
      </div>
      <!--<Head>-->
      <div
        class="table-cell h-10 border border-r-0 border-stone-200 px-2 align-middle font-medium text-muted-foreground first:border-l-0 dark:border-stone-700">
        Fornitore
      </div>
      <!--<Head>-->
      <div
        class="hidden table-cell h-10 border border-r-0 border-stone-200 px-2 align-middle font-medium text-muted-foreground first:border-l-0 md:table-cell dark:border-stone-700">
        Data ordine
      </div>
      <!--<Head>-->
      <div
        class="hidden table-cell h-10 border border-r-0 border-stone-200 px-2 align-middle font-medium text-muted-foreground first:border-l-0 md:table-cell dark:border-stone-700">
        Data consegna
      </div>
      <!--<Head>-->
      <div
        class="hidden table-cell h-10 border border-r-0 border-stone-200 px-2 pr-4 text-right align-middle font-medium text-muted-foreground first:border-l-0 md:table-cell dark:border-stone-700">
        Totale
      </div>
      <!--<Head>-->
      <div
        class="table-cell h-10 w-52 border border-r-0 border-stone-200 px-2 align-middle font-medium text-muted-foreground first:border-l-0 dark:border-stone-700">
        <div class="flex items-center justify-between">
          <div class="truncate">Stato</div>
          <button
            type="button"
            tabindex="0"
            aria-controls="pSTxqlOZMt"
            aria-expanded="false"
            data-state="closed"
            id="d8LtBP6juY"
            data-melt-dropdown-menu-trigger=""
            data-menu-trigger=""
            aria-describedby="sxUsYhlttf"
            data-melt-tooltip-trigger=""
            data-tooltip-trigger=""
            class="relative inline-flex size-6 items-center justify-center rounded border border-solid border-secondary bg-secondary/30 text-sm font-medium whitespace-nowrap text-secondary-foreground transition-colors hover:bg-secondary focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-secondary/50"
            aria-label="Filtra colonna"
            data-button-root=""
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide-icon lucide lucide-list-filter w-3 text-muted-foreground"
              ><path d="M3 6h18"></path><path d="M7 12h10"></path><path d="M10 18h4"></path></svg>
          </button><!--<Button>-->
          <!--<Tooltip-content>--><!--<IconButton>-->
          <!--<Dropdown-menu-content>-->
        </div>
      </div>
      <!--<Head>--><!--<Head-with-action>--><!--<Head-with-filter>-->
      <div
        class="hidden table-cell h-10 w-52 border border-r-0 border-stone-200 px-2 align-middle font-medium text-muted-foreground first:border-l-0 md:table-cell dark:border-stone-700">
        Consegna
      </div>
      <!--<Head>-->
      <div
        class="table-cell h-10 w-10 border border-r-0 border-stone-200 px-2 align-middle font-medium text-muted-foreground text-stone-300 first:border-l-0 dark:border-stone-700 dark:text-stone-500">
        <span class="sr-only">Archivia</span>
        <svg
          stroke-width="1.5"
          viewBox="0 0 24 24"
          fill="none"
          color="currentColor"
          data-darkreader-inline-color=""
          style="--darkreader-inline-color: currentColor"
          class="mx-auto h-4 w-4"
          ><path
            d="M7 6L17 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            data-darkreader-inline-stroke=""
            style="--darkreader-inline-stroke: currentColor;"></path
          ><path
            d="M7 9L17 9"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            data-darkreader-inline-stroke=""
            style="--darkreader-inline-stroke: currentColor;"></path
          ><path
            d="M9 17H15"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            data-darkreader-inline-stroke=""
            style="--darkreader-inline-stroke: currentColor;"></path
          ><path
            d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
            stroke="currentColor"
            stroke-width="1.5"
            data-darkreader-inline-stroke=""
            style="--darkreader-inline-stroke: currentColor;"></path
          ></svg
        ><!--<Archive>-->
      </div>
      <!--<Head>-->
    </div>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/b1e960c9-4c47-4fc2-a662-4f3f4786ca75"
          >PO-2026/0001</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        2 gen 2026
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 gen 2026
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        336,00 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-orange-700/20 bg-amber-500/20 px-3 py-0.5 text-sm whitespace-nowrap text-orange-700 max-md:text-xs dark:text-orange-200">
          Ricevuto parzialmente
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="MRETmCLpAc"
          id="Uho3_cM98e"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/ea05a34a-0523-4617-903c-61cf84d0dcb7"
          >PO-2025/0089</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6 nov 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        8 nov 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        305,00 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-orange-700/20 bg-amber-500/20 px-3 py-0.5 text-sm whitespace-nowrap text-orange-700 max-md:text-xs dark:text-orange-200">
          Ricevuto parzialmente
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="vLFbbP5iiW"
          id="viAIrMoi_x"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/580c60a1-3caa-4395-98d0-5b61cf0dbc6a"
          >PO-2025/0088</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6 nov 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6 nov 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        61,00 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="LTXq28eedJ"
          id="qANWtFSw6N"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/340a45a1-54e2-411e-b22c-8ffebcaf1c75"
          >PO-2025/0087</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6 nov 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6 nov 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        1,22 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="lJBZK-9OxD"
          id="UwA_x9BHo-"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/a38b431d-0f6d-44a5-98f1-2ad9f41321cc"
          >PO-2025/0086</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6 nov 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6 nov 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        272,67 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="BmeEn1webU"
          id="DhUYn--AYK"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/7272de9b-647d-4ad5-b754-ef0c88624c7f"
          >PO-2025/0085</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        31 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        2 nov 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        9,15 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="Y7YFM8OSwC"
          id="Lz9dQzUeWG"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/c80ef98f-460a-4d57-996a-87a81cc3cc3d"
          >PO-2025/0084</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        31 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        2 nov 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        9,15 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="I8P4Msf-GV"
          id="OteIA6RSew"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/883333c3-d792-4f8e-8ee0-07941e8b3bb3"
          >PO-2025/0082</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        31 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 nov 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        1,22 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="cAJBJFfGLR"
          id="RiU51oBqMG"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/51990da5-2c63-4656-bf0d-c58826b46078"
          >PO-2025/0081</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/24d77612-0b04-49eb-8202-65d0d551b42f?ref=true">Casa della brugola</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        24 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        3 nov 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        1,22 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="NwLA_isTJY"
          id="7PWbNBUwdp"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/daef9c39-e2b5-4d78-9fed-2c47e1e149a2"
          >PO-2025/0080</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/24d77612-0b04-49eb-8202-65d0d551b42f?ref=true">Casa della brugola</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        22 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        22 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        183,00 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="YYa77KMYlf"
          id="mesYsGo3q2"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/4a5fb981-03de-46bb-82f9-fc17f24c1fe2"
          >PO-2025/0079</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        22 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        24 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6,09 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="U5rk71G2WV"
          id="t1Fvaiavn5"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/388d233d-1baf-432f-bd93-900acc7b9251"
          >PO-2025/0078</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        22 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        24 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        9,15 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="wSof347L9S"
          id="qgEAfFInIy"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/d953e31c-ee78-472f-b732-d80a9f3d8a2e"
          >PO-2025/0077</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        22 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        24 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        9,15 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="e5XXxgSdjZ"
          id="aZLXvzK0NF"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/c006d6b1-67d0-467d-9ae6-ed4d01e23262"
          >PO-2025/0076</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        20 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        24 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        12,20 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="6JmvoYcTme"
          id="Blkg8xkGQQ"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/592e2174-221c-4e65-a57d-00c768a021ad"
          >PO-2025/0075</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        20 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        26 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        33,60 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="HqD40qgrBH"
          id="DZt7DZSjz6"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/4ee27125-f120-4a1a-9a6b-3f1de7e75f99"
          >PO-2025/0074</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        10 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        10 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        36,60 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="44u_VKikoI"
          id="L2daldTYmo"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/fc306c55-aebe-4db2-b273-f05f75c911cd"
          >PO-2025/0073</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        10 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        10 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        36,60 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="AFVYU366YM"
          id="79z4_xWFUg"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/f5c8ea41-d8dc-4ffc-b74a-14a46674bb87"
          >PO-2025/0072</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        10 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        10 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        36,60 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="MrevmG_TJR"
          id="Uq95XF7VsX"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/1d10da7d-e98f-4299-aa9c-66b3832a5c70"
          >PO-2025/0071</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        9 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        9 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        36,60 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="k62uCRH2XV"
          id="8MJ27BAhyJ"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/4303d18a-5703-4ed2-98a5-df64c799e12a"
          >PO-2025/0070</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/24d77612-0b04-49eb-8202-65d0d551b42f?ref=true">Casa della brugola</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        9 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        9 ott 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        73,20 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="LkrEAHoMCd"
          id="XytyktzQdc"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/f0a8d9dd-64b5-442e-a413-e759edf1cb6d"
          >PO-2025/0069</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/bcdb6a1b-3dd4-4204-89d8-0349181a73bc?ref=true">Arke</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        23 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        26 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6,10 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-info/20 text-info border-info/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Inviato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="FRusgMgMgM"
          id="AsC0bxLvxp"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/97c4573d-b5a6-4976-b0dc-258353184d6c"
          >PO-2025/0068</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/bcdb6a1b-3dd4-4204-89d8-0349181a73bc?ref=true">Arke</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        23 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        27 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6,10 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="rY5yOMZ6nd"
          id="F8caeCt68J"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/327589a5-df38-4188-bc94-f2816933ddec"
          >PO-2025/0067</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/bcdb6a1b-3dd4-4204-89d8-0349181a73bc?ref=true">Arke</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        23 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        25 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6,10 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-info/20 text-info border-info/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Inviato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="Qg_fDIK3sM"
          id="i0zadZKca3"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/93d86720-6690-42dd-ad74-abff00ede808"
          >PO-2025/0066</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/bcdb6a1b-3dd4-4204-89d8-0349181a73bc?ref=true">Arke</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        23 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        28 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6,10 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="WKC8S62JrM"
          id="80U-O43ga-"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/f51a08ce-ed74-4665-9251-d21980e5636b"
          >PO-2025/0065</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/bcdb6a1b-3dd4-4204-89d8-0349181a73bc?ref=true">Arke</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        23 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        26 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6,10 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="XmbntMm3tL"
          id="J1rrACSpCU"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/33ff7297-0465-493f-bf47-0a33cecf715d"
          >PO-2025/0064</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/24d77612-0b04-49eb-8202-65d0d551b42f?ref=true">Casa della brugola</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        19 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        28 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        183,00 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="b5v9yOQ-dt"
          id="Z7EEFuD30h"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/e31d0d52-5bb7-45c3-9329-fa078869742a"
          >PO-2025/0063</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        12 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        30 set 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        9,76 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          Bozza
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="ugdsDzHs-P"
          id="V5e3KAn63Z"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/6a844607-4fa8-45db-bcf7-c4ea5aba9b70"
          >PO-2025/0025</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        22 mag 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        31 mag 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        5,00 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="FNjYXNd90f"
          id="AMVZduMS5Z"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/6bf6f4c9-9d2a-4ae7-9bbb-bb58f6527aad"
          >PO-2025/0052</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/10a1572e-b2cb-4ca6-9fa4-89ab6b57aa9e?ref=true">Supplier name</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        7 lug 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        7 lug 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        12297,60 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="DNC-y3fllK"
          id="QSmqKuGFlC"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/14982e14-6207-4b2c-ba2b-45199b08fcbb"
          >PO-2025/0051</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        16 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        30 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        1,22 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="mNYUTNoVUV"
          id="avqnqMSfFE"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/294d9287-d308-4442-afbb-807a48d70468"
          >PO-2025/0049</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/b5a4540d-f1ba-4fc6-a36d-e12b9daa3aec?ref=true">Road Runner Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        20 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        24,40 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-info/20 text-info border-info/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Inviato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="1UOk0b7IFf"
          id="jgK2o_5m7t"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/155f7bb1-95d4-4371-a662-56ae865fbc6c"
          >PO-2025/0050</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        28 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        126,57 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-info/20 text-info border-info/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Inviato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="Cc7-LS1hYE"
          id="u4w246-HJR"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/7048c242-551c-44dd-8b1f-0cff8bc8b443"
          >PO-2025/0048</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        20 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        9,15 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          Bozza
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="eJ9e2XoIqQ"
          id="MnYWfY03q-"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/cae7d5fd-20d6-40f9-be64-02dd5e73886c"
          >PO-2025/0047</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        20 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        9,15 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-info/20 text-info border-info/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Inviato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="Hfghboczws"
          id="Btr1Hsw1Df"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/3e2db1f1-ff36-4ec1-a073-aa157ad04ebc"
          >PO-2025/0046</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/10a1572e-b2cb-4ca6-9fa4-89ab6b57aa9e?ref=true">Supplier name</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        11529,00 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          Bozza
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="cPkW4AyPgV"
          id="hlWr7DOUCR"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/b81b48b7-b343-48ff-b62c-c54f2c50c129"
          >PO-2025/0045</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/10a1572e-b2cb-4ca6-9fa4-89ab6b57aa9e?ref=true">Supplier name</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        11529,00 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          Bozza
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="RCMHgyV4EL"
          id="4RoiCFJo0U"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/8d8c8fb3-78b2-42d4-ae16-7f50f72a81bd"
          >PO-2025/0044</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/10a1572e-b2cb-4ca6-9fa4-89ab6b57aa9e?ref=true">Supplier name</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        11529,00 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          Bozza
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="Ss4iqQVHyz"
          id="AG-Yst5Ry5"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/608e5c46-bb24-4649-8434-7a9787933bf3"
          >PO-2025/0043</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        20 giu 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        0,01 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-info/20 text-info border-info/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Inviato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="DTaM-6ur70"
          id="oNo5merg4c"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/c8080717-3c8c-4db6-87a3-85857ac0a6ba"
          >PO-2025/0026</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        27 mag 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        31 mag 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6,09 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="7FfahjAvw9"
          id="tRnQLQvXU6"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/1dcb55a5-4f40-43b4-a128-10d6e3348628"
          >PO-2025/0024</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        13 mag 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        23 mag 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        0,01 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="bX6CCPfKxA"
          id="fvuLOaT2vl"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/c06d07db-8a2f-4762-85f4-d560cb419937"
          >PO-2025/0021</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 apr 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        20 apr 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        8,54 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="SJiMuHrx95"
          id="D1QX5joenZ"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/87f8f9c0-9e77-4e2c-8c8d-69697f1a23ce"
          >PO-2025/0023</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        10 apr 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        26 apr 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        0,01 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="RZaf2dYpjJ"
          id="QvXOZc3M8O"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/35534b6e-0abe-434b-a542-1c61acdd3fdb"
          >PO-2025/0022</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/24d77612-0b04-49eb-8202-65d0d551b42f?ref=true">Casa della brugola</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 apr 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        26 apr 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        1,22 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="v0TaF4SHc6"
          id="Z2-v4sd-5-"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/a114bf67-72b5-4172-b6d6-76301acede72"
          >PO-2025/0020</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        4 apr 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        20 apr 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        2,44 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="6tF0n6auWk"
          id="szWWL7kOH-"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/ca6675cf-4778-4084-bee4-3aa4ab6ead99"
          >PO-2025/0019</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        20 mar 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        28 mar 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        9,15 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="BVnD-9yiLS"
          id="lVj9pqZwqp"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/2db6fcae-9e4c-4b3b-9839-42b3554d04ae"
          >PO-2024/0030</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        13 dic 2024
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        18 dic 2024
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        106,75 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-orange-700/20 bg-amber-500/20 px-3 py-0.5 text-sm whitespace-nowrap text-orange-700 max-md:text-xs dark:text-orange-200">
          Ricevuto parzialmente
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="HgpuBfuFFD"
          id="qG38SZRHll"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/827b52c3-f22c-42cd-887d-2d59cc7aed31"
          >PO-2025/0008</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        23 gen 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        28 gen 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        91,50 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-orange-700/20 bg-amber-500/20 px-3 py-0.5 text-sm whitespace-nowrap text-orange-700 max-md:text-xs dark:text-orange-200">
          Ricevuto parzialmente
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="DRP3wLOcoL"
          id="wem5wiE2ta"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/0b185053-dc09-4943-945e-211584f0b191"
          >PO-2025/0015</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6 mar 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        28 mar 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6,09 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="UxyaK-JUji"
          id="8CMopttmW4"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/30dcca78-ba00-4a7f-a26a-a91ecfc60d2f"
          >PO-2025/0014</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6 mar 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        28 mar 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        6,09 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Ricevuto
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="sXL73WS-ml"
          id="-xuwQ6VH-W"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="group s-3iB8NG1jejlK table-row hover:bg-muted/70 dark:hover:bg-muted/50"
      ><div
        class="cell table-cell h-10 border border-r-0 border-b-0 border-stone-200 px-2 align-middle font-medium group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a class="text-primary underline" href="/app/purchase/upsert/a6509937-5461-40dd-94c8-05b97724b851"
          >PO-2025/0010</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <a
          class="text-primary underline"
          href="/app/contacts/suppliers/upsert/fd350ff9-e8fa-41b3-8801-d79b2ec4e805?ref=true">Acme Inc</a>
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        7 feb 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        15 feb 2025
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 pr-4 text-right align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        1,22 €
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <div
          class="bg-success/20 text-success border-success/30 inline-block cursor-default rounded border px-3 py-0.5 text-sm whitespace-nowrap max-md:text-xs">
          Approvato
        </div>
        <!--<ColoredLabel>--><!--<OrderStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell hidden table-cell border border-r-0 border-b-0 border-stone-200 px-2 align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 md:table-cell dark:border-stone-700">
        <div
          class="inline-block cursor-default rounded border border-stone-700/20 bg-stone-200/50 px-3 py-0.5 text-sm whitespace-nowrap text-stone-700 max-md:text-xs">
          In attesa
        </div>
        <!--<ColoredLabel>--><!--<ListDeliveryStatusLabel>-->
      </div>
      <!--<Table-cell>-->
      <div
        class="cell table-cell w-10 border border-r-0 border-b-0 border-stone-200 text-center align-middle group-last:border-b group-first-of-type:border-t-0 first:border-l-0 dark:border-stone-700">
        <button
          type="button"
          tabindex="0"
          aria-describedby="uWxuvWdPLl"
          id="amNqq-Wqr4"
          data-state="closed"
          data-melt-tooltip-trigger=""
          data-tooltip-trigger=""
          class="hover:text-destructive-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label="Archivia elemento"
          disabled=""
          data-button-root=""
          ><svg
            stroke-width="1.5"
            viewBox="0 0 24 24"
            fill="none"
            color="currentColor"
            data-darkreader-inline-color=""
            style="--darkreader-inline-color: currentColor"
            class="h-4 w-4"
            ><path
              d="M7 6L17 6"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M7 9L17 9"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M9 17H15"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ><path
              d="M3 12H2.6C2.26863 12 2 12.2686 2 12.6V21.4C2 21.7314 2.26863 22 2.6 22H21.4C21.7314 22 22 21.7314 22 21.4V12.6C22 12.2686 21.7314 12 21.4 12H21M3 12V2.6C3 2.26863 3.26863 2 3.6 2H20.4C20.7314 2 21 2.26863 21 2.6V12M3 12H21"
              stroke="currentColor"
              stroke-width="1.5"
              data-darkreader-inline-stroke=""
              style="--darkreader-inline-stroke: currentColor;"></path
            ></svg
          ><!--<Archive>--></button
        ><!--<Button>-->
        <!--<Tooltip-content>--><!--<IconButton>-->
      </div>
      <!--<Table-cell>--></infinite-table-row>
    <infinite-table-row class="s-3iB8NG1jejlK table-row"
      ><div class="s-3iB8NG1jejlK h-0 w-full"></div></infinite-table-row>
  </div>
  <iframe
    style="display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;"
    aria-hidden="true"
    tabindex="-1"
    src="about:blank"></iframe>
</div>
