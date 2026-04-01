<template>
  <v-container>
    <h2 class="mb-6">Lista de Asignaturas</h2>

    <AsignaturaToolbar v-model:search="search" @crear="crearAsignatura" />

    <AsignaturaTable
      :asignaturas="asignaturasFiltradas"
      @editar="editarAsignatura"
      @eliminar="eliminarAsignatura"
    />
  </v-container>
</template>
<script>
import AsignaturaToolbar from "../../components/asignatura/AsignaturaToolbar.vue";
import AsignaturaTable from "../../components/asignatura/AsignaturaTable.vue";

export default {
  components: {
    AsignaturaToolbar,
    AsignaturaTable,
  },

  data() {
    return {
      search: "",

      asignaturas: [
        {
          id: 1,
          codigo: "A001",
          nombre: "Fundamentos de la Programación",
          fondoTiempo: 80,
          disciplina: "Programacion",
        },
        {
          id: 2,
          codigo: "A002",
          nombre: "Álgebra Lineal",
          fondoTiempo: 72,
          disciplina: "Calculo",
        },
        {
          id: 3,
          codigo: "A003",
          nombre: "Historia de la Ciencia",
          fondoTiempo: 60,
          disciplina: "Ciencia",
        },
      ],
    };
  },

  computed: {
    asignaturasFiltradas() {
      return this.asignaturas.filter(
        (a) =>
          a.codigo.toLowerCase().includes(this.search.toLowerCase()) ||
          a.nombre.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },

  methods: {
    crearAsignatura() {
      console.log("Crear asignatura");
    },

    editarAsignatura(asignatura) {
      console.log("Editar", asignatura);
    },

    eliminarAsignatura(asignatura) {
      console.log("Eliminar", asignatura);
    },
  },
  mounted() {
    console.log("AsignaturaListView montado");
  },
};
</script>
