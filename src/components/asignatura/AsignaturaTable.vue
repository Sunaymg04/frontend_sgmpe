<template>
  <v-card class="modern-table">
    <v-data-table
      :headers="headers"
      :items="asignaturasFiltradas"
      :loading="loading"
      class="elevation-1"
    >
      <template v-slot:[`item.disciplinas`]="{ item }">
        <v-chip
          v-for="d in item.disciplinas"
          :key="d"
          class="ma-1"
          color="primary"
          size="small"
        >
          {{ d }}
        </v-chip>
      </template>
      <template v-slot:[`item.ano`]="{ item }">
        <v-chip
          v-for="a in item.ano"
          :key="a"
          class="ma-1"
          color="secondary"
          size="small"
        >
          {{ a }}
        </v-chip>
      </template>
      <template v-slot:[`item.programa`]="{ item }">
        <v-chip
          v-for="p in item.programa"
          :key="p"
          class="ma-1"
          color="green"
          size="small"
        >
          {{ p }}
        </v-chip>
      </template>
      <template v-slot:[`item.acciones`]="{ item }">
        <div class="acciones-btns">
          <v-btn
            icon
            color="primary"
            variant="text"
            @click="$emit('editar', item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>

          <v-btn
            icon
            color="red"
            variant="text"
            @click="$emit('eliminar', item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
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
      asignaturas: [],
      loading: false,
      headers: [
        { title: "Código", key: "id" },
        { title: "Nombre de la asignatura", key: "nombre" },
        { title: "Fondo de tiempo", key: "fondo_tiempo" },
        { title: "Disciplina", key: "disciplinas" },
        { title: "Año", key: "ano" },
        { title: "Programa de Formación", key: "programa" },
        { title: "Acciones", key: "acciones", sortable: false },
      ],
    };
  },
  computed: {
    // 🔥 FILTRO AQUÍ (NO EN EL LISTVIEW)
    asignaturasFiltradas() {
      if (!this.search) return this.asignaturas;

      return this.asignaturas.filter(
        (a) =>
          a.nombre.toLowerCase().includes(this.search.toLowerCase()) ||
          String(a.id).includes(this.search)
      );
    },
  },
  methods: {
    async obtenerAsignaturas() {
      try {
        this.loading = true;
        const [resAsig, resDis, resRel, resAsigAno, resAno, resProg] =
          await Promise.all([
            api.get("/asignatura"),
            api.get("/disciplina"),
            api.get("/disciplina_asignatura"),
            api.get("/asignaturaAgno"),
            api.get("/a_academico"),
            api.get("/progForm"),
          ]);
        const asignaturas = resAsig.data.data;
        const disciplinas = resDis.data.data;
        const relaciones = resRel.data.data;
        const asignaturaAno = resAsigAno.data.data;
        const anos = resAno.data.data;
        const programas = resProg.data.data;
        const mapaDisciplinas = {};
        disciplinas.forEach((d) => {
          mapaDisciplinas[d.id] = d.nombre;
        });
        const mapaAno = {};
        anos.forEach((a) => {
          mapaAno[a.id] = {
            nombre: a.identificador,
            id_prog_form: a.id_prog_form,
          };
        });
        const mapaPrograma = {};
        programas.forEach((p) => {
          mapaPrograma[p.id] = p.nombre;
        });

        this.asignaturas = asignaturas.map((a) => {
          const rel = relaciones.filter((r) => r.id_asignatura === a.id);

          const nombresDisciplinas = rel.map(
            (r) => mapaDisciplinas[r.id_disciplina]
          );
          const relAno = asignaturaAno.filter((r) => r.id_asignatura === a.id);

          const nombresAnos = [];
          const nombresProgramas = [];
          relAno.forEach((r) => {
            const ano = mapaAno[r.id_a_academico];

            if (ano) {
              nombresAnos.push(ano.nombre);

              nombresProgramas.push(mapaPrograma[ano.id_prog_form] || "");
            }
          });

          return {
            ...a,
            disciplinas: nombresDisciplinas,
            ano: nombresAnos,
            programa: nombresProgramas,
          };
        });

        console.log(this.asignaturas);
      } catch (error) {
        console.error("Error al cargar asignaturas:", error);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.obtenerAsignaturas();
  },
};
</script>
<style scoped>
.modern-table {
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
.modern-table :depp(th) {
  font-weight: 700;
  color: #0f172a;
  font-size: 13.5px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.modern-table :deep(thead) {
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
}
.acciones-btns {
  display: flex;
  align-items: center;
  gap: 4px; /* espacio entre botones */
  flex-wrap: nowrap; /* 🔥 clave para que no bajen */
}
</style>
