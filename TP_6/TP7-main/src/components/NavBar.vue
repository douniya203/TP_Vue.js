<template>
  <header class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-indigo-600">ENSA Safi</h1>
          <p class="text-sm text-gray-600">{{ user.email }}</p>
        </div>
        <button
          @click="$emit('logout')"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          Déconnexion
        </button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  emits: ['logout']
}
</script>