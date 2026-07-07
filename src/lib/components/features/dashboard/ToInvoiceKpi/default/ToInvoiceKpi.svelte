<!--
  @component ToInvoiceKpi
  @description Self-enclosed KPI: number of documents to invoice this week. A
  count of zero is treated as a positive "all clear" state. Lazily fetches its
  own data; falls back to a mock until the endpoint ships.
  @keywords dashboard, kpi, to-invoice, fatturare, invoices
  @api GET /api/legal-entities/{legalEntity}/dashboard/kpis/to-invoice (proposed) -> CountKpiResponse
-->
<script lang="ts">
  import { StatCard } from '$lib/components/core/StatCard'
  import { Resource } from '$lib/hooks/use-resource.svelte'
  import * as m from '$lib/paraglide/messages.js'
  import { createRoute } from '$lib/utils/route-builder'
  import type { SnippetProps } from '$utils/runtime'
  import FileTextIcon from '@lucide/svelte/icons/file-text'
  import { fetchCountKpi } from '../../_shared/fetchers'
  import { mockToInvoice } from './ToInvoiceKpi.mock'

  let { legalEntity }: SnippetProps = $props()

  const resource = new Resource(() => fetchCountKpi(legalEntity?.id, 'to-invoice', mockToInvoice))
  const kpi = $derived(resource.data?.value)
  const isZero = $derived(kpi?.count === 0)
</script>

<StatCard
  title={m.dashboard_to_invoice_title()}
  loading={resource.loading}
  error={resource.error}
  onRetry={resource.reload}
  value={kpi ? String(kpi.count) : undefined}
  tone={isZero ? 'positive' : 'default'}
  footerTitle={isZero ? m.dashboard_all_clear() : undefined}
  footerSubtext={isZero ? m.dashboard_to_invoice_zero() : m.dashboard_to_invoice_subtext()}
  href={createRoute({ $id: 'to-invoice' })}
  demo={resource.data?.demo}>
  {#snippet icon()}<FileTextIcon class="size-4" />{/snippet}
</StatCard>
