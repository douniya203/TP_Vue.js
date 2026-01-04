<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <NavBar :user="user" @logout="$emit('logout')" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 class="text-3xl font-bold text-gray-800 mb-8">Événements à venir</h2>

      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        {{ error }}
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="text-gray-500 text-lg mt-4">Chargement des événements...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EventCard
          v-for="event in events"
          :key="event.id"
          :event="event"
          :user-vote="userVotes[event.id]"
          @vote="handleVote"
        />
      </div>

      <div v-if="!loading && events.length === 0" class="text-center py-12">
        <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <p class="text-gray-500 text-lg mt-4">Aucun événement disponible pour le moment</p>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase/config'
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import NavBar from '@/components/NavBar.vue'
import EventCard from '@/components/EventCard.vue'

export default {
  name: 'HomeView',
  components: {
    NavBar,
    EventCard
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  emits: ['logout'],
  setup(props) {
    const events = ref([])
    const userVotes = ref({})
    const error = ref('')
    const loading = ref(true)

    const loadEvents = () => {
      const q = query(collection(db, 'events'))
      onSnapshot(q, (snapshot) => {
        events.value = []
        snapshot.forEach((docSnap) => {
          events.value.push({ id: docSnap.id, ...docSnap.data() })
        })
        events.value.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date)
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date)
          return dateA - dateB
        })
        loading.value = false
      }, (err) => {
        console.error('Erreur:', err)
        error.value = 'Erreur lors du chargement des événements'
        loading.value = false
      })
    }

    const loadUserVotes = async (userId) => {
      try {
        const q = query(collection(db, 'votes'), where('userId', '==', userId))
        const snapshot = await getDocs(q)
        
        userVotes.value = {}
        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          userVotes.value[data.eventId] = data.vote
        })
      } catch (err) {
        console.error('Erreur lors du chargement des votes:', err)
      }
    }

    const handleVote = async ({ eventId, voteType }) => {
      if (!props.user) return

      try {
        // Vérifier si l'utilisateur a déjà voté
        const q = query(
          collection(db, 'votes'),
          where('userId', '==', props.user.uid),
          where('eventId', '==', eventId)
        )
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          error.value = 'Vous avez déjà voté pour cet événement'
          setTimeout(() => { error.value = '' }, 3000)
          return
        }

        // Ajouter le vote
        await addDoc(collection(db, 'votes'), {
          eventId,
          userId: props.user.uid,
          vote: voteType,
          createdAt: serverTimestamp()
        })

        // Mettre à jour les compteurs de l'événement
        const event = events.value.find(e => e.id === eventId)
        const eventRef = doc(db, 'events', eventId)
        
        const updateData = {
          updatedAt: serverTimestamp()
        }

        if (voteType === 'yes') {
          updateData.yesVotes = (event.yesVotes || 0) + 1
        } else {
          updateData.noVotes = (event.noVotes || 0) + 1
        }

        await updateDoc(eventRef, updateData)
        
        // Mettre à jour localement
        userVotes.value[eventId] = voteType
      } catch (err) {
        console.error('Erreur lors du vote:', err)
        error.value = 'Erreur lors du vote: ' + err.message
        setTimeout(() => { error.value = '' }, 3000)
      }
    }

    onMounted(() => {
      loadEvents()
      loadUserVotes(props.user.uid)
    })

    return {
      events,
      userVotes,
      error,
      loading,
      handleVote
    }
  }
}
</script>