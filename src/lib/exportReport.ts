import { APP_NAME } from '@/lib/brand'
import type { AdminDashboardData } from '@/services/fundService'

export interface AdminReportOptions {
  targetMonth?: string
  generatedBy?: string
}
/** Escape user/API-provided values before embedding them into the report HTML. */
const escapeHtml = (value: string | number) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const money = (value: number) => `${Number.isFinite(value) ? value.toLocaleString() : '0'} RWF`

const formatDate = (value = new Date()) =>
  value.toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })

const metricCard = (label: string, value: string, note: string, accent = 'brand') => `
  <div class="metric transition">
    <span class="metric-label">${label}</span>
    <span class="metric-value">${value}</span>
    <span class="metric-note">${note}</span>
    <span class="accent ${accent}"></span>
  </div>`

const statusDots = (items: Array<{ name: string; count: number }>, empty: string) =>
  items.length === 0
    ? `<p class="empty">${empty}</p>`
    : `<ul class="status-list">${items
        .map(
          (item) => `<li>
            <span class="dot"></span>
            <span class="status-name">${escapeHtml(item.name.replaceAll('_', ' '))}</span>
            <strong>${item.count.toLocaleString()}</strong>
          </li>`,
        )
        .join('')}</ul>`

const performanceBars = (
  rows: Array<Record<string, string | number>>,
  keys: Array<[string, string, string]>,
) => {
  if (rows.length === 0) return '<p class="empty">No data available for this period.</p>'
  const values = rows.flatMap((row) => keys.map(([key]) => Number(row[key]) || 0))
  const max = Math.max(...values, 1)
  return `
    <div class="bars">
      ${rows
        .map(
          (row) => `<div class="bar-col">
            ${keys
              .map(
                ([key, , colorClass]) =>
                  `<div class="bar-track ${colorClass}"><div class="bar" style="height:${Math.max(4, Math.round(((Number(row[key]) || 0) / max) * 100))}%"></div></div>`,
              )
              .join('')}
            <span class="bar-label">${escapeHtml(row.month)}</span>
          </div>`,
        )
        .join('')}
    </div>
    <div class="legend">${keys
      .map(
        ([, label, colorClass]) =>
          `<span class="legend-item"><span class="legend-swatch ${colorClass}"></span>${label}</span>`,
      )
      .join('')}</div>`
}
const REPORT_STYLES = `
  :root {
    --brand: #547792;
    --brand-soft: #94B4C1;
    --ink: #213448;
    --paper: #eae0cf;
    --card: #fbf7ee;
    --line: #d9cdb8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Manrope, system-ui, -apple-system, sans-serif;
    background: var(--paper);
    color: var(--ink);
    font-size: 13px;
    line-height: 1.55;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .report { max-width: 1000px; margin: 0 auto; padding: 28px 24px 64px; }
  .toolbar { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 18px; position: sticky; top: 12px; z-index: 5; }
  .toolbar button {
    font: inherit; font-weight: 700; border-radius: 10px; padding: 9px 16px; cursor: pointer;
    border: 1px solid var(--brand); background: var(--brand); color: var(--paper);
  }
  .toolbar button.ghost { background: var(--card); color: var(--brand); border-color: var(--brand-soft); }
  .hero {
    background: linear-gradient(135deg, #547792 0%, #3f5d6e 100%);
    color: #eae0cf; border-radius: 18px; padding: 26px 28px; position: relative; overflow: hidden;
  }
  .hero::after {
    content: ''; position: absolute; right: -40px; top: -40px; width: 190px; height: 190px;
    border-radius: 50%; background: rgba(234, 224, 207, 0.14);
  }
  .hero .brand { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; opacity: 0.85; font-weight: 700; }
  .hero h1 { font-size: 24px; margin: 6px 0 4px; font-weight: 800; }
  .hero p { font-size: 12px; opacity: 0.85; }
  .hero-meta { display: flex; flex-wrap: wrap; gap: 22px; margin-top: 16px; }
  .hero-meta span b { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; opacity: 0.7; }
  .hero-meta span { font-size: 13px; font-weight: 700; }
  .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin: 20px 0; }
  .metric { position: relative; background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px 16px 20px; overflow: hidden; }
  .metric .accent { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }
  .accent.brand { background: var(--brand); }
  .accent.soft { background: var(--brand-soft); }
  .accent.ink { background: var(--ink); }
  .metric-label { display: block; font-size: 11px; color: var(--brand); text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; }
  .metric-value { display: block; font-size: 20px; font-weight: 800; margin-top: 6px; letter-spacing: -0.01em; }
  .metric-note { display: block; font-size: 11px; color: #6b7885; margin-top: 4px; }
  .section { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 20px 22px; margin-top: 18px; }
  .section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
  .section h2, .section .plain { font-size: 15px; font-weight: 800; letter-spacing: -0.01em; }
  .section-head p { font-size: 11px; color: #6b7885; }
  .section-body table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
  .section-body th { text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7885; padding: 8px 10px; border-bottom: 1px solid var(--line); }
  .section-body td { padding: 9px 10px; border-bottom: 1px solid #eee4d2; vertical-align: middle; }
  .section-body tr:last-child td { border-bottom: none; }
  .section-body td.num, .section-body th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .grand-total td { font-weight: 800; background: rgba(148, 180, 193, 0.18); }
  .badge { display: inline-block; border-radius: 999px; padding: 2px 10px; font-size: 10.5px; font-weight: 700; }
  .badge.ok { background: rgba(84, 119, 146, 0.15); color: var(--brand); }
  .badge.warn { background: rgba(148, 180, 193, 0.4); color: var(--ink); }
  .statuses { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 18px; }
  .status-card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; }
  .status-card h3 { font-size: 13px; font-weight: 800; margin-bottom: 10px; }
  .status-list { list-style: none; }
  .status-list li { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid #eee4d2; font-size: 12.5px; }
  .status-list li:last-child { border-bottom: none; }
  .status-list .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--brand); }
  .status-name { flex: 1; color: #58646f; text-transform: capitalize; }
  .empty { color: #8b949c; text-align: center; padding: 16px 0; font-size: 12px; }
  .bars { display: flex; gap: 18px; min-height: 158px; align-items: flex-end; padding: 8px 4px 0; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 158px; justify-content: flex-end; }
  .bar-track { width: 100%; max-width: 42px; height: 120px; border-radius: 8px 8px 4px 4px; background: rgba(148, 180, 193, 0.25); display: flex; align-items: flex-end; }
  .bar-track.brand .bar { background: linear-gradient(180deg, #6b8fa3, #547792); }
  .bar-track.soft .bar { background: linear-gradient(180deg, #aec7d2, #94b4c1); }
  .bar { width: 100%; border-radius: 8px 8px 4px 4px; }
  .bar-label { font-size: 10.5px; color: #6b7885; font-weight: 600; }
  .legend { display: flex; gap: 16px; justify-content: center; margin-top: 10px; font-size: 11px; color: #58646f; }
  .legend-item { display: flex; align-items: center; gap: 6px; }
  .legend-swatch { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
  .legend-swatch.brand { background: #547792; }
  .legend-swatch.soft { background: #94b4c1; }
  .footer { margin-top: 22px; text-align: center; font-size: 11px; color: #8b949c; }
  @media print {
    .toolbar { display: none; }
    body { background: #fff; }
    .report { padding: 0; max-width: none; }
    .section, .status-card, .metric { break-inside: avoid; }
  }
`
const periodLabel = (targetMonth?: string) => {
  if (!targetMonth) return 'Current period'
  const [year, month] = targetMonth.split('-').map(Number)
  if (!year || !month || month < 1 || month > 12) return targetMonth
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function buildAdminReport(data: AdminDashboardData, options: AdminReportOptions = {}): string {
  const { summary: s } = data
  const rate =
    s.expectedMonth > 0 ? Math.min(100, Math.round((s.collectedMonth / s.expectedMonth) * 100)) : 0
  const now = new Date()
  const period = periodLabel(options.targetMonth)

  const performance = data.contributionPerformance
  const performanceTotal = performance.reduce(
    (acc, item) => ({
      expected: acc.expected + item.expected,
      collected: acc.collected + item.collected,
    }),
    { expected: 0, collected: 0 },
  )
  const performanceRows = performance
    .map((item) => {
      const pct = item.expected > 0 ? Math.round((item.collected / item.expected) * 100) : 0
      const pctClass = pct >= 100 ? 'badge ok' : 'badge warn'
      return `<tr>
        <td>${escapeHtml(item.month)}</td>
        <td class="num">${money(item.expected)}</td>
        <td class="num">${money(item.collected)}</td>
        <td class="num"><span class="${pctClass}">${pct}%</span></td>
        <td class="num">${money(Math.max(0, item.expected - item.collected))}</td>
      </tr>`
    })
    .join('')

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${APP_NAME} Fund Overview Report</title>
  <style>${REPORT_STYLES}</style>
</head>
<body>
  <div class="report">
    <div class="toolbar">
      <button class="ghost" onclick="downloadReport()">Download HTML</button>
      <button onclick="window.print()">Print / Save as PDF</button>
    </div>
    <header class="hero">
      <span class="brand">${APP_NAME} · Community Finance Platform</span>
      <h1>Fund Overview Report</h1>
      <p>Contribution performance, fund movement and member activity summary.</p>
      <div class="hero-meta">
        <span><b>Report period</b>${period}</span>
        <span><b>Generated</b>${formatDate(now)}</span>
        <span><b>Generated by</b>${escapeHtml(options.generatedBy ?? 'Administrator')}</span>
      </div>
    </header>

    <div class="metrics">
      ${metricCard('Fund balance', money(s.fundBalance), `${money(s.fundInflow)} in · ${money(s.fundOutflow)} out`, 'ink')}
      ${metricCard('Collected this period', money(s.collectedMonth), `${rate}% of target`, 'brand')}
      ${metricCard('Expected this period', money(s.expectedMonth), `${s.pendingContributions} contribution(s) awaiting review`, 'soft')}
      ${metricCard('Active members', s.membersActive.toLocaleString(), `${s.membersTotal} total · ${s.membersSuspended} suspended`, 'brand')}
      ${metricCard('Assistance approved', s.assistanceApproved.toLocaleString(), `${s.assistancePending} awaiting review`, 'soft')}
      ${metricCard('Outstanding', money(s.outstanding), `${s.overdueMembers} member(s) overdue`, 'ink')}
    </div>`

  if (performance.length > 0) {
    html += `
    <section class="section">
      <div class="section-head">
        <h2>Contribution performance</h2>
        <p>Expected versus collected contributions, ${period}</p>
      </div>
      <div class="section-body">
        ${performanceBars(performance, [
          ['expected', 'Expected', 'soft'],
          ['collected', 'Collected', 'brand'],
        ])}
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th class="num">Expected</th>
              <th class="num">Collected</th>
              <th class="num">Collection rate</th>
              <th class="num">Gap</th>
            </tr>
          </thead>
          <tbody>
            ${performanceRows}
            <tr class="grand-total">
              <td>Total</td>
              <td class="num">${money(performanceTotal.expected)}</td>
              <td class="num">${money(performanceTotal.collected)}</td>
              <td class="num">${performanceTotal.expected > 0 ? Math.round((performanceTotal.collected / performanceTotal.expected) * 100) : 0}%</td>
              <td class="num">${money(Math.max(0, performanceTotal.expected - performanceTotal.collected))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>`
  }
  const fundMovement = data.fundMovement
  const fundMovementTotal = fundMovement.reduce(
    (acc, item) => ({ inflow: acc.inflow + item.inflow, outflow: acc.outflow + item.outflow }),
    { inflow: 0, outflow: 0 },
  )
  if (fundMovement.length > 0) {
    html += `
    <section class="section">
      <div class="section-head">
        <h2>Fund movement</h2>
        <p>Monthly inflow versus outflow</p>
      </div>
      <div class="section-body">
        ${performanceBars(fundMovement, [
          ['inflow', 'Inflow', 'brand'],
          ['outflow', 'Outflow', 'soft'],
        ])}
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th class="num">Inflow</th>
              <th class="num">Outflow</th>
              <th class="num">Net</th>
            </tr>
          </thead>
          <tbody>
            ${fundMovement
              .map(
                (item) => `<tr>
                  <td>${escapeHtml(item.month)}</td>
                  <td class="num">${money(item.inflow)}</td>
                  <td class="num">${money(item.outflow)}</td>
                  <td class="num">${money(item.inflow - item.outflow)}</td>
                </tr>`,
              )
              .join('')}
            <tr class="grand-total">
              <td>Total</td>
              <td class="num">${money(fundMovementTotal.inflow)}</td>
              <td class="num">${money(fundMovementTotal.outflow)}</td>
              <td class="num">${money(fundMovementTotal.inflow - fundMovementTotal.outflow)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>`
  }

  const plans = data.contributionByFrequency
  if (plans.length > 0) {
    html += `
    <section class="section">
      <div class="section-head">
        <h2>Contribution plans</h2>
        <p>Performance by payment frequency</p>
      </div>
      <div class="section-body">
        <table>
          <thead>
            <tr>
              <th>Frequency</th>
              <th class="num">Expected</th>
              <th class="num">Collected</th>
              <th class="num">Outstanding</th>
              <th class="num">Total</th>
              <th class="num">Approved</th>
              <th class="num">Pending</th>
              <th class="num">Overdue</th>
              <th class="num">Rejected</th>
            </tr>
          </thead>
          <tbody>
            ${plans
              .map(
                (plan) => `<tr>
                  <td>${escapeHtml(plan.frequency.toLowerCase().replaceAll('_', ' '))}</td>
                  <td class="num">${money(plan.expected)}</td>
                  <td class="num">${money(plan.paid)}</td>
                  <td class="num">${money(plan.outstanding)}</td>
                  <td class="num">${plan.total.toLocaleString()}</td>
                  <td class="num">${plan.approved.toLocaleString()}</td>
                  <td class="num">${plan.pending.toLocaleString()}</td>
                  <td class="num">${plan.overdue.toLocaleString()}</td>
                  <td class="num">${plan.rejected.toLocaleString()}</td>
                </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>`
  }

  html += `
    <div class="statuses">
      <div class="status-card">
        <h3>Members</h3>
        ${statusDots(data.memberStatuses, 'No member status data.')}
      </div>
      <div class="status-card">
        <h3>Assistance requests</h3>
        ${statusDots(data.assistanceStatuses, 'No assistance requests.')}
      </div>
      <div class="status-card">
        <h3>Overdue brackets</h3>
        ${statusDots(data.overdueBuckets, 'No overdue contributions.')}
      </div>
    </div>

    <div class="footer">
      Generated by ${APP_NAME} · ${formatDate(now)} · Data as shown on the admin dashboard.
    </div>
  </div>
  <script>
    function downloadReport() {
      var html = '<!DOCTYPE html>' + document.documentElement.outerHTML;
      var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '${APP_NAME.toLowerCase().replaceAll(' ', '-')}-report-${now.toISOString().slice(0, 10)}.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  </script>
</body>
</html>`

  return html
}

/**
 * Open a styled, print-ready HTML report of the admin dashboard in a new tab.
 * Falls back to a direct HTML file download if the pop-up is blocked.
 */
export function exportAdminReport(data: AdminDashboardData, options: AdminReportOptions = {}) {
  const html = buildAdminReport(data, options)
  const stamp = new Date().toISOString().slice(0, 10)
  const fileName = `${APP_NAME.toLowerCase().replaceAll(' ', '-')}-report-${stamp}.html`

  const reportWindow = window.open('', '_blank', 'width=1100,height=850')
  if (reportWindow) {
    reportWindow.document.open()
    reportWindow.document.write(html)
    reportWindow.document.close()
    reportWindow.focus()
    return fileName
  }

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  return fileName
}
