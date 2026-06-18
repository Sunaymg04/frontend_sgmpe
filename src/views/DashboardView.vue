<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <div>
        <h1>Gestión de Plan de Estudio</h1>
        <p>
          Seleccione una opción para trabajar con la estructura curricular y los
          planes de estudio.
        </p>
      </div>
    </div>

    <div class="option-grid">
      <v-card
        v-for="option in options"
        :key="option.to"
        class="option-card"
        elevation="0"
        @click="$router.push(option.to)"
      >
        <div class="option-icon">
          <v-icon size="30">{{ option.icon }}</v-icon>
        </div>
        <div>
          <div class="option-title">{{ option.title }}</div>
          <div class="option-text">{{ option.text }}</div>
        </div>
        <v-icon class="option-arrow">mdi-chevron-right</v-icon>
      </v-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardView",
  data() {
    return {
      options: [
        {
          title: "Plan de estudio",
          text: "Listar y crear planes de estudio.",
          icon: "mdi-file-document-edit-outline",
          to: "/plan_estudio",
        },
        {
          title: "Planes vigentes",
          text: "Consultar los planes de estudio aprobados y vigentes.",
          icon: "mdi-file-check-outline",
          to: "/planes_vigentes",
        },
        {
          title: "Estructura Curricular",
          text: "Administrar asignaturas, disciplinas y currículos.",
          icon: "mdi-shape-outline",
          to: "/estructura_curricular",
        },
      ],
    };
  },
};
</script>

<style scoped>
.dashboard-page {
  padding: 32px 10px;
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.dashboard-header h1 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 34px;
  letter-spacing: 0;
}

.dashboard-header p {
  max-width: 620px;
  margin: 0;
  color: #64748b;
  font-size: 16px;
  line-height: 1.55;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.option-card {
  position: relative;
  display: grid;
  grid-template-columns: 56px 1fr 28px;
  gap: 16px;
  align-items: center;
  min-height: 126px;
  padding: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 8px !important;
  background: #ffffff !important;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease,
    transform 0.15s ease;
}

.option-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
  transform: translateY(-2px);
}

.option-icon {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
}

.option-title {
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
}

.option-text {
  margin-top: 4px;
  color: #64748b;
  line-height: 1.45;
}

.option-arrow {
  color: #94a3b8;
}
</style>
