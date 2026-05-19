import type { FastifyReply, FastifyRequest } from "fastify";
import * as pricingService from "./pricing.service.js";

// ─── Groups ──────────────────────────────────────────────────────────────────

export async function listGroupsHandler(
  _req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send(await pricingService.listGroups());
}

export async function getGroupHandler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string };
  return reply.send(await pricingService.getGroup(id));
}

export async function createGroupHandler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { name } = req.body as { name: string };
  return reply.status(201).send(await pricingService.createGroup(name));
}

export async function updateGroupHandler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string };
  const { name } = req.body as { name: string };
  return reply.send(await pricingService.updateGroup(id, name));
}

export async function deleteGroupHandler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string };
  await pricingService.deleteGroup(id);
  return reply.status(204).send();
}

export async function addItemToGroupHandler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id, itemId } = req.params as { id: string; itemId: string };
  return reply.send(await pricingService.addItemToGroup(id, itemId));
}

export async function removeItemFromGroupHandler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id, itemId } = req.params as { id: string; itemId: string };
  await pricingService.removeItemFromGroup(id, itemId);
  return reply.status(204).send();
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function listItemsHandler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { groupId } = req.query as { groupId?: string };
  return reply.send(await pricingService.listItems(groupId));
}

export async function getItemHandler(req: FastifyRequest, reply: FastifyReply) {
  const { id } = req.params as { id: string };
  return reply.send(await pricingService.getItem(id));
}

export async function createItemHandler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  return reply
    .status(201)
    .send(await pricingService.createItem(req.body as never));
}

export async function updateItemHandler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string };
  return reply.send(await pricingService.updateItem(id, req.body as never));
}

export async function deleteItemHandler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = req.params as { id: string };
  await pricingService.deleteItem(id);
  return reply.status(204).send();
}

// ─── Calculate ────────────────────────────────────────────────────────────────

export async function calculateHandler(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  const body = req.body as {
    productId: string;
    selectedItemIds: string[];
    context: unknown;
  };
  return reply.send(
    await pricingService.calculatePrice(
      body.productId,
      body.selectedItemIds,
      body.context,
    ),
  );
}
