import Database from "@ioc:Adonis/Lucid/Database";
import { test } from "@japa/runner";

import { VideoFactory, UserFactory } from "Database/factories";

test.group("Videos destroy", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("should return unauthorized when not logged", async ({ client }) => {
    const response = await client.delete("api/v1/videos/any");

    response.assertStatus(401);
  });

  test("should return not found when video not exists", async ({ client }) => {
    const user = await UserFactory.create();

    const response = await client.delete("api/v1/videos/any").loginAs(user);

    response.assertStatus(404);
    response.assertBody({ error: "Video not found" });
  });

  test("should return unauthorized when logged in user is not the course owner", async ({
    client,
  }) => {
    const user = await UserFactory.create();
    const video = await VideoFactory.with("section", 1, (section) =>
      section.with("course", 1, (course) => course.with("owner"))
    ).create();

    const response = await client
      .delete(`api/v1/videos/${video.id}`)
      .loginAs(user);

    response.assertStatus(401);
    response.assertBody({ error: "Unauthorized" });
  });

  test("should return no content status when video deleted", async ({
    client,
  }) => {
    const video = await VideoFactory.with("section", 1, (section) =>
      section.with("course", 1, (course) => course.with("owner"))
    ).create();

    const response = await client
      .delete(`api/v1/videos/${video.id}`)
      .loginAs(video.section.course.owner);

    response.assertStatus(204);
  });
});
