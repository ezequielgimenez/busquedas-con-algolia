import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { baseAirtable } from "@/lib/airtable";
import { setLimitOffset } from "@/lib/setLimitOffset";
import { airtableDB } from "@/lib/algolia"; // para la busqueda

export default methods({
  async get(req: NextApiRequest, res: NextApiResponse) {
    const { limit, offset } = setLimitOffset(req);

    const q = req.query.q as string;
    const resultados = await airtableDB.search(q, {
      // hitsPerPage <--   Limita el número de resultados por página
      //page         <--   Obtiene la  página de resultados,empieza en 0
      hitsPerPage: limit,
      page: offset > 1 ? Math.floor(offset / limit) : 0,
    });

    // Ajusta los resultados para simular el offset
    const start = offset % limit; // Calcula el inicio
    //Esto toma los resultados desde el índice 5 hasta el índice 14 (pero como hits solo tiene 10 elementos, solo tomará desde el índice 5 hasta el 9).
    const resultsAjustados = resultados.hits.slice(start, start + limit);

    res.send({
      success: true,
      search: resultsAjustados,
      pagination: {
        offset,
        limit,
        total: resultados.nbHits,
      },
    });
  },
});
