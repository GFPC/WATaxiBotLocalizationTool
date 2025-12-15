<template>
  <div class="min-h-screen w-full bg-zinc-950 text-zinc-100">
    <!-- Fixed Navigation -->
    <nav class="fixed top-0 left-0 right-0 h-16 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800 z-50">
      <div class="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-semibold tracking-tight text-zinc-100">NEXUS</h1>
            <p class="text-xs text-zinc-500">Analytics Platform</p>
          </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button
              @click="toggleTheme"
              class="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors flex items-center justify-center group"
          >
            <svg v-if="isDarkMode" class="w-5 h-5 text-zinc-300 group-hover:text-zinc-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5 text-zinc-300 group-hover:text-zinc-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Notifications -->
          <button class="relative w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors flex items-center justify-center">
            <svg class="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <!-- User Profile -->
          <div class="flex items-center space-x-3 pl-4 border-l border-zinc-800">
            <div class="text-right hidden md:block">
              <p class="text-sm font-medium text-zinc-100">Administrator</p>
              <p class="text-xs text-zinc-500">admin@nexus.com</p>
            </div>
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 font-medium">
              AD
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="pt-16">
      <div class="container mx-auto px-4 md:px-6 py-6">
        <!-- Page Header -->
        <div class="mb-8">
          <h2 class="text-2xl font-semibold text-zinc-100 mb-2">Dashboard Overview</h2>
          <p class="text-zinc-500">Real-time metrics and analytics</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
              v-for="stat in stats"
              :key="stat.id"
              class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors group cursor-pointer"
          >
            <div class="flex items-start justify-between mb-4">
              <div>
                <p class="text-sm font-medium text-zinc-400 mb-1">{{ stat.label }}</p>
                <p class="text-2xl font-semibold text-zinc-100">{{ stat.value }}</p>
              </div>
              <div class="p-2.5 rounded-lg bg-zinc-800/50 group-hover:bg-zinc-800 transition-colors">
                <component :is="stat.icon" class="w-5 h-5 text-zinc-300" />
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium px-2 py-1 rounded" :class="stat.trendClass">
                {{ stat.change }}
              </span>
              <span class="text-xs text-zinc-500">vs last month</span>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <!-- Revenue Chart -->
          <div class="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-lg font-semibold text-zinc-100 mb-1">Revenue Analytics</h3>
                <p class="text-sm text-zinc-500">Last 30 days performance</p>
              </div>
              <div class="flex space-x-2">
                <button
                    v-for="period in timePeriods"
                    :key="period"
                    @click="selectedPeriod = period"
                    class="px-3 py-1.5 text-sm rounded-lg transition-colors"
                    :class="selectedPeriod === period
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'"
                >
                  {{ period }}
                </button>
              </div>
            </div>

            <!-- Chart Placeholder -->
            <div class="relative h-64">
              <div class="absolute inset-0 flex items-end space-x-1 pb-4">
                <div
                    v-for="(bar, index) in chartData"
                    :key="index"
                    class="flex-1 flex flex-col items-center"
                >
                  <div
                      class="w-3/4 bg-gradient-to-t from-zinc-700 to-zinc-600 rounded-t hover:from-zinc-600 hover:to-zinc-500 transition-all duration-300 cursor-pointer group"
                      :style="{ height: `${bar.value}%` }"
                      @mouseenter="hoveredBar = index"
                      @mouseleave="hoveredBar = null"
                  >
                    <div
                        v-if="hoveredBar === index"
                        class="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs rounded whitespace-nowrap"
                    >
                      ${{ bar.amount }}
                    </div>
                  </div>
                  <span class="text-xs text-zinc-500 mt-2">{{ bar.day }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Countries -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-zinc-100 mb-6">Top Markets</h3>
            <div class="space-y-4">
              <div
                  v-for="country in topCountries"
                  :key="country.code"
                  class="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/30 transition-colors"
              >
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                    <span class="text-sm">{{ country.flag }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-zinc-100">{{ country.name }}</p>
                    <p class="text-xs text-zinc-500">{{ country.value.toLocaleString() }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <div class="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        class="h-full bg-gradient-to-r from-zinc-600 to-zinc-500 rounded-full"
                        :style="{ width: `${country.growth}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium" :class="country.growth > 0 ? 'text-emerald-400' : 'text-red-400'">
                    {{ country.growth > 0 ? '+' : '' }}{{ country.growth }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden mb-8">
          <div class="px-6 py-4 border-b border-zinc-800 bg-zinc-900/30">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-zinc-100">Recent Activity</h3>
                <p class="text-sm text-zinc-500">Latest transactions and events</p>
              </div>
              <button class="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors text-zinc-300">
                View All
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
              <tr class="border-b border-zinc-800">
                <th class="text-left py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Transaction</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Client</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                <th class="text-left py-4 px-6 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Amount</th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="transaction in transactions"
                  :key="transaction.id"
                  class="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
              >
                <td class="py-4 px-6">
                  <span class="font-mono text-sm font-medium text-zinc-100">{{ transaction.id }}</span>
                </td>
                <td class="py-4 px-6">
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center">
                      <span class="text-xs font-medium text-zinc-300">{{ transaction.initials }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-zinc-100">{{ transaction.client }}</p>
                      <p class="text-xs text-zinc-500">{{ transaction.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-sm text-zinc-400">{{ transaction.date }}</td>
                <td class="py-4 px-6">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="statusClasses[transaction.status]">
                      {{ transaction.status }}
                    </span>
                </td>
                <td class="py-4 px-6">
                  <span class="text-sm font-semibold text-zinc-100">{{ transaction.amount }}</span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <div class="px-6 py-4 border-t border-zinc-800 bg-zinc-900/30">
            <div class="flex items-center justify-center space-x-2">
              <button class="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors text-zinc-400 hover:text-zinc-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button v-for="page in [1, 2, 3, 4]" :key="page" class="px-3 py-1.5 rounded-lg transition-colors" :class="page === 1 ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'">
                {{ page }}
              </button>
              <span class="px-2 text-zinc-600">...</span>
              <button class="px-3 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors">
                10
              </button>
              <button class="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors text-zinc-400 hover:text-zinc-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- System Status -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-zinc-100 mb-6">System Status</h3>
            <div class="space-y-5">
              <div v-for="status in systemStatus" :key="status.id">
                <div class="flex justify-between text-sm mb-2">
                  <span class="text-zinc-400">{{ status.label }}</span>
                  <span class="font-medium text-zinc-100">{{ status.value }}%</span>
                </div>
                <div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                      class="h-full rounded-full transition-all duration-700"
                      :style="{
                      width: `${status.value}%`,
                      background: status.color
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Users -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-zinc-100 mb-6">Active Users</h3>
            <div class="space-y-4">
              <div v-for="user in activeUsers" :key="user.id" class="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/30 transition-colors">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <span class="text-sm font-medium text-zinc-300">{{ user.initials }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-zinc-100">{{ user.name }}</p>
                    <p class="text-xs text-zinc-500">{{ user.role }}</p>
                  </div>
                </div>
                <span class="text-xs px-2 py-1 rounded" :class="user.statusClass">
                  {{ user.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-zinc-100 mb-6">Quick Actions</h3>
            <div class="grid grid-cols-2 gap-3">
              <button
                  v-for="action in quickActions"
                  :key="action.id"
                  class="p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-colors flex flex-col items-center space-y-2 group"
              >
                <component :is="action.icon" class="w-5 h-5 text-zinc-400 group-hover:text-zinc-300" />
                <span class="text-xs font-medium text-zinc-300">{{ action.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-zinc-800 mt-8">
      <div class="container mx-auto px-4 md:px-6 py-4">
        <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
          <p class="text-sm text-zinc-500">
            © 2024 Nexus Analytics. All rights reserved.
          </p>
          <div class="flex items-center space-x-6">
            <span class="text-sm text-zinc-500">
              Last updated: {{ lastUpdated }}
            </span>
            <div class="flex items-center space-x-4">
              <button class="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Privacy</button>
              <button class="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Terms</button>
              <button class="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Support</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  CurrencyDollarIcon,
  UserGroupIcon as UsersIcon,
  ChartBarIcon as TrendingUpIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon as CogIcon,
  PlusCircleIcon,
  CloudIcon,
  ServerIcon
} from '@heroicons/vue/24/outline'

// State
const isDarkMode = ref(true)
const selectedPeriod = ref('1M')
const hoveredBar = ref(null)
const lastUpdated = ref('')

// Data
const stats = ref([
  {
    id: 1,
    label: 'Total Revenue',
    value: '$284,580',
    change: '+12.5%',
    trendClass: 'bg-emerald-500/10 text-emerald-400',
    icon: CurrencyDollarIcon
  },
  {
    id: 2,
    label: 'Active Users',
    value: '18,246',
    change: '+8.2%',
    trendClass: 'bg-emerald-500/10 text-emerald-400',
    icon: UsersIcon
  },
  {
    id: 3,
    label: 'Conversion Rate',
    value: '4.76%',
    change: '-1.3%',
    trendClass: 'bg-red-500/10 text-red-400',
    icon: TrendingUpIcon
  },
  {
    id: 4,
    label: 'Avg. Session',
    value: '4m 32s',
    change: '+2.4%',
    trendClass: 'bg-emerald-500/10 text-emerald-400',
    icon: ClockIcon
  }
])

const timePeriods = ref(['1D', '1W', '1M', '3M', '1Y'])

const chartData = ref([
  { day: 'Mon', value: 85, amount: '12,450' },
  { day: 'Tue', value: 65, amount: '9,850' },
  { day: 'Wed', value: 45, amount: '7,120' },
  { day: 'Thu', value: 75, amount: '11,300' },
  { day: 'Fri', value: 95, amount: '15,670' },
  { day: 'Sat', value: 60, amount: '8,950' },
  { day: 'Sun', value: 40, amount: '6,210' }
])

const topCountries = ref([
  { code: 'US', name: 'United States', flag: '🇺🇸', value: 125430, growth: 12.5 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', value: 89210, growth: 8.2 },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', value: 74560, growth: 5.7 },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', value: 68230, growth: -1.3 },
  { code: 'FR', name: 'France', flag: '🇫🇷', value: 55480, growth: 3.4 }
])

const transactions = ref([
  {
    id: 'TX-7892',
    client: 'John Anderson',
    initials: 'JA',
    email: 'j.anderson@email.com',
    date: '2024-02-15',
    status: 'Completed',
    amount: '$2,850'
  },
  {
    id: 'TX-7891',
    client: 'Sarah Chen',
    initials: 'SC',
    email: 's.chen@email.com',
    date: '2024-02-14',
    status: 'Pending',
    amount: '$1,240'
  },
  {
    id: 'TX-7890',
    client: 'Marcus Johnson',
    initials: 'MJ',
    email: 'm.johnson@email.com',
    date: '2024-02-14',
    status: 'Completed',
    amount: '$5,670'
  },
  {
    id: 'TX-7889',
    client: 'TechCorp Ltd',
    initials: 'TC',
    email: 'billing@techcorp.com',
    date: '2024-02-13',
    status: 'Failed',
    amount: '$12,450'
  },
  {
    id: 'TX-7888',
    client: 'Emma Wilson',
    initials: 'EW',
    email: 'e.wilson@email.com',
    date: '2024-02-13',
    status: 'Completed',
    amount: '$3,890'
  }
])

const systemStatus = ref([
  { id: 1, label: 'CPU Usage', value: 78, color: 'linear-gradient(to right, #71717a, #52525b)' },
  { id: 2, label: 'Memory', value: 64, color: 'linear-gradient(to right, #71717a, #52525b)' },
  { id: 3, label: 'Storage', value: 42, color: 'linear-gradient(to right, #71717a, #52525b)' },
  { id: 4, label: 'Network', value: 89, color: 'linear-gradient(to right, #71717a, #52525b)' }
])

const activeUsers = ref([
  { id: 1, name: 'Alex Johnson', initials: 'AJ', role: 'Admin', status: 'Online', statusClass: 'bg-emerald-500/10 text-emerald-400' },
  { id: 2, name: 'Maria Garcia', initials: 'MG', role: 'Manager', status: 'Away', statusClass: 'bg-yellow-500/10 text-yellow-400' },
  { id: 3, name: 'David Kim', initials: 'DK', role: 'Developer', status: 'Online', statusClass: 'bg-emerald-500/10 text-emerald-400' },
  { id: 4, name: 'Lisa Wong', initials: 'LW', role: 'Analyst', status: 'Offline', statusClass: 'bg-zinc-500/10 text-zinc-400' }
])

const quickActions = ref([
  { id: 1, label: 'New Report', icon: DocumentTextIcon },
  { id: 2, label: 'Add Widget', icon: PlusCircleIcon },
  { id: 3, label: 'Settings', icon: CogIcon },
  { id: 4, label: 'Analytics', icon: ChartBarIcon }
])

// Computed
const statusClasses = computed(() => ({
  'Completed': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'Pending': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  'Failed': 'bg-red-500/10 text-red-400 border border-red-500/20'
}))

// Methods
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const updateLastUpdated = () => {
  const now = new Date()
  lastUpdated.value = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  updateLastUpdated()
  // Update time every minute
  setInterval(updateLastUpdated, 60000)
})
</script>

<style scoped>
/* Smooth transitions */
* {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(39, 39, 42, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(82, 82, 91, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(113, 113, 122, 0.7);
}

/* Selection color */
::selection {
  background-color: rgba(82, 82, 91, 0.5);
  color: #f4f4f5;
}
</style>