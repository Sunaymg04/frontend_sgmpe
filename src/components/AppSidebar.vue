<template>
  <v-navigation-drawer v-model="drawer" app color="grey-lighten-4">
    <v-list nav density="comfortable">
      <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/" />

      <v-list-item
        prepend-icon="mdi-shape-outline"
        title="Estructura Curricular"
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
