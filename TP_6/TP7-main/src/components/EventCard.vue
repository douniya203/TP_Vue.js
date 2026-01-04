<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
    <img
      v-if="event.img"
      :src="event.img"
      :alt="event.title"
      class="w-full h-48 object-cover"
    />
    
    <div class="p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-2">{{ event.title }}</h3>
      <p class="text-gray-600 mb-4 text-sm">{{ event.description }}</p>

      <div class="space-y-2 mb-4">
        <div class="flex items-center text-gray-700 text-sm">
          <svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {{ formatDate(event.date) }}
        </div>
        
        <div class="flex items-center text-gray-700 text-sm">
          <svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          {{ event.isFree ? 'Gratuit' : `${event.price} DH` }}
        </div>

        <div class="flex items-center text-gray-700 text-sm">
          <svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          {{ totalVotes }} vote{{ totalVotes !== 1 ? 's' : '' }}
        </div>
      </div>

      <div class="mb-4">
        <div class="flex justify-between text-sm mb-1">
          <span class="text-green-600 font-medium">Oui: {{ event.yesVotes || 0 }}</span>
          <span class="text-red-600 font-medium">Non: {{ event.noVotes || 0 }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-green-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: yesPercentage + '%' }"
          ></div>
        </div>
      </div>

      <div v-if="userVote" class="flex items-center justify-center gap-2 p-3 bg-indigo-50 rounded-lg">
        <svg v-if="userVote === 'yes'" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <svg v-else class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span :class="userVote === 'yes' ? 'text-green-700' : 'text-red-700'" class="font-medium">
          Vous avez voté {{ userVote === 'yes' ? 'Oui' : 'Non' }}
        </span>
      </div>
      <div v-else class="flex gap-3">
        <button
          @click="$emit('vote', { eventId: event.id, voteType: 'yes' })"
          class="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Oui
        </button>
        <button
          @click="$emit('vote', { eventId: event.id, voteType: 'no' })"
          class="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Non
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'EventCard',
  props: {
    event: {
      type: Object,
      required: true
    },
    userVote: {
      type: String,
      default: null
    }
  },
  emits: ['vote'],
  setup(props) {
    const totalVotes = computed(() => {
      return (props.event.yesVotes || 0) + (props.event.noVotes || 0)
    })

    const yesPercentage = computed(() => {
      if (totalVotes.value === 0) return 0
      return ((props.event.yesVotes || 0) / totalVotes.value * 100).toFixed(1)
    })

    const formatDate = (date) => {
      if (!date) return ''
      
      // Si c'est un Timestamp Firestore
      const dateObj = date.toDate ? date.toDate() : new Date(date)
      
      return dateObj.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      totalVotes,
      yesPercentage,
      formatDate
    }
  }
}
</script>