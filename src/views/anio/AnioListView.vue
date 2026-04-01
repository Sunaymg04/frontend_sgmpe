<template>
  <v-container>
    <h2 class="mb-4">Lista de Años</h2>

    <AnioToolbar v-model:search="search" @crear="crearAnio" />

    <AnioTable
      :anios="aniosFiltrados"
      @editar="editarAnio"
      @eliminar="eliminarAnio"
    />
  </v-container>
</template>

<script>
import AnioToolbar from "@/components/anio/AnioToolbar.vue";
import AnioTable from "@/components/anio/AnioTable.vue";

export default {
  components: {
    AnioToolbar,
    AnioTable,
  },

  data() {
    return {
      search: "",

      anios: [
        { id: 1, codigo: "Y001", anio: "2020" },
        { id: 2, codigo: "Y002", anio: "2021" },
      ],
    };
  },

  computed: {
    aniosFiltrados() {
      return this.anios.filter(
        (y) =>
          y.codigo.toLowerCase().includes(this.search.toLowerCase()) ||
          y.anio.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },

  methods: {
    crearAnio() {
      console.log("Crear Año");
    },

    editarAnio(anio) {
      console.log("Editar", anio);
    },

    eliminarAnio(anio) {
      console.log("Eliminar", anio);
    },
  },
};
</script>
