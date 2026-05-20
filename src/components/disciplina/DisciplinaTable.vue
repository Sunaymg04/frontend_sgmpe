<template>
  <v-card class="modern-table">
    <v-data-table
      :headers="headers"
      :items="disciplinasFiltradas"
      :loading="loading"
      class="elevation-1"
    >
      <template v-slot:[`item.curriculos`]="{ item }">
        <v-chip
          v-for="c in item.nombresCurriculos"
          :key="c"
          class="ma-1"
          color="primary"
          size="small"
        >
          {{ c }}
        </v-chip>
      </template>

      <template v-slot:[`item.acciones`]="{ item }">
        <v-btn
          icon
          color="primary"
          variant="text"
          @click="$emit('editar', item)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <v-btn icon color="red" variant="text" @click="$emit('eliminar', item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import api from "@/services/api";
export default {
  props: {
    search: String,
  },
  data() {
    return {
      disciplinas: [],
      loading: false,
      headers: [
        { title: "Código", key: "id" },
        { title: "Nombre de la disciplina", key: "nombre" },
        { title: "Fondo de Tiempo", key: "fondo_tiempo" },
        { title: "Currículos", key: "curriculos" },
        { title: "Acciones", key: "acciones", sortable: false },
      ],
    };
  },
  computed: {
    // 🔥 FILTRO AQUÍ (NO EN EL LISTVIEW)
    disciplinasFiltradas() {
      if (!this.search) return this.disciplinas;

      return this.disciplinas.filter(
        (d) =>
          d.nombre.toLowerCase().includes(this.search.toLowerCase()) ||
          String(d.id).includes(this.search)
      );
    },
  },
  methods: {
    async obtenerDisciplinas() {
      try {
        this.loading = true;
        const [resDis, resCur, resRel] = await Promise.all([
          api.get("/disciplina"),
          api.get("/curriculo"),
          api.get("/curriculo_disciplina"),
        ]);
        const disciplinas = resDis.data.data;
        const curriculos = resCur.data.data;
        const relaciones = resRel.data.data;
        const mapaCurriculos = {};
        curriculos.forEach((c) => {
          mapaCurriculos[c.id] = c.nombre;
        });

        this.disciplinas = disciplinas.map((d) => {
          const rel = relaciones.filter((r) => r.id_disciplina === d.id);

          const nombresCurriculos = rel.map(
            (r) => mapaCurriculos[r.id_curriculo]
          );

          return {
            ...d,
            nombresCurriculos,
          };
        });

        console.log(this.disciplinas);
      } catch (error) {
        console.error("Error al cargar disciplinas:", error);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.obtenerDisciplinas();
  },
};
</script>
<style scoped>
.modern-table {
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
.modern-table :deep(th) {
  font-weight: 700;
  color: #0f172a;
  font-size: 13.5px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.modern-table :deep(thead) {
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}
</style>
