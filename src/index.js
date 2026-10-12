
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "GET" || url.pathname !== "/paises") {
      return Response.json(
        { error: "Ruta no encontrada" },
        { status: 404 }
      );
    }

    if (!env.REST_COUNTRIES_API_KEY) {
      return Response.json(
        { error: "Falta configurar la clave de la API" },
        { status: 500 }
      );
    }

    try {
      const todosLosPaises = [];
      const limite = 100;
      let offset = 0;
      let hayMas = true;

      while (hayMas) {
        const apiUrl = new URL(
          "https://api.restcountries.com/countries/v5"
        );

        apiUrl.searchParams.set("limit", limite.toString());
        apiUrl.searchParams.set("offset", offset.toString());

        const respuesta = await fetch(apiUrl.toString(), {
          headers: {
            Authorization: `Bearer ${env.REST_COUNTRIES_API_KEY}`,
            Accept: "application/json"
          }
        });

        const contenido = await respuesta.json();

        if (!respuesta.ok) {
          return Response.json(contenido, {
            status: respuesta.status
          });
        }

        const objetos = contenido?.data?.objects;

        if (!Array.isArray(objetos)) {
          throw new Error("Formato inesperado de REST Countries");
        }

        todosLosPaises.push(...objetos);

        hayMas = contenido.data.meta?.more === true;
        offset += objetos.length;

        if (objetos.length === 0) {
          hayMas = false;
        }
      }

      return Response.json(
        {
          data: {
            objects: todosLosPaises,
            meta: {
              total: todosLosPaises.length
            }
          }
        },
        {
          headers: {
            "Cache-Control": "public, max-age=3600"
          }
        }
      );

    } catch (error) {
      return Response.json(
        { error: "No se pudieron cargar los países" },
        { status: 502 }
      );
    }
  }
};
