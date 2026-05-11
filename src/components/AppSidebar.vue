<template>
  <v-navigation-drawer v-model="drawer" class="modern-sidebar" elevation="0">
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
  background: #f8fafc;
  color: white;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
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
