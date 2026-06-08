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
      :asignatura="asignaturaEditar"
      @cerrado="asignaturaEditar = null"
      @guardado="asignaturaGuardada"
      @error="mostrarError"
    />

    <!-- Confirmacion eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="520">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon class="mr-2" color="red">mdi-alert-circle-outline</v-icon>
          Confirmar eliminacion
        </v-card-title>

        <v-card-text class="pt-2">
          Desea eliminar la asignatura actual?
          <div v-if="asignaturaEliminar?.nombre" class="mt-2 text-body-2">
            <strong>Asignatura:</strong> {{ asignaturaEliminar.nombre }}
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            color="grey"
            :disabled="eliminando"
            @click="cancelarEliminar"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="red"
            rounded="lg"
            elevation="2"
            :loading="eliminando"
            @click="confirmarEliminar"
          >
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import AsignaturaToolbar from "../../components/asignatura/AsignaturaToolbar.vue";
import AsignaturaTable from "../../components/asignatura/AsignaturaTable.vue";
import AsignaturaForm from "@/components/asignatura/AsignaturaForm.vue";
import api from "@/services/api";

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
      dialogEliminar: false,
      tableKey: 0,
      asignaturaEditar: null,
      asignaturaEliminar: null,
      eliminando: false,
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
      this.registrarActividad(mensaje);
    },

    mostrarError(mensaje) {
      toast.error(mensaje, {
        description: "Ocurrió un problema al guardar",

        duration: 4000,
      });
    },

    editarAsignatura(asignatura) {
      this.asignaturaEditar = asignatura;
      this.dialogCrear = true;
      console.log(asignatura);
    },

    eliminarAsignatura(asignatura) {
      this.asignaturaEliminar = asignatura;
      this.dialogEliminar = true;
    },

    async confirmarEliminar() {
      if (!this.asignaturaEliminar?.id) return;

      try {
        this.eliminando = true;
        const nombre = this.asignaturaEliminar.nombre;
        await api.delete(`/asignatura/${this.asignaturaEliminar.id}`);

        this.dialogEliminar = false;
        this.asignaturaEliminar = null;
        this.recargarTabla();

        toast.success("Asignatura eliminada", {
          description: "La asignatura fue eliminada correctamente",
          duration: 4000,
        });
        this.registrarActividad(`Eliminó la asignatura ${nombre}`);
      } catch (error) {
        console.error(error);
        toast.error("No se pudo eliminar", {
          description: "Ocurrió un problema al eliminar la asignatura",
          duration: 4000,
        });
      } finally {
        this.eliminando = false;
      }
    },

    cancelarEliminar() {
      if (this.eliminando) return;
      this.dialogEliminar = false;
      this.asignaturaEliminar = null;
    },
    registrarActividad(label) {
      this.$store.dispatch("registerActivity", {
        type: "asignatura",
        label,
      });
    },
  },
};
</script>
