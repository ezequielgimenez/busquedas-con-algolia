import type { NextApiRequest, NextApiResponse } from "next";
import methods from "micro-method-router";
import { baseAirtable } from "@/lib/airtable";
import { setLimitOffset } from "@/lib/setLimitOffset";
import { airtableDB } from "@/lib/algolia"; // para guardar

export default methods({
  async get(req: NextApiRequest, res: NextApiResponse) {
    const { limit, offset } = setLimitOffset(req);

    baseAirtable("productos")
      .select({
        maxRecords: limit,
      })
      .eachPage(
        async function page(records, fetchNextPage) {
          const collections = records.map((i) => {
            return {
              objectID: i.id,
              ...i.fields,
            };
          });
          await airtableDB.saveObjects(collections);
          fetchNextPage();
          res.send({
            success: true,
            resultados: collections,
            pagination: {
              limit,
              offset,
              total: collections.length,
            },
          });
        },
        function done(err) {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
  },
});
