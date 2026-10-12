
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Solo permitimos consultar la ruta /paises.
    if (request.method !== "GET" || url.pathname !== "/paises") {
      return Response.json(
        { error: "Ruta no encontrada" },
        { status: 404 }
      );
    }

    // La clave se guarda en Cloudflare, no en GitHub.
    if (!env.REST_COUNTRIES_API_KEY) {
      return Response.json(
        { error: "Falta configurar la clave de la API" },
        { status: 500 }
      );
    }

    try {
      const respuesta = await fetch(
        "https://api.restcountries.com/countries/v5/all",
        {
          headers: {
            Authorization: `Bearer ${env.REST_COUNTRIES_API_KEY}`,
            Accept: "application/json"
          }
        }
      );

      const contenido = await respuesta.text();

      return new Response(contenido, {
        status: respuesta.status,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": respuesta.ok
            ? "public, max-age=3600"
            : "no-store"
        }
      );
    } catch (error) {
      return Response.json(
        { error: "No se pudo conectar con REST Countries" },
        { status: 502 }
      );
    }
  }
};
