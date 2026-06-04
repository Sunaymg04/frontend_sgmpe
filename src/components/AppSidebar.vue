<template>
  <v-navigation-drawer
    v-model="drawer"
    class="modern-sidebar"
    elevation="0"
    permanent
    width="292"
  >
    <div class="sidebar-head">
      <div class="sidebar-mark">
        <v-icon>mdi-school-outline</v-icon>
      </div>
      <div>
        <div class="sidebar-title">SGMPE</div>
        <div class="sidebar-subtitle">Menú principal</div>
      </div>
    </div>

    <v-list nav density="comfortable">
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        class="modern-item"
        to="/"
      />

      <v-list-item
        prepend-icon="mdi-shape-outline"
        title="Estructura Curricular"
        class="modern-item"
        to="/estructura_curricular"
      />

      <v-list-item
        prepend-icon="mdi-file-document-edit-outline"
        title="Plan de estudio"
        class="modern-item"
        to="/plan_estudio"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "AppSidebar",

  props: {
    modelValue: Boolean,
  },

  emits: ["update:modelValue"],

  computed: {
    drawer: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>
<style scoped>
.modern-sidebar {
  border-right: 1px solid #e2e8f0;
  background: #ffffff !important;
  color: #1e293b;
  box-shadow: 4px 0 20px rgba(15, 23, 42, 0.06);
}
.sidebar-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 18px 12px;
}
.sidebar-mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
}
.sidebar-title {
  font-weight: 800;
  color: #0f172a;
}
.sidebar-subtitle {
  color: #64748b;
  font-size: 12px;
}
.modern-item {
  border-radius: 10px;
  margin: 4px 10px;
  color: #1e293b;
  transition: all 0.15s ease;
}
.modern-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}
.modern-item.v-list-item--active {
  background: #e0edff;
  font-weight: 600;
  color: #2563eb;
}
.v-list {
  padding-top: 10px;
}
</style>
