<template>
  <v-container>
    <h2 class="mb-4">Lista de Currículos</h2>

    <CurriculoToolbar v-model:search="search" @crear="crearCurriculo" />

    <CurriculoTable
      :curriculos="curriculosFiltrados"
      @editar="editarCurriculo"
      @eliminar="eliminarCurriculo"
    />
  </v-container>
</template>

<script>
import CurriculoToolbar from "@/components/curriculo/CurriculoToolbar.vue";
import CurriculoTable from "@/components/curriculo/CurriculoTable.vue";

export default {
  components: {
    CurriculoToolbar,
    CurriculoTable,
  },

  data() {
    return {
      search: "",

      curriculos: [
        { id: 1, codigo: "C001", nombre: "Currículo Base", disciplinas: 5 },
        { id: 2, codigo: "C002", nombre: "Currículo Avanzado", disciplinas: 8 },
        {
          id: 3,
          codigo: "C003",
          nombre: "Currículo Experimental",
          disciplinas: 9,
        },
      ],
    };
  },

  computed: {
    curriculosFiltrados() {
      return this.curriculos.filter(
        (c) =>
          c.codigo.toLowerCase().includes(this.search.toLowerCase()) ||
          c.nombre.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },

  methods: {
    crearCurriculo() {
      console.log("Crear currículo");
    },

    editarCurriculo(curriculo) {
      console.log("Editar", curriculo);
    },

    eliminarCurriculo(curriculo) {
      console.log("Eliminar", curriculo);
    },
  },
};
</script>
