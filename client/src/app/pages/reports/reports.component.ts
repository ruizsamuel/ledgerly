import { Component, computed, effect, inject, signal } from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { PageTitleComponent } from "../../shared/common/ui/components/page-title/page-title.component";
import { TransactionService } from "../../shared/domain/services/transaction.service";
import { LineChartComponent } from "../../shared/common/ui/components/line-chart/line-chart.component";
import { LoadingComponent } from "../../shared/common/ui/components/loading/loading.component";
import { TransactionHelper } from "../../shared/domain/ui/helpers/transaction.helper";
import { AccountService } from "../../shared/domain/services/account.service";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  imports: [PageTitleComponent, LineChartComponent, LoadingComponent],
})
export class ReportsComponent {

  readonly MAX_SERIES_LENGTH = 3;

  pageTitle = $localize`:{@@reportsPageTitle}:Reports`;
  pageDescription = $localize`:{@@reportsPageDescription}:Download in CSV and generate reports of your financial data for better insights and analysis.`;

  accountService = inject(AccountService);
  transactionService = inject(TransactionService);
  transactionHelper = TransactionHelper;

  transactionResource = rxResource({
    params: () => ({ limit: 0 }),
    stream: ( request ) => {
      return this.transactionService.getEntitiesByToken(request.params);
    }
  });

  accountResource = rxResource({
    params: () => ({ limit: 0 }),
    stream: ( request ) => {
      return this.accountService.getEntitiesByToken(request.params);
    }
  });

  series = signal<number[]>([new Date().getFullYear()]);

  availableSeries = computed(() => {
    const years: number[] = [];
    this.transactionResource.value()?.content.forEach(transaction => {
      const year = new Date(transaction.date).getFullYear();
      if (!years.includes(year) && !this.series().includes(year)) {
        years.push(year);
      }
    });
    return years.sort((a, b) => b - a);
  });

  chartReload = signal(true);

  constructor() {
    effect((onCleanUp) => {
      const chartReload = this.chartReload();
      if (!chartReload) {
        const timeout = setTimeout(() => {
          this.chartReload.set(true);
        }, 0);

        onCleanUp(() => {
          clearTimeout(timeout);
        });
      }
    });
  }

  toggleSerie(serie: number) {
    if (this.series().length === this.MAX_SERIES_LENGTH && !this.series().includes(serie)) return;
    const currentSeries = this.series();
    if (currentSeries.includes(serie)) {
      this.series.set(currentSeries.filter(s => s !== serie));
    } else {
      this.series.set([...currentSeries, serie]);
    }
    this.chartReload.set(false);
  }

  downloadCSV(year: number) {
    const transactions = this.transactionResource.value()?.content
      .filter(tx => new Date(tx.date).getFullYear() === year);

    if (!transactions) return;

    const accounts = this.accountResource.value()?.content

    if (!accounts) return;

    const transactionCSV = this.toCSV(transactions, ['id', 'date', 'amount', 'description']);

    this.downloadFile(transactionCSV, `transactions_${year}.csv`);
  }

  toCSV(data: any[], columns: string[]): string {
    const header = columns.join(',');
    const rows = data.map(row =>
      columns.map(col => `"${(row[col] ?? '').toString().replace(/"/g, '""')}"`).join(',')
    );
    return [header, ...rows].join('\r\n');
  }

  downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
