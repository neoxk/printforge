import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middleware/authenticate.js";
import {
  listGroupsHandler,
  getGroupHandler,
  createGroupHandler,
  updateGroupHandler,
  deleteGroupHandler,
  addItemToGroupHandler,
  removeItemFromGroupHandler,
  listItemsHandler,
  getItemHandler,
  createItemHandler,
  updateItemHandler,
  deleteItemHandler,
  calculateHandler,
} from "./pricing.controller.js";
import {
  groupIdParam,
  groupItemParams,
  createGroupBody,
  updateGroupBody,
  itemIdParam,
  createItemBody,
  updateItemBody,
  listItemsQuery,
  calculateBody,
} from "./pricing.schema.js";

export async function pricingRoutes(app: FastifyInstance) {
  // Groups
  app.get("/groups", { preHandler: authenticate }, listGroupsHandler);
  app.post(
    "/groups",
    { preHandler: authenticate, schema: { body: createGroupBody } },
    createGroupHandler,
  );
  app.get(
    "/groups/:id",
    { preHandler: authenticate, schema: { params: groupIdParam } },
    getGroupHandler,
  );
  app.put(
    "/groups/:id",
    {
      preHandler: authenticate,
      schema: { params: groupIdParam, body: updateGroupBody },
    },
    updateGroupHandler,
  );
  app.delete(
    "/groups/:id",
    { preHandler: authenticate, schema: { params: groupIdParam } },
    deleteGroupHandler,
  );
  app.post(
    "/groups/:id/items/:itemId",
    { preHandler: authenticate, schema: { params: groupItemParams } },
    addItemToGroupHandler,
  );
  app.delete(
    "/groups/:id/items/:itemId",
    { preHandler: authenticate, schema: { params: groupItemParams } },
    removeItemFromGroupHandler,
  );

  // Items
  app.get(
    "/items",
    { preHandler: authenticate, schema: { querystring: listItemsQuery } },
    listItemsHandler,
  );
  app.post(
    "/items",
    { preHandler: authenticate, schema: { body: createItemBody } },
    createItemHandler,
  );
  app.get(
    "/items/:id",
    { preHandler: authenticate, schema: { params: itemIdParam } },
    getItemHandler,
  );
  app.put(
    "/items/:id",
    {
      preHandler: authenticate,
      schema: { params: itemIdParam, body: updateItemBody },
    },
    updateItemHandler,
  );
  app.delete(
    "/items/:id",
    { preHandler: authenticate, schema: { params: itemIdParam } },
    deleteItemHandler,
  );

  // Calculate (public — called by configurator iframe)
  app.post("/calculate", { schema: { body: calculateBody } }, calculateHandler);
}
