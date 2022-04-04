import { client } from "../../src/index";

export const createUser = async (req: any, res: any) => {
  await client
    .query(
      `
        INSERT INTO users ("userName", "firebaseAuthId", "profileImgUrl")
        VALUES ('${req.body.userName}', '${req.body.firebaseAuthId}', '${req.body.profileImgUrl}');
      `
    )
    .then(() => res.send("you have successfully created a user"))
    .catch((e: any) => res.json({ error: e }));
};

export const deleteUserById = async (req: any, res: any) => {
  await client
    .query(
      `
			DELETE FROM users WHERE "userId" = '${req.params.userId}';
		`
    )
    .then(() =>
      res.send("you have successfully deleted a user uid: " + req.params.userId)
    )
    .catch((e: any) => res.json({ error: e }));
};

export const getUserById = async (req: any, res: any) => {
  await client
    .query(
      `
		    SELECT* FROM users WHERE "userId" = '${req.params.userId}';
		  `
    )
    .then((dbRes: any) => {
      if (dbRes.rowCount === 0) res.send("There is no such user");

      if (dbRes.rowCount === 1) res.send(dbRes.rows[0]);

      if (dbRes.rowCount > 1)
        res.send("error occurred, more than one user with the same id");
    })
    .catch((e: any) => res.json({ error: e }));
};

export const updateUserById = async (req: any, res: any) => {
  await client
    .query(
      `
        UPDATE users
        SET "userName" = COALESCE($1, "userName"), "profileImgUrl"= COALESCE($2, "profileImgUrl")
        WHERE "userId" = $3;
      `,
      [req.body.userName, req.body.profileImgUrl, req.params.userId]
    )
    .then(() =>
      res.send("you have successfully update a user uid: " + req.params.userId)
    )
    .catch((e: any) => {
      res.json({ error: e });
    });
};
