<template>
  <v-container>
    <h2 class="mb-6">Lista de Asignaturas</h2>

    <AsignaturaToolbar v-model:search="search" @crear="crearAsignatura" />

    <AsignaturaTable
      :key="tableKey"
      :search="search"
      @editar="editarAsignatura"
      @eliminar="eliminarAsignatura"
    />
    <AsignaturaForm
      v-model="dialogCrear"
      @guardado="asignaturaGuardada"
      @error="mostrarError"
    />
  </v-container>
</template>
<script>
import AsignaturaToolbar from "../../components/asignatura/AsignaturaToolbar.vue";
import AsignaturaTable from "../../components/asignatura/AsignaturaTable.vue";
import AsignaturaForm from "@/components/asignatura/AsignaturaForm.vue";

import { toast } from "vue-sonner";

export default {
  components: {
    AsignaturaToolbar,
    AsignaturaTable,
    AsignaturaForm,
  },

  data() {
    return {
      search: "",
      dialogCrear: false,
      tableKey: 0,
    };
  },

  methods: {
    crearAsignatura() {
      this.dialogCrear = true;
    },
    recargarTabla() {
      this.tableKey++;
    },

    asignaturaGuardada(mensaje) {
      this.recargarTabla();

      toast.success(mensaje, {
        description: "La asignatura fue creada correctamente",

        duration: 4000,
      });
    },

    mostrarError(mensaje) {
      toast.error(mensaje, {
        description: "Ocurrió un problema al guardar",

        duration: 4000,
      });
    },

    editarAsignatura(asignatura) {
      console.log("Editar", asignatura);
    },

    eliminarAsignatura(asignatura) {
      console.log("Eliminar", asignatura);
    },
  },
};
</script>
