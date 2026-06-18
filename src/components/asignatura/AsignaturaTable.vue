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
          v-for="d in item.nombresDisciplinas"
          :key="d"
          class="ma-1"
          color="primary"
          size="small"
        >
          {{ d }}
        </v-chip>
      </template>
      <template v-slot:[`item.anoPrograma`]="{ item }">
        <div class="ano-programa-wrap">
          <div
            v-for="(ap, idx) in item.anoPrograma"
            :key="`${ap.ano}-${ap.programa}-${idx}`"
            class="ano-programa-pair"
          >
            <v-chip class="ma-1" color="secondary" size="small">
              {{ ap.ano }}
            </v-chip>
            <v-chip class="ma-1" color="green" size="small">
              {{ ap.programa }}
            </v-chip>
          </div>
        </div>
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
      contextoDepartamento: null,
      loading: false,
      headers: [
        { title: "Código", key: "id" },
        { title: "Nombre de la asignatura", key: "nombre" },
        { title: "Total", key: "fondo_tiempo" },
        { title: "Clase", key: "horas_clase" },
        { title: "Práctica laboral", key: "horas_practica_laboral" },
        { title: "Examen final", key: "examenFinal" },
        { title: "Trabajo curso", key: "trabajoCurso" },
        { title: "Disciplina", key: "disciplinas" },
        { title: "Año / Programa de Formación", key: "anoPrograma" },
        { title: "Acciones", key: "acciones", sortable: false },
      ],
    };
  },
  computed: {
    // 🔥 FILTRO AQUÍ (NO EN EL LISTVIEW)
    asignaturasFiltradas() {
      if (!this.search) return this.asignaturas;

      const needle = this.search.toLowerCase();

      return this.asignaturas.filter((a) =>
        [a.nombre, a.id, ...this.normalizeList(a.programa)]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    },
  },
  methods: {
    async obtenerAsignaturas() {
      try {
        this.loading = true;
        this.contextoDepartamento = await this.cargarContextoDepartamento();
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

        this.asignaturas = asignaturas
          .filter(
            (a) =>
              !this.contextoDepartamento ||
              this.contextoDepartamento.asignaturaIds.has(Number(a.id))
          )
          .map((a) => {
            const rel = relaciones.filter((r) => r.id_asignatura === a.id);

            const nombresDisciplinas = rel.map(
              (r) => mapaDisciplinas[r.id_disciplina]
            );
            const relAno = asignaturaAno.filter((r) => {
              if (r.id_asignatura !== a.id) return false;
              if (!this.contextoDepartamento) return true;

              const ano = mapaAno[r.id_a_academico];
              return this.contextoDepartamento.programaIds.includes(
                Number(ano?.id_prog_form)
              );
            });

            const nombresAnos = [];
            const nombresProgramas = [];
            const anoPrograma = [];
            relAno.forEach((r) => {
              const ano = mapaAno[r.id_a_academico];

              if (ano) {
                nombresAnos.push(ano.nombre);

                const programa = mapaPrograma[ano.id_prog_form] || "";
                nombresProgramas.push(programa);
                anoPrograma.push({ ano: ano.nombre, programa });
              }
            });

            return {
              ...a,
              nombresDisciplinas,
              ano: nombresAnos,
              programa: nombresProgramas,
              anoPrograma,
              examenFinal: this.toBooleanFlag(a.tiene_examen_final)
                ? "Sí"
                : "No",
              trabajoCurso: this.toBooleanFlag(a.tiene_trabajo_curso)
                ? "Sí"
                : "No",
            };
          });

        console.log(this.asignaturas);
      } catch (error) {
        console.error("Error al cargar asignaturas:", error);
      } finally {
        this.loading = false;
      }
    },
    toBooleanFlag(value) {
      return value === true || value === 1 || value === "1";
    },
    normalizeList(payload) {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    getDepartmentId() {
      const access = this.$store.getters.authAccess || [];
      const jefe = access.find(
        (item) => item?.active && item?.role === "jefe_departamento"
      );
      return jefe?.departamento_id ?? jefe?.id_departamento ?? null;
    },
    async cargarContextoDepartamento() {
      const departmentId = this.getDepartmentId();
      if (!departmentId) return null;

      const carrerasRes = await api.get(
        `/departamento/${departmentId}/carreras`
      );
      const programaIds = this.normalizeList(carrerasRes.data).map((programa) =>
        Number(programa.id)
      );
      const estructuras = await Promise.all(
        programaIds.map((id) =>
          api.get(`/progForm/${id}/estructura-curricular`).catch(() => ({
            data: [],
          }))
        )
      );
      const asignaturaIds = new Set();

      estructuras.forEach((response) => {
        this.normalizeList(response.data).forEach((curriculo) => {
          this.normalizeList(curriculo.disciplinas).forEach((disciplina) => {
            this.normalizeList(disciplina.asignaturas).forEach((asignatura) => {
              asignaturaIds.add(Number(asignatura.id));
            });
          });
        });
      });

      return { programaIds, asignaturaIds };
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
.ano-programa-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ano-programa-pair {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.acciones-btns {
  display: flex;
  align-items: center;
  gap: 4px; /* espacio entre botones */
  flex-wrap: nowrap; /* 🔥 clave para que no bajen */
}
</style>
