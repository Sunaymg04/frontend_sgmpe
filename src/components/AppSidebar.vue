<template>
  <v-navigation-drawer
    v-model="drawer"
    :class="['modern-sidebar', { collapsed }]"
    elevation="0"
    permanent
    :width="collapsed ? 92 : 292"
  >
    <div class="sidebar-head">
      <div class="sidebar-mark">
        <v-icon size="20">mdi-school-outline</v-icon>
      </div>
      <div v-if="!collapsed">
        <div class="sidebar-title">SGMPE</div>
        <div class="sidebar-subtitle">Menú principal</div>
      </div>
    </div>

    <v-list nav density="comfortable" class="sidebar-list">
      <v-tooltip
        v-for="item in items"
        :key="item.title"
        :disabled="!collapsed"
        location="right"
        open-on-hover
      >
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            :to="item.to"
            :title="collapsed ? '' : item.title"
            :class="['modern-item', { 'modern-item-collapsed': collapsed }]"
          >
            <template #prepend>
              <v-icon :icon="item.icon" />
            </template>
          </v-list-item>
        </template>

        <span>{{ item.title }}</span>
      </v-tooltip>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "AppSidebar",

  props: {
    modelValue: Boolean,
    collapsed: Boolean,
  },

  emits: ["update:modelValue"],

  data() {
    return {
      defaultItems: [
        { title: "Dashboard", icon: "mdi-view-dashboard", to: "/" },
        {
          title: "Estructura Curricular",
          icon: "mdi-shape-outline",
          to: "/estructura_curricular",
        },
        {
          title: "Plan de estudio",
          icon: "mdi-file-document-edit-outline",
          to: "/plan_estudio",
        },
      ],
      deanItems: [
        {
          title: "Revisión Académica",
          icon: "mdi-clipboard-check-outline",
          to: "/decano/solicitudes",
        },
        {
          title: "Historial",
          icon: "mdi-history",
          to: "/decano/historial",
        },
      ],
      viceDeanItems: [
        {
          title: "Revisión Académica",
          icon: "mdi-clipboard-check-outline",
          to: "/vicedecano/solicitudes",
        },
        {
          title: "Historial",
          icon: "mdi-history",
          to: "/vicedecano/historial",
        },
      ],
    };
  },

  computed: {
    items() {
      const role = this.$store.getters.primaryRole;
      if (role === "decano") return this.deanItems;
      if (role === "vicedecano_docente") return this.viceDeanItems;
      return this.defaultItems;
    },
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

.modern-sidebar.collapsed {
  overflow-x: hidden;
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
.sidebar-list {
  padding-top: 10px;
}
.modern-item {
  border-radius: 10px;
  margin: 4px 10px;
  color: #1e293b;
  transition: all 0.15s ease;
}
.modern-item :deep(.v-list-item-title) {
  white-space: nowrap;
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
.modern-sidebar.collapsed .sidebar-head {
  justify-content: center;
  padding-inline: 0;
}

.modern-sidebar.collapsed .sidebar-mark {
  margin-inline: auto;
}

.modern-sidebar.collapsed .sidebar-list :deep(.v-list-item) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 58px;
  width: 58px;
  height: 58px;
  margin: 6px auto;
  padding-inline: 0 !important;
  border-radius: 16px;
  overflow: hidden;
}

.modern-sidebar.collapsed .sidebar-list :deep(.v-list-item__prepend) {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  margin: 0 !important;
  padding: 0 !important;
}

.modern-sidebar.collapsed .sidebar-list :deep(.v-list-item__prepend > .v-icon) {
  margin: 0 !important;
}

.modern-sidebar.collapsed .sidebar-list :deep(.v-list-item__spacer) {
  display: none;
}

.modern-sidebar.collapsed .modern-item:hover {
  transform: none;
}

.modern-sidebar.collapsed .modern-item :deep(.v-list-item-title) {
  display: none;
}

.modern-sidebar.collapsed .modern-item :deep(.v-list-item__content) {
  display: none;
}

.modern-sidebar.collapsed .modern-item :deep(.v-icon) {
  color: #64748b;
}

.modern-sidebar.collapsed .modern-item.v-list-item--active {
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.16),
    rgba(59, 130, 246, 0.22)
  );
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.18);
}

.modern-sidebar.collapsed .modern-item.v-list-item--active :deep(.v-icon) {
  color: #2563eb;
}

.modern-sidebar.collapsed .modern-item :deep(.v-list-item__prepend .v-icon) {
  margin: 0;
}

.modern-sidebar.collapsed .modern-item:not(.v-list-item--active):hover {
  background: rgba(37, 99, 235, 0.08);
}

.modern-sidebar.collapsed
  .modern-item:not(.v-list-item--active):hover
  :deep(.v-icon) {
  color: #2563eb;
}
</style>
