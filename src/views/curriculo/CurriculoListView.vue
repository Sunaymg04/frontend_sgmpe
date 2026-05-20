<template>
  <v-container>
    <h2 class="mb-4">Lista de Currículos</h2>

    <CurriculoToolbar v-model:search="search" @crear="crearCurriculo" />

    <CurriculoTable
      :key="tableKey"
      :search="search"
      @editar="editarCurriculo"
      @eliminar="eliminarCurriculo"
    />

    <CurriculoForm
      v-model="dialogCrear"
      :curriculo="curriculoEditar"
      @cerrado="curriculoEditar = null"
      @guardado="curriculoGuardado"
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
          Desea eliminar el curriculo actual?
          <div v-if="curriculoEliminar?.nombre" class="mt-2 text-body-2">
            <strong>Curriculo:</strong> {{ curriculoEliminar.nombre }}
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
import CurriculoToolbar from "@/components/curriculo/CurriculoToolbar.vue";
import CurriculoTable from "@/components/curriculo/CurriculoTable.vue";
import CurriculoForm from "@/components/curriculo/CurriculoForm.vue";
import api from "@/services/api";
import { toast } from "vue-sonner";

export default {
  components: {
    CurriculoToolbar,
    CurriculoTable,
    CurriculoForm,
  },

  data() {
    return {
      search: "",
      dialogCrear: false,
      dialogEliminar: false,
      tableKey: 0,
      curriculoEditar: null,
      curriculoEliminar: null,
      eliminando: false,
    };
  },

  methods: {
    crearCurriculo() {
      this.dialogCrear = true;
    },

    editarCurriculo(curriculo) {
      this.curriculoEditar = curriculo;

      this.dialogCrear = true;
      console.log(curriculo);
    },

    eliminarCurriculo(curriculo) {
      this.curriculoEliminar = curriculo;
      this.dialogEliminar = true;
    },

    async confirmarEliminar() {
      if (!this.curriculoEliminar?.id) return;

      try {
        this.eliminando = true;
        await api.delete(`/curriculo/${this.curriculoEliminar.id}`);

        this.dialogEliminar = false;
        this.curriculoEliminar = null;
        this.recargarTabla();

        toast.success("Currículo eliminado", {
          description: "El currículo fue eliminado correctamente",
          duration: 4000,
        });
      } catch (error) {
        console.error(error);
        toast.error("No se pudo eliminar", {
          description: "Ocurrió un problema al eliminar el currículo",
          duration: 4000,
        });
      } finally {
        this.eliminando = false;
      }
    },

    cancelarEliminar() {
      if (this.eliminando) return;
      this.dialogEliminar = false;
      this.curriculoEliminar = null;
    },

    recargarTabla() {
      this.tableKey++;
    },
    curriculoGuardado(mensaje) {
      this.recargarTabla();

      toast.success(mensaje, {
        description: "El currículo fue creado correctamente",

        duration: 4000,
      });
    },

    mostrarError(mensaje) {
      toast.error(mensaje, {
        description: "Ocurrió un problema al guardar",

        duration: 4000,
      });
    },
  },
};
</script>
<style scoped>
.modern-snackbar {
  backdrop-filter: blur(14px);
}

.modern-snackbar :deep(.v-snackbar__wrapper) {
  border-radius: 18px !important;

  background: rgba(15, 23, 42, 0.92) !important;

  color: white !important;

  border: 1px solid rgba(255, 255, 255, 0.08);

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(59, 130, 246, 0.15);
}
</style>
