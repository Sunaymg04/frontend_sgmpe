<template>
  <v-data-table :headers="headers" :items="disciplinas" class="elevation-1">
    <template v-slot:[`item.curriculos`]="{ item }">
      <v-chip
        v-for="c in item.curriculos"
        :key="c"
        class="ma-1"
        color="primary"
        size="small"
      >
        {{ c }}
      </v-chip>
    </template>

    <template v-slot:[`item.acciones`]="{ item }">
      <v-btn icon color="primary" variant="text" @click="$emit('editar', item)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>

      <v-btn icon color="red" variant="text" @click="$emit('eliminar', item)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
export default {
  props: {
    disciplinas: Array,
  },

  data() {
    return {
      headers: [
        { title: "Código", key: "codigo" },
        { title: "Nombre de la disciplina", key: "nombre" },
        { title: "Fondo de Tiempo", key: "fondoTiempo" },
        { title: "Currículos", key: "curriculos" },
        { title: "Acciones", key: "acciones", sortable: false },
      ],
    };
  },
};
</script>
