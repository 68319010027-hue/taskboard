<script setup>
import { onMounted, ref } from 'vue';

const tasks = ref([]);
const title = ref('');
const loading = ref(false);
const error = ref('');

async function loadTasks() {
  loading.value = true;
  error.value = '';

  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      throw new Error('Failed to load tasks');
    }
    tasks.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function addTask() {
  if (!title.value.trim()) {
    return;
  }

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.value.trim() }),
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    title.value = '';
    await loadTasks();
  } catch (err) {
    error.value = err.message;
  }
}

onMounted(loadTasks);
</script>

<template>
  <main class="page">
    <h1>TaskBoard</h1>

    <form class="form" @submit.prevent="addTask">
      <input v-model="title" placeholder="New task title" />
      <button type="submit">Add</button>
    </form>

    <p v-if="loading">Loading...</p>
    <p v-else-if="error" class="error">{{ error }}</p>

    <ul v-else>
      <li v-for="task in tasks" :key="task.id">
        {{ task.title }}
        <span class="status">{{ task.status }}</span>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.page {
  max-width: 640px;
  margin: 2rem auto;
  font-family: system-ui, sans-serif;
}

.form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

input {
  flex: 1;
  padding: 0.5rem;
}

.error {
  color: #b00020;
}

.status {
  margin-left: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}
</style>
