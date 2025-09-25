import { Component, input, OnInit, signal } from '@angular/core';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexStroke, ApexXAxis, ApexFill, ApexYAxis, ApexGrid, ChartComponent, ApexTheme } from 'ng-apexcharts';
import { LineChartSeries } from '../../types/chart-config.model';

type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  xaxis: ApexXAxis;
  fill: ApexFill;
  yaxis?: ApexYAxis;
  grid?: ApexGrid;
  colors?: string[];
  theme?: ApexTheme;
};

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  imports: [ChartComponent],
})
export class LineChartComponent implements OnInit {
  series = input.required<LineChartSeries>();
  categories = input.required<string[]>();

  chartOptions = signal<Partial<LineChartOptions>>({});

  ngOnInit() {
    const colors = this.getCssColors([
      '--color-primary',
      '--color-secondary',
      '--color-accent'
    ]);

    const darkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.chartOptions.set({
      series: this.series(),
      chart: {
        type: 'area',
        height: 350,
        background: 'transparent',
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      xaxis: {
        categories: this.categories()
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100],
          colorStops: this.getCssColors([
            '--color-primary',
            '--color-secondary',
            '--color-accent'
          ]).map(color => [
            { offset: 0, color, opacity: 0.4 },
            { offset: 100, color, opacity: 0.05 }
          ])
        }
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          opacity: 0.5
        }
      },
      colors,
      theme: { mode: darkScheme ? 'dark' : 'light' }
    });
  }

  private getCssColors(vars: string[]): string[] {
    const styles = getComputedStyle(document.documentElement);
    return vars.map(v => styles.getPropertyValue(v).trim());
  }
}
