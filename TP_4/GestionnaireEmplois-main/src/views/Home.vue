<template>
  <div class="gestion-container">
    <!-- En-tête -->
    <div class="header">
      <h1>Gestion des emplois</h1>
      <button @click="showAddForm = true" class="btn-primary">
        Ajouter un emploi
      </button>
    </div>

    <div class="main-grid">
      <!-- Liste des emplois -->
      <div class="liste-section card">
        <h2>Liste des emplois</h2>
        <div class="emplois-liste">
          <div
            v-for="job in jobs"
            :key="job.id"
            @click="selectJob(job)"
            :class="['emploi-item', { active: selectedJob?.id === job.id }]"
          >
            <h3>{{ job.titre }}</h3>
            <p>{{ job.lieu }}</p>
            <p class="date">Créée: {{ formatShortDate(job.dateCreation) }}</p>
          </div>

          <p v-if="jobs.length === 0" class="empty">Aucun emploi disponible</p>
        </div>
      </div>

      <!-- Détails et formulaire -->
      <div class="details-section">
        <!-- Détails -->
        <div
          v-if="selectedJob && !showAddForm && !editingJob"
          class="card details-card"
        >
          <h2>{{ selectedJob.titre }}</h2>
          <p><strong>Lieu:</strong> {{ selectedJob.lieu }}</p>
          <p><strong>Salaire:</strong> {{ selectedJob.salaire }} €/an</p>
          <p>
            <strong>Date de création:</strong>
            {{ formatLongDate(selectedJob.dateCreation) }}
          </p>

          <div class="actions">
            <button @click="editJob(selectedJob)" class="btn-primary">
              Modifier
            </button>
            <button @click="confirmDelete(selectedJob)" class="btn-danger">
              Supprimer
            </button>
          </div>
        </div>

        <!-- Formulaire -->
        <div v-if="showAddForm || editingJob" class="card form-card">
          <h2>Formulaire d’ajout / édition d’emploi</h2>
          <form @submit.prevent="handleSubmit">
            <label>Titre</label>
            <input type="text" v-model="formData.titre" required />

            <label>Lieu</label>
            <input type="text" v-model="formData.lieu" required />

            <label>Salaire (€/an)</label>
            <input type="number" v-model.number="formData.salaire" required />

            <label>Description</label>
            <textarea
              v-model="formData.description"
              rows="3"
              required
            ></textarea>

            <label>Date de création</label>
            <input type="date" v-model="formData.dateCreation" required />

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="cancelForm">
                Annuler
              </button>
              <button type="submit" class="btn-primary">Envoyer</button>
            </div>
          </form>
        </div>

        <!-- État vide -->
        <div
          v-if="!selectedJob && !showAddForm && !editingJob"
          class="card empty-state"
        >
          <p>Sélectionnez un emploi dans la liste ou ajoutez-en un nouveau</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";

const apiUrl = "http://localhost:3000/jobs";
const jobs = ref([]);
const selectedJob = ref(null);
const showAddForm = ref(false);
const editingJob = ref(null);

const formData = reactive({
  titre: "",
  lieu: "",
  salaire: "",
  description: "",
  dateCreation: new Date().toISOString().split("T")[0],
});

const loadJobs = async () => {
  const res = await fetch(apiUrl);
  jobs.value = await res.json();
  if (jobs.value.length > 0) selectedJob.value = jobs.value[0];
};

onMounted(loadJobs);

const selectJob = (job) => {
  selectedJob.value = job;
  showAddForm.value = false;
  editingJob.value = null;
};

const editJob = (job) => {
  editingJob.value = job;
  Object.assign(formData, job);
  showAddForm.value = false;
};

const confirmDelete = async (job) => {
  if (confirm(`Voulez-vous vraiment supprimer "${job.titre}" ?`)) {
    await fetch(`${apiUrl}/${job.id}`, { method: "DELETE" });
    await loadJobs();
    selectedJob.value = jobs.value.length ? jobs.value[0] : null;
  }
};

const handleSubmit = async () => {
  const method = editingJob.value ? "PUT" : "POST";
  const url = editingJob.value ? `${apiUrl}/${editingJob.value.id}` : apiUrl;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  await loadJobs();
  resetForm();
};

const resetForm = () => {
  Object.assign(formData, {
    titre: "",
    lieu: "",
    salaire: "",
    description: "",
    dateCreation: new Date().toISOString().split("T")[0],
  });
  showAddForm.value = false;
  editingJob.value = null;
};

const cancelForm = () => resetForm();

const formatShortDate = (date) =>
  new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatLongDate = formatShortDate;
</script>

<style scoped>
body {
  background: #f6f8fb;
}

.gestion-container {
  max-width: 1300px;
  margin: 2rem auto;
  padding: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2.2rem;
  color: #222;
}

.main-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

.emplois-liste {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.emploi-item {
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.emploi-item:hover {
  background: #f1f6ff;
  border-color: #4a90e2;
}

.emploi-item.active {
  background: #e3f0ff;
  border-color: #4a90e2;
}

.date {
  color: #777;
  font-size: 0.9rem;
}

.actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.8rem;
}

button {
  cursor: pointer;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  transition: 0.3s;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background: #357abd;
}

.btn-secondary {
  background: #ddd;
  color: #333;
}

.btn-secondary:hover {
  background: #ccc;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
}

input,
textarea {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  color: #666;
}
</style>
