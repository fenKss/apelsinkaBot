import SqDatabase from "./db";

const db = new SqDatabase();
(async () => {
    await db.run("DROP TABLE IF EXISTS  user");
    await db.run("create table user\n" +
        "(\n" +
        "    user_id integer not null\n" +
        "        constraint user_pk\n" +
        "            primary key\n" +
        ");\n" +
        "\n" +
        "create unique index user_user_id_uindex\n" +
        "    on user (user_id);\n" +
        "\n");
})();

