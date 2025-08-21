<template>
  <div class="chart-wrapper">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  DoughnutController,
  BarController
} from 'chart.js'

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  DoughnutController,
  BarController
)

export default {
  name: 'FileExtensionChart',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: 'doughnut'
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    let chartInstance = null

    const colors = [
      '#3b82f6', // Blue
      '#ef4444', // Red
      '#10b981', // Green
      '#f59e0b', // Yellow
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#f97316', // Orange
      '#84cc16', // Lime
      '#ec4899', // Pink
      '#6b7280'  // Gray
    ]

    const createChart = () => {
      if (!chartCanvas.value) return

      const ctx = chartCanvas.value.getContext('2d')
      
      // Destroy existing chart
      if (chartInstance) {
        chartInstance.destroy()
      }

      const labels = Object.keys(props.data)
      const values = Object.values(props.data)

      const chartData = {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color + '80'),
          borderWidth: 2,
          hoverOffset: 4
        }]
      }

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || ''
                const value = context.parsed
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: ${value} files (${percentage}%)`
              }
            }
          }
        }
      }

      // Add specific options for bar chart
      if (props.type === 'bar') {
        options.scales = {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
        options.plugins.legend.display = false
      }

      chartInstance = new ChartJS(ctx, {
        type: props.type,
        data: chartData,
        options
      })
    }

    onMounted(() => {
      createChart()
    })

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.destroy()
      }
    })

    watch([() => props.data, () => props.type], () => {
      createChart()
    }, { deep: true })

    return {
      chartCanvas
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  height: 300px;
  width: 100%;
}

canvas {
  max-height: 100%;
}
</style>
