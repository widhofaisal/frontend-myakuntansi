<template>
  <div class="chart-wrapper">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController
)

export default {
  name: 'UploadActivityChart',
  props: {
    period: {
      type: String,
      default: '7'
    }
  },
  setup(props) {
    const chartCanvas = ref(null)
    let chartInstance = null

    const generateMockData = (days) => {
      const labels = []
      const uploads = []
      const downloads = []
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        labels.push(date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }))
        
        // Generate random data for demo
        uploads.push(Math.floor(Math.random() * 20) + 5)
        downloads.push(Math.floor(Math.random() * 15) + 3)
      }
      
      return { labels, uploads, downloads }
    }

    const createChart = () => {
      if (!chartCanvas.value) return

      const ctx = chartCanvas.value.getContext('2d')
      
      // Destroy existing chart
      if (chartInstance) {
        chartInstance.destroy()
      }

      const days = parseInt(props.period)
      const mockData = generateMockData(days)

      const chartData = {
        labels: mockData.labels,
        datasets: [
          {
            label: 'Uploads',
            data: mockData.uploads,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Downloads',
            data: mockData.downloads,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      }

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#374151',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: function(context) {
                return `Date: ${context[0].label}`
              },
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y} files`
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              },
              maxRotation: 45
            }
          },
          y: {
            display: true,
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              stepSize: 1,
              font: {
                size: 11
              },
              callback: function(value) {
                return value + ' files'
              }
            }
          }
        },
        elements: {
          line: {
            borderWidth: 3
          }
        }
      }

      chartInstance = new ChartJS(ctx, {
        type: 'line',
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

    watch(() => props.period, () => {
      createChart()
    })

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
