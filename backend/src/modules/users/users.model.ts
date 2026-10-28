import { database } from "../../database";

type User = {
  id: string;
  username: string;
  passwordHash: string;
  isActive: boolean;
};

export const findUserByUsername = async (
  username: string,
): Promise<User | null> => {
  const result = await database.query(
    `
      SELECT
        id,
        username,
        password_hash AS "passwordHash",
        is_active AS "isActive"
      FROM
        users
      WHERE
        username = $1
    
    `,
    [username],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as User;
};
