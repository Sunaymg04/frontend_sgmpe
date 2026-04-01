<template>
  <v-data-table :headers="headers" :items="curriculos" class="elevation-1">
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
    curriculos: Array,
  },

  data() {
    return {
      headers: [
        { title: "Código", key: "codigo" },
        { title: "Nombre del currículo", key: "nombre" },
        { title: "Disciplinas", key: "disciplinas" },
        { title: "Acciones", key: "acciones", sortable: false },
      ],
    };
  },
};
</script>
