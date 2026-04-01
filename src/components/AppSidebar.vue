<template>
  <v-navigation-drawer v-model="drawer" app color="grey-lighten-4">
    <v-list nav density="comfortable">
      <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/" />

      <v-list-item prepend-icon="mdi-calendar" title="Año" to="/anio" />

      <v-list-item
        prepend-icon="mdi-book-open-variant"
        title="Asignatura"
        to="/asignatura"
      />

      <v-list-item
        prepend-icon="mdi-file-document-outline"
        title="Currículo"
        to="/curriculo"
      />

      <v-list-item
        prepend-icon="mdi-shape-outline"
        title="Disciplina"
        to="/disciplina"
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
