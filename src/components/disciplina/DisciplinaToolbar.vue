<template>
  <v-row class="mb-4">
    <v-col cols="6">
      <v-text-field
        label="Buscar por nombre, codigo o programa"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        rounded="lg"
        v-model="searchModel"
      />
    </v-col>

    <v-col cols="6" class="text-right">
      <v-btn color="primary" rounded="x1" elevation="2" @click="$emit('crear')">
        Añadir
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    search: String,
  },

  emits: ["update:search", "crear"],

  computed: {
    searchModel: {
      get() {
        return this.search;
      },
      set(value) {
        this.$emit("update:search", value);
      },
    },
  },
};
</script>
