<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-indigo-600 mb-2">ENSA SAFI</h1>
        <p class="text-gray-600">Système de vote pour événements</p>
      </div>

      <div class="flex gap-2 mb-6">
        <button
          @click="authMode = 'login'"
          :class="[
            'flex-1 py-2 rounded-lg font-medium transition-colors',
            authMode === 'login' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          Connexion
        </button>
        <button
          @click="authMode = 'signup'"
          :class="[
            'flex-1 py-2 rounded-lg font-medium transition-colors',
            authMode === 'signup' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          Inscription
        </button>
      </div>

      <div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2 font-medium">Email universitaire</label>
          <input
            type="email"
            v-model="email"
            @keyup.enter="handleSubmit"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="votre.nom@uca.ac.ma"
          />
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 mb-2 font-medium">Mot de passe</label>
          <input
            type="password"
            v-model="password"
            @keyup.enter="handleSubmit"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {{ error }}
        </div>

        <button
          @click="handleSubmit"
          :disabled="loading"
          class="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Chargement...' : (authMode === 'login' ? 'Se connecter' : "S'inscrire") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { auth } from '@/firebase/config'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

export default {
  name: 'LoginView',
  setup() {
    const authMode = ref('login')
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    const validateEmail = () => {
      if (!email.value.endsWith('@uca.ac.ma')) {
        error.value = 'Veuillez utiliser votre adresse e-mail universitaire ENSA Safi'
        return false
      }
      return true
    }

    const handleSignUp = async () => {
      error.value = ''
      
      if (!validateEmail()) return

      loading.value = true
      try {
        await createUserWithEmailAndPassword(auth, email.value, password.value)
        email.value = ''
        password.value = ''
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          error.value = 'Cet email est déjà utilisé'
        } else if (err.code === 'auth/weak-password') {
          error.value = 'Le mot de passe doit contenir au moins 6 caractères'
        } else {
          error.value = err.message
        }
      } finally {
        loading.value = false
      }
    }

    const handleLogin = async () => {
      error.value = ''
      loading.value = true
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value)
        email.value = ''
        password.value = ''
      } catch (err) {
        error.value = 'Email ou mot de passe incorrect'
      } finally {
        loading.value = false
      }
    }

    const handleSubmit = () => {
      if (authMode.value === 'login') {
        handleLogin()
      } else {
        handleSignUp()
      }
    }

    return {
      authMode,
      email,
      password,
      error,
      loading,
      handleSubmit
    }
  }
}
</script>