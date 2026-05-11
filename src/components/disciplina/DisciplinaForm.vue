<template>
  <v-dialog
    v-model="dialog"
    max-width="650"
    transition="dialog-bottom-transition"
  >
    <v-card class="rounded-xl pa-2">
      <!-- Header -->
      <v-card-title class="text-h5 font-weight-bold d-flex align-center">
        <v-icon class="mr-2" color="primary">
          mdi-book-open-page-variant
        </v-icon>

        Crear Disciplina
      </v-card-title>

      <!-- Form -->
      <v-card-text>
        <v-form>
          <!-- Nombre -->
          <v-text-field
            v-model="form.nombre"
            label="Nombre de la disciplina"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-book-outline"
            class="mb-4"
          />

          <!-- Fondo tiempo -->
          <v-text-field
            v-model="form.fondo_tiempo"
            label="Fondo de tiempo"
            type="number"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-timer-outline"
            class="mb-4"
          />

          <!-- Curriculo -->
          <v-select
            v-model="form.id_curriculo"
            :items="curriculos"
            item-title="nombre"
            item-value="id"
            label="Currículos"
            variant="outlined"
            rounded="lg"
            prepend-inner-icon="mdi-school-outline"
            multiple
            chips
          />
        </v-form>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn variant="text" color="grey" @click="cerrar"> Cancelar </v-btn>

        <v-btn color="primary" rounded="lg" elevation="2" @click="guardar">
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from "@/services/api";

export default {
  props: {
    modelValue: Boolean,
  },

  emits: ["update:modelValue", "guardado", "error"],

  data() {
    return {
      curriculos: [],

      form: {
        nombre: "",
        fondo_tiempo: "",
        id_curriculo: [],
      },
    };
  },

  computed: {
    dialog: {
      get() {
        return this.modelValue;
      },

      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },

  methods: {
    async obtenerCurriculos() {
      try {
        const res = await api.get("/curriculo");

        this.curriculos = res.data.data;
      } catch (error) {
        console.error(error);
      }
    },

    async guardar() {
      try {
        await api.post("/disciplina", this.form);

        this.cerrar();

        this.$nextTick(() => {
          this.$emit("guardado", "Disciplina creada correctamente");
        });
      } catch (error) {
        console.error(error);

        this.$emit("error", "No se pudo crear la disciplina");
      }
    },

    cerrar() {
      this.dialog = false;

      this.form = {
        nombre: "",
        fondo_tiempo: "",
        id_curriculo: [],
      };
    },
  },

  mounted() {
    this.obtenerCurriculos();
  },
};
</script>
