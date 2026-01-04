<template>
  <div id="app">
    <LoginView v-if="!user" />
    <HomeView v-else :user="user" @logout="handleLogout" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { auth } from '@/firebase/config'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'

export default {
  name: 'App',
  components: {
    LoginView,
    HomeView
  },
  setup() {
    const user = ref(null)

    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser
      })
    })

    const handleLogout = async () => {
      try {
        await signOut(auth)
        user.value = null
      } catch (error) {
        console.error('Erreur de déconnexion:', error)
      }
    }

    return {
      user,
      handleLogout
    }
  }
}
</script>