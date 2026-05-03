import { Elysia } from "elysia";
import { listRoomsController } from "./list-rooms.controllers";

export const listRoomsRoute = new Elysia().get("/rooms", () => {
  return listRoomsController();
});
